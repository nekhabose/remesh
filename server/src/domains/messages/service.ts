import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import type { CreateMessageInput, UpdateMessageInput } from 'shared/schemas';

export async function createMessage(conversationId: string, input: CreateMessageInput) {
  const conversationExists = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true }
  });

  if (!conversationExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');
  }

  return prisma.message.create({
    data: {
      conversationId,
      text: input.text.trim(),
      sentAt: new Date(input.sentAt)
    },
    select: {
      id: true,
      conversationId: true,
      text: true,
      sentAt: true,
      createdAt: true
    }
  });
}

export async function updateMessage(id: string, input: UpdateMessageInput) {
  const messageExists = await prisma.message.findUnique({
    where: { id },
    select: { id: true, conversationId: true }
  });

  if (!messageExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found');
  }

  return prisma.message.update({
    where: { id },
    data: {
      text: input.text.trim(),
      sentAt: new Date(input.sentAt)
    },
    select: {
      id: true,
      conversationId: true,
      text: true,
      sentAt: true,
      createdAt: true
    }
  });
}

export async function deleteMessage(id: string) {
  const messageExists = await prisma.message.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!messageExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found');
  }

  await prisma.message.delete({
    where: { id }
  });
}
