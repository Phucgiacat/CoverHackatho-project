export type MessageRole = 'USER' | 'ASSISTANT';
export type MessageType = 'SUMMARY' | 'QUERY' | 'PLAN';
export type Phase = 'SUMMARY' | 'QUERY' | 'PLAN';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  type: MessageType;
  createdAt: string;
}

export interface Chat {
  id: string;
  phase: Phase;
  messages: Message[];
  relevantFiles?: string[];
  context?: string | null;
  generatedPlan?: string | null;
  generatedHtmlPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SuggestedActionType = 'CONTINUE' | 'TRANSITION' | 'COMPLETE';

export interface SuggestedAction {
  type: SuggestedActionType;
  nextPhase?: Phase;
  prompt?: string;
  message?: string;
}

export interface HtmlResult {
  success: boolean;
  filename: string;
  path: string;
  message: string;
}

export interface AskResponse {
  message: Message;
  suggestedAction: SuggestedAction;
  htmlResult?: HtmlResult;
}
