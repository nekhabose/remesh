import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConversation,
  deleteConversation,
  createMessage,
  deleteMessage,
  createThought,
  getConversation,
  getConversations,
  updateConversation,
  updateMessage,
  updateThought,
  deleteThought
} from '../../api/conversations';
import type {
  ConversationDetail,
  ConversationListItem,
  CreateConversationRequest,
  CreateMessageRequest,
  CreateThoughtRequest,
  UpdateConversationRequest,
  UpdateMessageRequest,
  UpdateThoughtRequest
} from 'shared/api';

export const conversationKeys = {
  all: ['conversations'] as const,
  list: (search: string) => ['conversations', search] as const,
  detailRoot: (id: string) => ['conversation', id] as const,
  detail: (id: string, messageSearch: string) => ['conversation', id, messageSearch] as const
};

export function useConversations(search: string) {
  return useQuery<ConversationListItem[]>({
    queryKey: conversationKeys.list(search),
    queryFn: async () => (await getConversations(search || undefined)).data,
    placeholderData: keepPreviousData
  });
}

export function useConversationDetail(id: string, messageSearch: string, enabled: boolean) {
  return useQuery<ConversationDetail>({
    queryKey: conversationKeys.detail(id, messageSearch),
    queryFn: async () => (await getConversation(id, messageSearch || undefined)).data,
    enabled,
    placeholderData: keepPreviousData
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationRequest) => createConversation(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    }
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateConversationRequest }) => updateConversation(id, input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(variables.id) });
    }
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    }
  });
}

export function useCreateMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMessageRequest) => createMessage(conversationId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(conversationId) });
    }
  });
}

export function useUpdateMessage(conversationId: string, messageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMessageRequest) => updateMessage(messageId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(conversationId) });
    }
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(conversationId) });
    }
  });
}

export function useCreateThought(conversationId: string, messageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateThoughtRequest) => createThought(messageId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(conversationId) });
    }
  });
}

export function useUpdateThought(conversationId: string, thoughtId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateThoughtRequest) => updateThought(thoughtId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(conversationId) });
    }
  });
}

export function useDeleteThought(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (thoughtId: string) => deleteThought(thoughtId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationKeys.detailRoot(conversationId) });
    }
  });
}
