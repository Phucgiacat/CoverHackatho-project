import { useState, useRef } from 'react';
import { uploadDocument, getDocuments, deleteDocument, type Document } from '../api/chat';
import './FileUpload.css';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.documents);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadDocument(file);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload documents list
      await loadDocuments();

      // Notify parent component
      onUploadSuccess?.();

      alert('File uploaded and processed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const toggleDocuments = async () => {
    if (!showDocuments) {
      await loadDocuments();
    }
    setShowDocuments(!showDocuments);
  };

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <label htmlFor="file-input" className="upload-button">
          {isUploading ? (
            <>
              <span className="spinner" />
              Uploading...
            </>
          ) : (
            <>
              <span className="upload-icon">📄</span>
              Upload PDF
            </>
          )}
        </label>
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={toggleDocuments}
          className="view-documents-button"
        >
          {showDocuments ? 'Hide Documents' : 'View Documents'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {showDocuments && (
        <div className="documents-list">
          <h3>Uploaded Documents</h3>
          {documents.length === 0 ? (
            <p className="empty-message">No documents uploaded yet</p>
          ) : (
            <ul>
              {documents.map((doc) => (
                <li key={doc.id} className="document-item">
                  <div className="document-info">
                    <span className="document-name">{doc.originalFilename}</span>
                    <span className="document-meta">
                      {formatFileSize(doc.fileSize)} • {formatDate(doc.uploadedAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="delete-button"
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

