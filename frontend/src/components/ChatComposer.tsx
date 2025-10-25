import { FormEvent, KeyboardEvent, useState } from 'react';

interface ChatComposerProps {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
  isSending?: boolean;
}

export function ChatComposer({ onSend, disabled = false, isSending = false }: ChatComposerProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }
    await onSend(value);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="chat-input">
        Ask the agent
      </label>
      <textarea
        id="chat-input"
        className="chat-composer__input"
        placeholder="Ask the dashboard agent anything... (Shift + Enter for new line)"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
        rows={isSending ? 2 : 3}
      />
      <div className="chat-composer__actions">
        <button
          type="submit"
          className="chat-composer__submit"
          disabled={disabled || isSending || !value.trim()}
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
