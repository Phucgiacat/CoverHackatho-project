import { Fragment } from 'react';
import type { HtmlResult, Message } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { HtmlPreview } from './HtmlPreview';

interface MessageListProps {
  messages: Message[];
  assistantIsThinking: boolean;
  htmlResult: HtmlResult | null;
  htmlPreview: string | null;
  isLoadingPreview: boolean;
  htmlPreviewError: string | null;
  onRefreshPreview: () => void;
}

export function MessageList({
  messages,
  assistantIsThinking,
  htmlResult,
  htmlPreview,
  isLoadingPreview,
  htmlPreviewError,
  onRefreshPreview,
}: MessageListProps) {
  return (
    <section className="chat-thread" aria-live="polite">
      {messages.map((message) => (
        <Fragment key={message.id}>
          <MessageBubble message={message} />
        </Fragment>
      ))}
      {htmlResult && (
        <div className="message-bubble message-bubble--assistant message-bubble--preview">
          <HtmlPreview
            result={htmlResult}
            html={htmlPreview}
            isLoading={isLoadingPreview}
            error={htmlPreviewError}
            onRetry={onRefreshPreview}
          />
        </div>
      )}
      {assistantIsThinking && (
        <div className="message-bubble message-bubble--assistant message-bubble--placeholder">
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
          <span className="typing-label">Agent is thinking...</span>
        </div>
      )}
    </section>
  );
}
