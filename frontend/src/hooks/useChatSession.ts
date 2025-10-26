import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { askQuestion, createChat, fetchChatHistory } from '../api/chat';
import type { Chat, HtmlResult, Message, SuggestedAction } from '../types/chat';
import { resolveHtmlPreviewUrl } from '../utils/path';

const tempIdPrefix = 'temp-';

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function buildOptimisticMessage(content: string): Message {
  return {
    id: `${tempIdPrefix}${generateClientId()}`,
    content,
    role: 'USER',
    type: 'QUERY',
    createdAt: new Date().toISOString(),
  };
}

export function useChatSession() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedAction, setSuggestedAction] = useState<SuggestedAction | null>(null);
  const [htmlResult, setHtmlResult] = useState<HtmlResult | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [htmlPreviewError, setHtmlPreviewError] = useState<string | null>(null);

  const latestHtmlResult = useRef<HtmlResult | null>(null);

  const createChatSession = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    setHtmlResult(null);
    setHtmlPreview(null);
    setHtmlPreviewError(null);
    try {
      const newChat = await createChat();
      setChat(newChat);
      setMessages(sortMessages(newChat.messages ?? []));
      setSuggestedAction(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chat';
      console.error('Failed to create chat:', err);
      
      // Check if it's a network error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot connect to the backend server. Please make sure the backend is running on http://localhost:3000');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsCreating(false);
    }
  }, []);

  const refreshHistory = useCallback(
    async (chatId: string) => {
      try {
        const history = await fetchChatHistory(chatId);
        setChat(history);
        setMessages(sortMessages(history.messages ?? []));
        return history;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh chat history');
        return null;
      }
    },
    [],
  );

  const loadChat = useCallback(
    async (chatId: string) => {
      setIsLoadingChat(true);
      setError(null);
      setHtmlResult(null);
      setHtmlPreview(null);
      setHtmlPreviewError(null);
      setSuggestedAction(null);
      
      try {
        const history = await fetchChatHistory(chatId);
        setChat(history);
        setMessages(sortMessages(history.messages ?? []));
        
        // If there's an HTML result in the chat, load it
        if (history.generatedHtmlPath) {
          const filename = history.generatedHtmlPath.split('/').pop() || 'dashboard.html';
          const htmlResultData: HtmlResult = {
            success: true,
            filename,
            path: history.generatedHtmlPath,
            message: 'Dashboard generated',
          };
          setHtmlResult(htmlResultData);
          latestHtmlResult.current = htmlResultData;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chat';
        console.error('Failed to load chat:', err);
        
        // Check if it's a network error
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          setError('Cannot connect to the backend server. Please make sure the backend is running on http://localhost:3000');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoadingChat(false);
      }
    },
    [],
  );

  const loadHtmlPreview = useCallback(
    async (result: HtmlResult) => {
      const previewUrl = resolveHtmlPreviewUrl(result);
      if (!previewUrl) {
        setHtmlPreviewError('Preview path unavailable. Open the file from disk instead.');
        setHtmlPreview(null);
        return;
      }

      setIsLoadingPreview(true);
      setHtmlPreviewError(null);
      try {
        const response = await fetch(previewUrl, {
          headers: { Accept: 'text/html' },
        });
        if (!response.ok) {
          throw new Error(`Preview request failed (${response.status})`);
        }
        const html = await response.text();
        setHtmlPreview(html);
      } catch (err) {
        setHtmlPreview(null);
        setHtmlPreviewError(
          err instanceof Error
            ? `${err.message}. Use the file path to open the dashboard manually.`
            : 'Unable to load preview. Use the file path to open the dashboard manually.',
        );
      } finally {
        setIsLoadingPreview(false);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !chat) {
        return;
      }

      setError(null);
      setIsSending(true);

      const optimisticMessage = buildOptimisticMessage(trimmed);
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const response = await askQuestion(chat.id, trimmed);
        setSuggestedAction(response.suggestedAction);
        if (response.htmlResult) {
          setHtmlResult(response.htmlResult);
          latestHtmlResult.current = response.htmlResult;
        }
        await refreshHistory(chat.id);
      } catch (err) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        console.error('Failed to send message:', err);
        
        // Check if it's a network error
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          setError('Cannot connect to the backend server. Please make sure the backend is running on http://localhost:3000');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsSending(false);
      }
    },
    [chat, refreshHistory],
  );

  useEffect(() => {
    if (!htmlResult) {
      setHtmlPreview(null);
      setHtmlPreviewError(null);
      latestHtmlResult.current = null;
      return;
    }
    loadHtmlPreview(htmlResult);
  }, [htmlResult, loadHtmlPreview]);

  const isReady = useMemo(() => Boolean(chat?.id), [chat]);

  const retryPreview = useCallback(() => {
    if (latestHtmlResult.current) {
      loadHtmlPreview(latestHtmlResult.current);
    }
  }, [loadHtmlPreview]);

  return {
    chat,
    messages,
    isReady,
    isCreating,
    isSending,
    isLoadingChat,
    assistantIsThinking: isSending,
    error,
    suggestedAction,
    htmlResult,
    htmlPreview,
    isLoadingPreview,
    htmlPreviewError,
    createChatSession,
    sendMessage,
    retryPreview,
    refreshHistory,
    loadChat,
  };
}
