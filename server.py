import os
import uuid
import tempfile
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from llama_parse import LlamaParse

# ========= CẤU HÌNH =========
LLAMA_API_KEY = "llx-a3MgW6v4VGoS17hfASRlu8yMB4f7MLL28XJozsUj4ZQZ7aYS"
STORAGE_DIR = r"D:\learning\my_project\new-project\CoverHackatho-project\mardow_folder"
MAX_FILE_BYTES = int(os.getenv("MAX_FILE_BYTES", 50 * 1024 * 1024))  # 50 MB

os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(title="PDF → Markdown Server (LlamaParse)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========= TIỆN ÍCH =========
def _is_pdf_signature(path: str) -> bool:
    """Kiểm tra magic bytes '%PDF' để chốt đúng PDF, tránh phụ thuộc content_type."""
    try:
        with open(path, "rb") as f:
            sig = f.read(4)
        return sig == b"%PDF"
    except Exception:
        return False


def validate_pdf_upload(upload: UploadFile):
    if not upload.filename:
        raise HTTPException(status_code=400, detail="Thiếu tên file.")
    name_lower = upload.filename.lower()
    # chấp nhận khi có đuôi .pdf hoặc content-type PDF; kiểm magic bytes sau khi lưu tạm
    if not (name_lower.endswith(".pdf") or (upload.content_type or "").endswith("/pdf")):
        # vẫn cho qua bước lưu tạm để kiểm signature; báo lỗi sau
        pass


def save_upload_to_temp(upload: UploadFile, max_bytes: int) -> str:
    """Lưu UploadFile xuống file tạm theo chunk; kiểm soát dung lượng."""
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(tmp_fd)
    total = 0
    try:
        with open(tmp_path, "wb") as out:
            while True:
                chunk = upload.file.read(1024 * 1024)  # 1MB
                if not chunk:
                    break
                total += len(chunk)
                if total > max_bytes:
                    raise HTTPException(status_code=413, detail=f"File vượt quá {max_bytes} bytes.")
                out.write(chunk)
    except Exception:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
        raise
    finally:
        try:
            upload.file.close()
        except Exception:
            pass
    return tmp_path


def parse_pdf_to_markdown(pdf_path: str, out_basename: Optional[str] = None) -> str:
    """Dùng LlamaParse để chuyển PDF → Markdown; trả về đường dẫn .md trong STORAGE_DIR."""
    if not LLAMA_API_KEY:
        raise HTTPException(status_code=500, detail="Thiếu LLAMAPARSE_API_KEY (set biến môi trường).")

    parser = LlamaParse(
        api_key=LLAMA_API_KEY,
        result_type="markdown",
        extract_charts=True,
        auto_mode=True,
        auto_mode_trigger_on_image_in_page=True,
        auto_mode_trigger_on_table_in_page=True,
    )

    job_id = out_basename or uuid.uuid4().hex
    md_filename = f"{job_id}.md"
    md_path = os.path.join(STORAGE_DIR, md_filename)

    extra_info = {"file_name": os.path.basename(pdf_path)}  # tên gốc phục vụ trace/debug

    with open(pdf_path, "rb") as f:
        documents = parser.load_data(f, extra_info=extra_info)

    with open(md_path, "w", encoding="utf-8") as out:
        for doc in documents:
            out.write(getattr(doc, "text", str(doc)))

    return md_path

# ========= ENDPOINTS =========
@app.get("/health", response_class=PlainTextResponse)
def health():
    """Health check nhanh; không lộ key."""
    storage_ok = os.path.isdir(STORAGE_DIR) and os.access(STORAGE_DIR, os.W_OK)
    return f"ok | storage:{'rw' if storage_ok else 'err'}"

@app.post("/parse")
async def parse_endpoint(
    file: UploadFile = File(...),
    return_markdown: bool = Query(False, description="true để trả luôn toàn bộ markdown trong JSON (có thể lớn)")
):
    validate_pdf_upload(file)
    tmp_pdf = save_upload_to_temp(file, MAX_FILE_BYTES)

    # kiểm signature PDF sau khi lưu
    if not _is_pdf_signature(tmp_pdf):
        try:
            os.remove(tmp_pdf)
        except Exception:
            pass
        raise HTTPException(status_code=415, detail="File không phải định dạng PDF hợp lệ.")

    job_id = uuid.uuid4().hex
    original_filename = file.filename

    try:
        md_path = parse_pdf_to_markdown(tmp_pdf, out_basename=job_id)

        size = os.path.getsize(md_path)

        preview_lines = []
        markdown_content = None
        # chỉ đọc 50 dòng preview (hoặc toàn bộ nếu return_markdown=True)
        with open(md_path, "r", encoding="utf-8", errors="ignore") as f:
            if return_markdown:
                markdown_content = f.read()
            else:
                for i, line in enumerate(f):
                    if i >= 50:
                        break
                    preview_lines.append(line.rstrip("\n"))

        data = {
            "id": job_id,
            "original_filename": original_filename,
            "markdown_filename": os.path.basename(md_path),
            "bytes": size,
            "download_url": f"/download/{os.path.basename(md_path)}",
            "preview": None if return_markdown else "\n".join(preview_lines),
        }
        if return_markdown:
            data["markdown"] = markdown_content

        return JSONResponse(content=data, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        # log lỗi tối thiểu; thực tế nên dùng logger
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {e}")
    finally:
        try:
            os.remove(tmp_pdf)
        except Exception:
            pass


@app.get("/download/{markdown_filename}")
def download_endpoint(markdown_filename: str):
    """Tải file .md đã lưu."""
    safe_name = os.path.basename(markdown_filename)
    md_path = os.path.join(STORAGE_DIR, safe_name)
    if not os.path.isfile(md_path):
        raise HTTPException(status_code=404, detail="Không tìm thấy file.")
    return FileResponse(
        md_path,
        media_type="text/markdown; charset=utf-8",
        filename=safe_name,
    )
