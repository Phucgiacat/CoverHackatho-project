import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat, Phase } from '../entities/chat.entity';
import { Repository } from 'typeorm';
import { DocsService } from './docs.service';
import { PromptService } from './prompt.service';
import { Message, MessageRole, MessageType } from '../entities/message.entity';
import { LlmUtil } from '../utils/llm.util';
import { FileUtil } from '../utils/file.util';
import { LoggerUtil } from '../utils/logger.util';
import {
  CHAT_CONSTANTS,
  CONFIRMATION_KEYWORDS,
  APPROVAL_KEYWORDS,
  LLM_DETECTION_PHRASES,
} from '../constants/chat.constants';

@Injectable()
export class ChatService {
  @Inject(DocsService)
  private readonly docsService: DocsService;

  @InjectRepository(Message)
  private readonly messageRepository: Repository<Message>;

  @InjectRepository(Chat)
  private readonly chatRepository: Repository<Chat>;

  @Inject(LlmUtil)
  private readonly llm: LlmUtil;

  @Inject(FileUtil)
  private readonly fileUtil: FileUtil;

  @Inject(LoggerUtil)
  private readonly logger: LoggerUtil;

  @Inject(PromptService)
  private readonly promptService: PromptService;

  async createChat() {
    this.logger.info('Creating new chat');

    // Create and save the chat to get an ID
    const chat = this.chatRepository.create({
      messages: [],
      phase: Phase.SUMMARY,
    });
    await this.chatRepository.save(chat);

    this.logger.debug('Chat created', { chatId: chat.id });

    // Generate summary
    const summary = await this.docsService.summarizeDocs();
    const summaryText = summary
      .map((item) => `Filename: ${item.fileName}\nSummary: ${item.summary}`)
      .join('\n\n');

    // Create message with the saved chat
    const message = this.messageRepository.create({
      content: summaryText,
      role: MessageRole.ASSISTANT,
      type: MessageType.SUMMARY,
      chat,
    });
    chat.messages.push(message);
    chat.phase = Phase.QUERY;

    // Save again with the message
    await this.chatRepository.save(chat);

    this.logger.info('Chat initialized with summaries', { chatId: chat.id, phase: Phase.QUERY });
    return chat;
  }

