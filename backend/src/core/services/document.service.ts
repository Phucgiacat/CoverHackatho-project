import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { LoggerUtil } from '../utils/logger.util';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class DocumentService {
  private readonly PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:8000';

  @InjectRepository(Document)
  private readonly documentRepository: Repository<Document>;

  @Inject(LoggerUtil)
  private readonly logger: LoggerUtil;

  async uploadDocument(file: Express.Multer.File): Promise<Document> {
    this.logger.info('Starting document upload', {
      filename: file.originalname,
      size: file.size,
    });

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    try {
      // Create form data to send to Python server
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: 'application/pdf',
      });

      this.logger.debug('Calling Python server for PDF parsing', {
        url: `${this.PYTHON_SERVER_URL}/parse`,
      });

      // Call Python server to parse PDF
      const response = await axios.post(
        `${this.PYTHON_SERVER_URL}/parse`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          params: {
            return_markdown: false, // We'll download separately if needed
          },
          timeout: 120000, // 2 minutes timeout
        },
      );

      const parseResult = response.data;

      this.logger.debug('PDF parsing completed', {
        markdownFilename: parseResult.markdown_filename,
        bytes: parseResult.bytes,
      });

      // Save document metadata to database
      const document = this.documentRepository.create({
        originalFilename: parseResult.original_filename,
        markdownFilename: parseResult.markdown_filename,
        markdownPath: parseResult.download_url,
        fileSize: parseResult.bytes,
      });

      await this.documentRepository.save(document);

      this.logger.info('Document uploaded and processed successfully', {
        documentId: document.id,
        filename: document.originalFilename,
      });

      // Clean up uploaded file
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        this.logger.warn('Failed to clean up temporary file', { path: file.path });
      }

      return document;
    } catch (error) {
      this.logger.error('Failed to upload document', {
        filename: file.originalname,
        error: error.message,
      });

      // Clean up uploaded file on error
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // Ignore cleanup errors
      }

      if (axios.isAxiosError(error)) {
        throw new InternalServerErrorException(
          `Failed to parse PDF: ${error.response?.data?.detail || error.message}`,
        );
      }

      throw new InternalServerErrorException('Failed to process document');
    }
  }

  async getDocuments(): Promise<Document[]> {
    return this.documentRepository.find({
      order: {
        uploadedAt: 'DESC',
      },
    });
  }

  async getDocument(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.getDocument(id);
    
    this.logger.info('Deleting document', {
      documentId: id,
      filename: document.originalFilename,
    });

    await this.documentRepository.remove(document);
  }
}

