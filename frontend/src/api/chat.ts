import type { AskResponse, Chat } from '../types/chat';

const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function createChat(): Promise<Chat> {
  const response = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<Chat>(response);
}

export async function askQuestion(chatId: string, question: string): Promise<AskResponse> {
  const response = await fetch(`${baseUrl}/chat/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, question }),
  });
  return handleResponse<AskResponse>(response);
}

interface HistoryResponse {
  chatId: string;
  phase: Chat['phase'];
  relevantFiles?: string[];
  context?: string | null;
  generatedPlan?: string | null;
  messages: Chat['messages'];
  createdAt: string;
  updatedAt: string;
}

export async function fetchChatHistory(chatId: string): Promise<Chat> {
  const response = await fetch(`${baseUrl}/chat/${chatId}/history`);
  const payload = await handleResponse<HistoryResponse>(response);
  return {
    id: payload.chatId,
    phase: payload.phase,
    relevantFiles: payload.relevantFiles,
    context: payload.context,
    generatedPlan: payload.generatedPlan,
    messages: payload.messages,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
  };
}

export interface Document {
  id: string;
  originalFilename: string;
  markdownFilename: string;
  fileSize: number;
  uploadedAt: string;
}

export interface UploadResponse {
  success: boolean;
  document: Document;
}

export interface DocumentsResponse {
  documents: Document[];
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
}

export async function getDocuments(): Promise<DocumentsResponse> {
  const response = await fetch(`${baseUrl}/documents`);
  return handleResponse<DocumentsResponse>(response);
}

export async function deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${baseUrl}/documents/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean; message: string }>(response);
}
