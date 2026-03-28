import { api } from './client';
import type {
  Conversation,
  ConversationDetail,
  ConversationListItem,
  CreateConversationRequest,
  CreateMessageRequest,
  CreateThoughtRequest,
  DataResponse,
  UpdateConversationRequest,
  UpdateMessageRequest,
  UpdateThoughtRequest
} from 'shared/api';

export const getConversations = (search?: string) =>
  api<DataResponse<ConversationListItem[]>>(`/conversations${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const createConversation = (body: CreateConversationRequest) =>
  api<DataResponse<Conversation>>('/conversations', {
    method: 'POST',
    body: JSON.stringify(body)
  });

export const updateConversation = (id: string, body: UpdateConversationRequest) =>
  api<DataResponse<Conversation>>(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });

export const deleteConversation = (id: string) =>
  api<void>(`/conversations/${id}`, {
    method: 'DELETE'
  });

export const getConversation = (id: string, messageSearch?: string) =>
  api<DataResponse<ConversationDetail>>(`/conversations/${id}${messageSearch ? `?messageSearch=${encodeURIComponent(messageSearch)}` : ''}`);

export const createMessage = (conversationId: string, body: CreateMessageRequest) =>
  api<DataResponse<object>>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(body)
  });

export const updateMessage = (messageId: string, body: UpdateMessageRequest) =>
  api<DataResponse<object>>(`/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });

export const deleteMessage = (messageId: string) =>
  api<void>(`/messages/${messageId}`, {
    method: 'DELETE'
  });

export const createThought = (messageId: string, body: CreateThoughtRequest) =>
  api<DataResponse<object>>(`/messages/${messageId}/thoughts`, {
    method: 'POST',
    body: JSON.stringify(body)
  });

export const updateThought = (thoughtId: string, body: UpdateThoughtRequest) =>
  api<DataResponse<object>>(`/messages/thoughts/${thoughtId}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });

export const deleteThought = (thoughtId: string) =>
  api<void>(`/messages/thoughts/${thoughtId}`, {
    method: 'DELETE'
  });
