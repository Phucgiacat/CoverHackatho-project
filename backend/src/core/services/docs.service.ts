import { Inject, Injectable } from '@nestjs/common';
import { LlmUtil } from '../utils/llm.util';
import { FileUtil } from '../utils/file.util';
import { LoggerUtil } from '../utils/logger.util';
import { PromptService } from './prompt.service';
import { DocumentContent } from '../dto/chat.dto';

@Injectable()
export class DocsService {

  @Inject(LlmUtil)
  private readonly llm: LlmUtil;

  @Inject(FileUtil)
  private readonly fileUtil: FileUtil;

  @Inject(LoggerUtil)
  private readonly logger: LoggerUtil;

  @Inject(PromptService)
  private readonly promptService: PromptService;

  async summarizeDocs() {
    this.logger.info('Starting document summarization');
    const folderPath = this.fileUtil.getMarkdownFolderPath(__dirname);
    const files = await this.fileUtil.readMarkdownFiles(folderPath);

    this.logger.debug('Summarizing documents', { count: files.length });

    const summaries = await Promise.all(
      files.map(async (fileName) => {
        const filePath = this.fileUtil.getFilePath(folderPath, fileName);
        const content = await this.fileUtil.readFileContent(filePath);

        const prompt = this.promptService.buildDocumentSummaryPrompt(content);
        const summary = await this.llm.generateContent(prompt, 'gemini-flash-lite-latest');

        return {
          fileName,
          summary: summary || 'No summary generated',
        };
      }),
    );

    this.logger.info('Document summarization complete', { count: summaries.length });
    return summaries;
  }

  async generateDashboardPlan(
    filenames: string[],
    query: string,
    conversationContext: string,
  ): Promise<string> {
    this.logger.info('Generating dashboard plan', { fileCount: filenames.length });

    const folderPath = this.fileUtil.getMarkdownFolderPath(__dirname);
    const documents = await this.readDocumentContents(folderPath, filenames);
    const documentContext = this.buildDocumentContext(documents);

    const prompt = this.promptService.buildDashboardPlanPrompt(
      query,
      conversationContext,
      documentContext,
    );

    const plan = await this.llm.generateContent(prompt, 'gemini-2.5-pro');

    this.logger.info('Dashboard plan generated', { planLength: plan.length });
    return plan || 'No plan generated';
  }

  /**
   * Read contents of multiple documents
   */
  private async readDocumentContents(
    folderPath: string,
    filenames: string[],
  ): Promise<DocumentContent[]> {
    return Promise.all(
      filenames.map(async (filename) => {
        const filePath = this.fileUtil.getFilePath(folderPath, filename);
        const content = await this.fileUtil.readFileContent(filePath);
        return { filename, content };
      }),
    );
  }

  /**
   * Build document context string from multiple documents
   */
  private buildDocumentContext(documents: DocumentContent[]): string {
    return documents
      .map((doc) => `Filename: ${doc.filename}\nContent:\n${doc.content}`)
      .join('\n\n---\n\n');
  }

  async savePlanAsHtml(
    filenames: string[],
    question: string,
    plan: string,
  ): Promise<{ success: boolean; filename: string; path: string; message: string }> {
    this.logger.info('Generating HTML from plan', { sourceFiles: filenames });

    const htmlFolderPath = this.fileUtil.getHtmlFolderPath(__dirname);
    await this.fileUtil.ensureDirectoryExists(htmlFolderPath);

    // Read document contents to provide data context
    const folderPath = this.fileUtil.getMarkdownFolderPath(__dirname);
    const documents = await this.readDocumentContents(folderPath, filenames);
    const documentContext = this.buildDocumentContext(documents);

    const prompt = this.promptService.buildHtmlGenerationPrompt(
      filenames.join(', '), 
      question, 
      plan,
      documentContext
    );
    let htmlContent = await this.llm.generateContent(prompt, 'gemini-2.5-pro');

    // Clean up the HTML content - remove conversational preamble and markdown blocks
    htmlContent = this.cleanHtmlContent(htmlContent);

    // Generate output filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
    const outputFilename = `dashboard-plan-${timestamp}.html`;
    const outputFilePath = this.fileUtil.getFilePath(htmlFolderPath, outputFilename);

    // Save HTML file
    await this.fileUtil.saveFile(
      outputFilePath,
      htmlContent || '<html><body>Error generating HTML</body></html>',
    );

    this.logger.info('HTML dashboard saved', { filename: outputFilename });

    return {
      success: true,
      filename: outputFilename,
      path: outputFilePath,
      message: 'Dashboard plan saved as HTML successfully',
    };
  }

  /**
   * Clean HTML content by removing conversational text and markdown blocks
   */
  cleanHtmlContent(content: string): string {
    if (!content) return content;

    // Remove markdown code blocks if present
    // Pattern: ```html\n<content>\n```
    const markdownBlockRegex = /```html\s*\n([\s\S]*?)\n```/;
    const markdownMatch = content.match(markdownBlockRegex);
    
    if (markdownMatch) {
      this.logger.debug('Extracting HTML from markdown block');
      return markdownMatch[1].trim();
    }

    // Try to extract HTML by finding DOCTYPE or <html> tag
    const doctypeIndex = content.indexOf('<!DOCTYPE html>');
    const htmlTagIndex = content.indexOf('<html');
    
    const startIndex = doctypeIndex !== -1 ? doctypeIndex : 
                      htmlTagIndex !== -1 ? htmlTagIndex : -1;

    if (startIndex !== -1 && startIndex > 0) {
      this.logger.debug('Stripping preamble text before HTML', { startIndex });
      // Extract from <!DOCTYPE or <html to the end
      return content.substring(startIndex).trim();
    }

    // Return as-is if no cleaning needed
    return content.trim();
  }
}
