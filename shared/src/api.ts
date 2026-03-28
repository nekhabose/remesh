import type {
  CreateConversationInput,
  CreateMessageInput,
  CreateThoughtInput,
  UpdateConversationInput,
  UpdateMessageInput,
  UpdateThoughtInput
} from './schemas.js';

export type Conversation = {
  id: string;
  title: string;
  startDate: string;
  createdAt: string;
};

export type Thought = {
  id: string;
  messageId?: string;
  text: string;
  sentAt: string;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId?: string;
  text: string;
  sentAt: string;
  createdAt: string;
  thoughts: Thought[];
};

export type ConversationListItem = Conversation & {
  _count: {
    messages: number;
  };
};

export type ConversationDetail = Conversation & {
  messages: Message[];
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details: Record<string, string> | null;
  };
};

export type DataResponse<T> = {
  data: T;
};

export type CreateConversationRequest = CreateConversationInput;
export type UpdateConversationRequest = UpdateConversationInput;
export type CreateMessageRequest = CreateMessageInput;
export type UpdateMessageRequest = UpdateMessageInput;
export type CreateThoughtRequest = CreateThoughtInput;
export type UpdateThoughtRequest = UpdateThoughtInput;
