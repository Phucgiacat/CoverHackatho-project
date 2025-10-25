import type { Message } from '../types/chat';
import { RichText } from './RichText';

interface MessageBubbleProps {
  message: Message;
}

const roleLabel: Record<Message['role'], string> = {
  USER: 'You',
  ASSISTANT: 'Agent',
};

const typeLabel: Partial<Record<Message['type'], string>> = {
  SUMMARY: 'Summary',
  QUERY: 'Query',
  PLAN: 'Plan',
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'USER';

  return (
    <article
      className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--assistant'}`}
    >
      <header className="message-bubble__header">
        <span className="message-bubble__avatar" aria-hidden="true">
          {isUser ? '🙂' : '🤖'}
        </span>
        <div>
          <div className="message-bubble__role">{roleLabel[message.role]}</div>
          <time className="message-bubble__timestamp">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
        {typeLabel[message.type] && (
          <span className="message-bubble__type">{typeLabel[message.type]}</span>
        )}
      </header>
      <div className="message-bubble__content">
        <RichText content={message.content} />
      </div>
    </article>
  );
}
