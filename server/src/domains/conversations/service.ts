import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import type { CreateConversationInput, UpdateConversationInput } from 'shared/schemas';

export async function createConversation(input: CreateConversationInput) {
  return prisma.conversation.create({
    data: {
      title: input.title.trim(),
      startDate: new Date(input.startDate)
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      createdAt: true
    }
  });
}

export async function updateConversation(id: string, input: UpdateConversationInput) {
  const conversationExists = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!conversationExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  return prisma.conversation.update({
    where: { id },
    data: {
      title: input.title.trim(),
      startDate: new Date(input.startDate)
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      createdAt: true
    }
  });
}

export async function deleteConversation(id: string) {
  const conversationExists = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!conversationExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  await prisma.conversation.delete({
    where: { id }
  });
}

export async function listConversations(search?: string) {
  const normalizedSearch = search?.trim();

  return prisma.conversation.findMany({
    where: normalizedSearch ? { title: { contains: normalizedSearch, mode: 'insensitive' } } : undefined,
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      startDate: true,
      createdAt: true,
      _count: {
        select: {
          messages: true
        }
      }
    }
  });
}

export async function getConversationDetail(id: string, messageSearch?: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      startDate: true,
      createdAt: true,
      messages: {
        where: messageSearch ? { text: { contains: messageSearch, mode: 'insensitive' } } : undefined,
        orderBy: [{ sentAt: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          text: true,
          sentAt: true,
          createdAt: true,
          thoughts: {
            orderBy: [{ sentAt: 'asc' }, { createdAt: 'asc' }],
            select: {
              id: true,
              text: true,
              sentAt: true,
              createdAt: true
            }
          }
        }
      }
    }
  });

  if (!conversation) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  return conversation;
}
