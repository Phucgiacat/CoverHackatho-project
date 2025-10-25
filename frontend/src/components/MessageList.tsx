import { Fragment } from 'react';
import type { Message } from '../types/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  assistantIsThinking: boolean;
}

export function MessageList({ messages, assistantIsThinking }: MessageListProps) {
  return (
    <section className="chat-thread" aria-live="polite">
      {messages.map((message) => (
        <Fragment key={message.id}>
          <MessageBubble message={message} />
        </Fragment>
      ))}
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
