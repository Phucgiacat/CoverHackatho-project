import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './controllers/chat.controller';
import { DocumentController } from './controllers/document.controller';
import { HtmlController } from './controllers/html.controller';
import { ChatService } from './services/chat.service';
import { DocumentService } from './services/document.service';
import { DocsService } from './services/docs.service';
import { PromptService } from './services/prompt.service';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { Document } from './entities/document.entity';
import { LoggerUtil } from './utils/logger.util';
import { LlmUtil } from './utils/llm.util';
import { FileUtil } from './utils/file.util';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, Document])],
  controllers: [ChatController, DocumentController, HtmlController],
  providers: [
    ChatService,
    DocumentService,
    DocsService,
    PromptService,
    LoggerUtil,
    LlmUtil,
    FileUtil,
  ],
  exports: [],
})
export class CoreModule {}
