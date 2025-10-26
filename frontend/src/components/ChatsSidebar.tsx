import { useEffect, useState } from 'react';

interface ChatHistoryItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  message: {
    id: string;
    content: string;
    role: string;
    type: string;
    createdAt: string;
  } | null;
}

interface ChatsSidebarProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

async function fetchChats(): Promise<ChatHistoryItem[]> {
  const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  const response = await fetch(`${baseUrl}/chat`);
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  return response.json();
}

export function ChatsSidebar({ currentChatId, onSelectChat }: ChatsSidebarProps) {
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const chatList = await fetchChats();
        setChats(chatList);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <aside className="chats-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">💬 Chat History</h2>
      </div>
      <div className="sidebar-content">
        {isLoading ? (
          <div className="chats-loading">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="empty-chats">
            <p>No chat history yet.</p>
          </div>
        ) : (
          <ul className="chats-list">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`chat-item ${chat.id === currentChatId ? 'chat-item--active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="chat-item-header">
                  <span className="chat-item-icon">💬</span>
                  <time className="chat-item-time">{formatDate(chat.updatedAt)}</time>
                </div>
                <p className="chat-item-preview">
                  {chat.message
                    ? truncateText(chat.message.content)
                    : 'New conversation'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

