import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('html')
export class HtmlController {
  private readonly HTML_DIR = path.join(process.cwd(), '..', 'html');

  @Get(':filename')
  async serveHtml(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.HTML_DIR, safeFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('HTML file not found');
    }

    // Check if it's actually a file (not a directory)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new NotFoundException('Invalid file path');
    }

    // Only allow .html files
    if (!safeFilename.endsWith('.html')) {
      throw new NotFoundException('Only HTML files are allowed');
    }

    // Set proper content type
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send the file
    res.sendFile(filePath);
  }
}

