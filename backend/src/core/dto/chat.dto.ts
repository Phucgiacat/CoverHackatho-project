import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { MessageRole, MessageType } from '../entities/message.entity';
import { Phase } from '../entities/chat.entity';

// Response DTOs
export class MessageResponseDto {
  id: string;
  content: string;
  role: MessageRole;
  type: MessageType;
  createdAt: Date;
}

export class SuggestedActionDto {
  type: 'CONTINUE' | 'TRANSITION' | 'COMPLETE';
  nextPhase?: Phase;
  prompt?: string;
  message?: string;
}

export class HtmlResultDto {
  success: boolean;
  filename: string;
  path: string;
  message: string;
}

export class ChatResponseDto {
  message: MessageResponseDto;
  suggestedAction: SuggestedActionDto;
  htmlResult?: HtmlResultDto;
}

// Request DTOs
export class AskQuestionDto {
  @IsString()
  chatId: string;

  @IsString()
  question: string;
}

export class TransitionPhaseDto {
  @IsString()
  chatId: string;

  @IsEnum(Phase)
  newPhase: Phase;
}

// Internal DTOs
export class DocumentContent {
  filename: string;
  content: string;
}

