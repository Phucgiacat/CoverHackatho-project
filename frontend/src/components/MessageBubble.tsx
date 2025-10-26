import type { Message } from '../types/chat';
import { RichText } from './RichText';

interface MessageBubbleProps {
  message: Message;
}

const roleLabel: Record<Message['role'], string> = {
  USER: 'You',
  ASSISTANT: 'Agent',
};

/**
 * Strips HTML code blocks from message content
 * If the message contains <!DOCTYPE html> or <html>, remove everything from that point onwards
 */
function stripHtmlCode(content: string): string {
  // Check for HTML document start patterns
  const htmlPatterns = [
    /<!DOCTYPE html>/i,
    /<html[^>]*>/i,
    /```html\s*<!DOCTYPE/i,
  ];

  for (const pattern of htmlPatterns) {
    const match = content.match(pattern);
    if (match && match.index !== undefined) {
      // Return everything before the HTML code starts
      return content.substring(0, match.index).trim();
    }
  }

  return content;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'USER';
  
  // Strip HTML code from assistant messages
  const displayContent = isUser ? message.content : stripHtmlCode(message.content);

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
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </header>
      <div className="message-bubble__content">
        <RichText content={displayContent} />
      </div>
    </article>
  );
}
