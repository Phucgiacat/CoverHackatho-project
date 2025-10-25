import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { LoggerUtil } from './logger.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmUtil {
  private readonly llm: GoogleGenAI;
  private readonly model: string;

  constructor(
    private readonly logger: LoggerUtil,
    private readonly configService: ConfigService,
  ) {
    this.llm = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
    });
    this.model = 'gemini-flash-latest';
  }

  /**
   * Generate content using the LLM
   * @param prompt The prompt to send to the LLM
   * @returns The generated content as a string
   */
  async generateContent(prompt: string, model?: string): Promise<string> {
    this.logger.debug('LLM request', { promptLength: prompt.length });

    try {
      const modelToUse = model || this.model;
      const response = await this.llm.models.generateContent({
        model: modelToUse,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const content = response.text ?? '';
      this.logger.debug('LLM response', { responseLength: content.length });

      return content;
    } catch (error) {
      this.logger.error('LLM generation failed', error);
      throw error;
    }
  }

  /**
   * Generate content with retry logic
   * @param prompt The prompt to send to the LLM
   * @param retries Number of retries if generation fails
   * @returns The generated content as a string
   */
  async generateContentWithRetry(prompt: string, retries: number = 3): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.debug('LLM request attempt', { attempt, retries });
        return await this.generateContent(prompt);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn('LLM attempt failed', { attempt, retries, error: lastError.message });

        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('LLM generation failed after retries');
  }
}

