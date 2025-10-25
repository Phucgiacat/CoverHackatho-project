import { Controller, Post, Body, Get, Param, Inject } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { Phase } from '../entities/chat.entity';

@Controller('chat')
export class ChatController {
  @Inject(ChatService)
  private readonly chatService: ChatService;

  @Post()
  createChat() {
    return this.chatService.createChat();
  }

  @Post('ask')
  ask(@Body() body: { chatId: string; question: string }) {
    return this.chatService.ask(body.chatId, body.question);
  }

  @Post('transition')
  transitionPhase(@Body() body: { chatId: string; newPhase: Phase }) {
    return this.chatService.transitionPhase(body.chatId, body.newPhase);
  }

  @Get(':chatId/history')
  getHistory(@Param('chatId') chatId: string) {
    return this.chatService.getConversationHistory(chatId);
  }
}