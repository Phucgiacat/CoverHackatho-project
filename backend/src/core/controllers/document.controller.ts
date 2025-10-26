import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from '../services/document.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('documents')
export class DocumentController {
  @Inject(DocumentService)
  private readonly documentService: DocumentService;

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const document = await this.documentService.uploadDocument(file);
    
    return {
      success: true,
      document: {
        id: document.id,
        originalFilename: document.originalFilename,
        markdownFilename: document.markdownFilename,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
      },
    };
  }

  @Get()
  async getDocuments() {
    const documents = await this.documentService.getDocuments();
    return {
      documents: documents.map((doc) => ({
        id: doc.id,
        originalFilename: doc.originalFilename,
        markdownFilename: doc.markdownFilename,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
      })),
    };
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    const document = await this.documentService.getDocument(id);
    return {
      document: {
        id: document.id,
        originalFilename: document.originalFilename,
        markdownFilename: document.markdownFilename,
        markdownPath: document.markdownPath,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
      },
    };
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    await this.documentService.deleteDocument(id);
    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }
}