  async ask(chatId: string, question: string) {
    this.logger.info('Processing user question', { chatId, phase: 'loading' });

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });

    if (!chat) {
      this.logger.warn('Chat not found', { chatId });
      throw new NotFoundException('Chat not found');
    }

    this.logger.debug('Chat loaded', {
      chatId,
      phase: chat.phase,
      messageCount: chat.messages.length,
    });

    const message = this.messageRepository.create({
      content: question,
      role: MessageRole.USER,
      type: MessageType.QUERY,
      chat,
    });
    chat.messages.push(message);

    if (chat.phase === Phase.QUERY) {
      // Build full conversation context from all user messages in QUERY phase
      const userQueryMessages = chat.messages
        .filter((m) => m.role === MessageRole.USER && m.type === MessageType.QUERY)
        .map((m) => m.content)
        .join(' ');
      
      const fullQueryContext = userQueryMessages + ' ' + question;

      let relevantFiles: string[] = chat.relevantFiles || [];

      // Read all markdown files from the folder
      const folderPath = this.fileUtil.getMarkdownFolderPath(__dirname);
      const markdownFiles = await this.fileUtil.readMarkdownFiles(folderPath);

      // Scan for relevant files if we don't have any yet
      if (relevantFiles.length === 0) {
        this.logger.debug('Scanning for relevant files', {
          chatId: chat.id,
          availableFiles: markdownFiles.length,
        });

        // Filter relevant documents using LLM with FULL conversation context
        const newRelevantFiles: string[] = [];
        for (const filename of markdownFiles) {
          const filePath = this.fileUtil.getFilePath(folderPath, filename);
          const content = await this.fileUtil.readFileContent(filePath);

          const prompt = this.promptService.buildFileRelevancePrompt(fullQueryContext, content);
          const relevanceResponse = await this.llm.generateContent(prompt, 'gemini-flash-lite-latest');

          if (relevanceResponse?.toLowerCase().trim().includes('yes')) {
            newRelevantFiles.push(filename);
          }
        }

        relevantFiles = newRelevantFiles;
        chat.relevantFiles = relevantFiles;

        this.logger.info('File relevance scan complete', {
          chatId: chat.id,
          relevantFiles: relevantFiles.length,
        });

        // If no relevant files found, inform user
        if (relevantFiles.length === 0) {
          this.logger.warn('No relevant files found', { chatId: chat.id, query: question });

          const noFilesMessage = this.messageRepository.create({
            content: `I couldn't find any documents related to your query among the available files. Could you please rephrase your question or ask about different topics? Available documents are: ${markdownFiles.join(', ')}`,
            role: MessageRole.ASSISTANT,
            type: MessageType.QUERY,
            chat,
          });
          chat.messages.push(noFilesMessage);
          await this.chatRepository.save(chat);
          return {
            message: chat.messages[chat.messages.length - 1],
            suggestedAction: {
              type: 'CONTINUE',
            },
          };
        }
      }

      // Build conversation history (last 10 messages to keep context manageable)
      const conversationHistory = chat.messages
        .slice(-CHAT_CONSTANTS.MAX_CONVERSATION_HISTORY)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      // Ask LLM to analyze and decide next step
      const prompt = this.promptService.buildQueryAnalysisPrompt(
        conversationHistory,
        relevantFiles,
        markdownFiles,
        question,
      );

      const assistantMessage = await this.llm.generateContent(prompt);

      // Check if LLM suggested transition
      const suggestsTransition = this.llmSuggestsTransition(assistantMessage);

      // Check if user is confirming transition from previous suggestion
      const userConfirmsTransition = this.isConfirmationMessage(question);

      // Count messages in QUERY phase to prevent infinite loop
      const queryMessageCount = chat.messages.filter(
        (m) => m.type === MessageType.QUERY,
      ).length;

      // Store context if transition is suggested or we have enough messages
      if (
        suggestsTransition ||
        queryMessageCount >= CHAT_CONSTANTS.MAX_QUERY_MESSAGES - 2
      ) {
        chat.context = question;
      }

      // AUTO-TRANSITION if:
      // 1. User confirms after suggestion, OR
      // 2. Too many messages (force transition to prevent infinite loop)
      // BUT ONLY if we have relevant files!
      const shouldTransition =
        relevantFiles.length > 0 &&
        ((suggestsTransition && userConfirmsTransition) ||
          queryMessageCount >= CHAT_CONSTANTS.MAX_QUERY_MESSAGES);

      if (shouldTransition) {
        this.logger.info('Transitioning to PLAN phase', {
          chatId: chat.id,
          queryMessageCount,
          forced: queryMessageCount >= CHAT_CONSTANTS.MAX_QUERY_MESSAGES,
        });

        // Actually transition to PLAN phase
        chat.phase = Phase.PLAN;

        // Save assistant message
        const responseMessage = this.messageRepository.create({
          content: suggestsTransition
            ? assistantMessage
            : `Based on our discussion, I have enough information to create your dashboard plan. Let me generate it now.`,
          role: MessageRole.ASSISTANT,
          type: MessageType.QUERY,
          chat,
        });
        chat.messages.push(responseMessage);

        await this.chatRepository.save(chat);

        return {
          message: chat.messages[chat.messages.length - 1],
          suggestedAction: {
            type: 'TRANSITION',
            nextPhase: Phase.PLAN,
            message: 'Transitioning to planning phase',
          },
        };
      }

      // Save assistant message
      const responseMessage = this.messageRepository.create({
        content: assistantMessage,
        role: MessageRole.ASSISTANT,
        type: MessageType.QUERY,
        chat,
      });
      chat.messages.push(responseMessage);

      await this.chatRepository.save(chat);
      return {
        message: chat.messages[chat.messages.length - 1],
        suggestedAction: suggestsTransition
          ? {
              type: 'TRANSITION',
              nextPhase: Phase.PLAN,
              prompt: 'Would you like to proceed to planning?',
            }
          : {
              type: 'CONTINUE',
            },
      };
    }

    if (chat.phase === Phase.PLAN) {
      // Check if this is first time in PLAN phase (need to generate plan)
      if (!chat.generatedPlan) {
        // Ensure we have relevant files before generating plan
        if (!chat.relevantFiles || chat.relevantFiles.length === 0) {
          const errorMessage = this.messageRepository.create({
            content: `I couldn't find any relevant documents for your request. Please try asking about different topics or check that the documents are available in the system.`,
            role: MessageRole.ASSISTANT,
            type: MessageType.PLAN,
            chat,
          });
          chat.messages.push(errorMessage);
          chat.phase = Phase.QUERY; // Go back to QUERY phase
          await this.chatRepository.save(chat);
          return {
            message: chat.messages[chat.messages.length - 1],
            suggestedAction: {
              type: 'CONTINUE',
            },
          };
        }

        // Generate the plan using DocsService
        const conversationContext = chat.messages
          .filter((m) => m.type === MessageType.QUERY)
          .map((m) => m.content)
          .join('\n');

        const plan = await this.docsService.generateDashboardPlan(
          chat.relevantFiles,
          chat.context || question,
          conversationContext,
        );

        // Save the plan
        chat.generatedPlan = plan;

        // Save plan as message
        const planMessage = this.messageRepository.create({
          content: `Here's your dashboard plan:\n\n${plan}\n\nWhat do you think? Would you like me to make any changes, or shall we proceed to generate the HTML dashboard?`,
          role: MessageRole.ASSISTANT,
          type: MessageType.PLAN,
          chat,
        });
        chat.messages.push(planMessage);

        await this.chatRepository.save(chat);
        return {
          message: chat.messages[chat.messages.length - 1],
          suggestedAction: {
            type: 'CONTINUE',
          },
        };
      }

      // User is providing feedback on the plan
      const conversationHistory = chat.messages
        .slice(-6)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const prompt = this.promptService.buildPlanReviewPrompt(
        chat.generatedPlan,
        conversationHistory,
        question,
      );

      const assistantMessage = await this.llm.generateContent(prompt);

      // Count messages in PLAN phase to prevent infinite loop
      const planMessageCount = chat.messages.filter(
        (m) => m.type === MessageType.PLAN,
      ).length;

      // Enhanced approval detection - check both LLM response and user message
      const llmSuggestsGeneration = this.llmSuggestsHtmlGeneration(assistantMessage);
      const userApproves = this.isApprovalMessage(question);

      // Force generation after too many refinement attempts to prevent infinite loop
      const forceGeneration = planMessageCount >= CHAT_CONSTANTS.MAX_PLAN_MESSAGES;

      const isApproved = llmSuggestsGeneration || userApproves || forceGeneration;

      // If LLM provided an updated plan, extract and save it
      if (!isApproved && assistantMessage.includes('**Dashboard Overview**')) {
        // Extract the updated plan from the response
        const planStart = assistantMessage.indexOf('**Dashboard Overview**');
        if (planStart !== -1) {
          chat.generatedPlan = assistantMessage.substring(planStart);
        }
      }

      const responseMessage = this.messageRepository.create({
        content: forceGeneration
          ? `I understand you'd like to refine the plan further, but let me generate the HTML dashboard now based on our current plan. You can always create a new chat for a different version!`
          : assistantMessage,
        role: MessageRole.ASSISTANT,
        type: MessageType.PLAN,
        chat,
      });
      chat.messages.push(responseMessage);

      await this.chatRepository.save(chat);

      // If approved, generate HTML
      if (isApproved) {
        this.logger.info('Generating HTML dashboard', {
          chatId: chat.id,
          planMessageCount,
          forced: forceGeneration,
        });

        const htmlResult = await this.docsService.savePlanAsHtml(
          chat.relevantFiles.join(', ') || 'dashboard',
          chat.context || 'Dashboard visualization',
          chat.generatedPlan || '',
        );

        const successMessage = this.messageRepository.create({
          content: `Success! Your dashboard has been generated and saved as:\n\n**${htmlResult.filename}**\n\nPath: ${htmlResult.path}\n\nYou can open this file in your browser to view your interactive dashboard!`,
          role: MessageRole.ASSISTANT,
          type: MessageType.PLAN,
          chat,
        });
        chat.messages.push(successMessage);

        await this.chatRepository.save(chat);

        this.logger.info('Conversation complete - HTML generated', {
          chatId: chat.id,
          htmlFile: htmlResult.filename,
        });

        return {
          message: chat.messages[chat.messages.length - 1],
          htmlResult,
          suggestedAction: {
            type: 'COMPLETE',
          },
        };
      }

      return {
        message: chat.messages[chat.messages.length - 1],
        suggestedAction: {
          type: 'CONTINUE',
        },
      };
    }
  }

  /**
   * Helper: Build full query context from all user messages
   */
  private buildFullQueryContext(messages: Message[], currentQuestion: string): string {
    const userQueryMessages = messages
      .filter((m) => m.role === MessageRole.USER && m.type === MessageType.QUERY)
      .map((m) => m.content)
      .join(' ');

    return userQueryMessages + ' ' + currentQuestion;
  }

  /**
   * Helper: Check if user message contains confirmation keywords
   */
  private isConfirmationMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return CONFIRMATION_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Helper: Check if user message contains approval keywords
   */
  private isApprovalMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return APPROVAL_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Helper: Check if LLM suggests transition to plan
   */
  private llmSuggestsTransition(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return LLM_DETECTION_PHRASES.TRANSITION_TO_PLAN.some((phrase) =>
      lowerMessage.includes(phrase),
    );
  }

  /**
   * Helper: Check if LLM suggests HTML generation
   */
  private llmSuggestsHtmlGeneration(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return LLM_DETECTION_PHRASES.GENERATE_HTML.some((phrase) => lowerMessage.includes(phrase));
  }

  async transitionPhase(chatId: string, newPhase: Phase) {
    this.logger.info('Manual phase transition', { chatId, newPhase });

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    chat.phase = newPhase;
    await this.chatRepository.save(chat);

    this.logger.info('Phase transition successful', { chatId, phase: newPhase });

    return {
      chatId: chat.id,
      phase: chat.phase,
      message: 'Phase transition successful',
    };
  }

  async getConversationHistory(chatId: string) {
    this.logger.debug('Retrieving conversation history', { chatId });

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages'],
    });

    if (!chat) {
      this.logger.warn('Chat not found', { chatId });
      throw new NotFoundException('Chat not found');
    }

    this.logger.debug('Conversation history retrieved', {
      chatId,
      messageCount: chat.messages.length,
      phase: chat.phase,
    });

    return {
      chatId: chat.id,
      phase: chat.phase,
      relevantFiles: chat.relevantFiles,
      context: chat.context,
      generatedPlan: chat.generatedPlan,
      messages: chat.messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}