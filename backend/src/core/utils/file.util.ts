import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LoggerUtil } from './logger.util';

@Injectable()
export class FileUtil {
  constructor(private readonly logger: LoggerUtil) {}

  /**
   * Read all markdown files from a folder
   * @param folderPath Path to the folder
   * @returns Array of markdown filenames
   */
  async readMarkdownFiles(folderPath: string): Promise<string[]> {
    try {
      this.logger.debug('Reading markdown files', { folderPath });
      const files = await fs.readdir(folderPath);
      const markdownFiles = files.filter((file) => file.endsWith('.md'));
      this.logger.debug('Markdown files found', { count: markdownFiles.length });
      return markdownFiles;
    } catch (error) {
      this.logger.error('Failed to read markdown files', error, { folderPath });
      throw error;
    }
  }

  /**
   * Read content of a file
   * @param filePath Full path to the file
   * @returns File content as string
   */
  async readFileContent(filePath: string): Promise<string> {
    try {
      this.logger.debug('Reading file', { filePath });
      const content = await fs.readFile(filePath, 'utf-8');
      this.logger.debug('File read successfully', { 
        filePath, 
        contentLength: content.length 
      });
      return content;
    } catch (error) {
      this.logger.error('Failed to read file', error, { filePath });
      throw error;
    }
  }

  /**
   * Ensure a directory exists, create it if it doesn't
   * @param dirPath Path to the directory
   */
  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      this.logger.debug('Ensuring directory exists', { dirPath });
      await fs.mkdir(dirPath, { recursive: true });
      this.logger.debug('Directory ready', { dirPath });
    } catch (error) {
      this.logger.error('Failed to create directory', error, { dirPath });
      throw error;
    }
  }

  /**
   * Save content to a file
   * @param filePath Full path to the file
   * @param content Content to save
   */
  async saveFile(filePath: string, content: string): Promise<void> {
    try {
      this.logger.debug('Saving file', { filePath, contentLength: content.length });
      await fs.writeFile(filePath, content, 'utf-8');
      this.logger.info('File saved successfully', { filePath });
    } catch (error) {
      this.logger.error('Failed to save file', error, { filePath });
      throw error;
    }
  }

  /**
   * Get the full path to a file
   * @param folderPath Base folder path
   * @param filename Filename
   * @returns Full path to the file
   */
  getFilePath(folderPath: string, filename: string): string {
    return path.join(folderPath, filename);
  }

  /**
   * Get the markdown folder path relative to a service
   * @param servicePath Usually __dirname from the service
   * @returns Absolute path to the markdown folder
   */
  getMarkdownFolderPath(servicePath: string): string {
    return path.resolve(servicePath, '../../../../mardow_folder');
  }

  /**
   * Get the HTML output folder path relative to a service
   * @param servicePath Usually __dirname from the service
   * @returns Absolute path to the HTML folder
   */
  getHtmlFolderPath(servicePath: string): string {
    return path.resolve(servicePath, '../../../../html');
  }
}

