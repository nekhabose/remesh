import { prisma } from '../../db/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import type { CreateThoughtInput, UpdateThoughtInput } from 'shared/schemas';

export async function createThought(messageId: string, input: CreateThoughtInput) {
  const messageExists = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true }
  });

  if (!messageExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Message not found');
  }

  return prisma.thought.create({
    data: {
      messageId,
      text: input.text.trim(),
      sentAt: new Date(input.sentAt)
    },
    select: {
      id: true,
      messageId: true,
      text: true,
      sentAt: true,
      createdAt: true
    }
  });
}

export async function updateThought(id: string, input: UpdateThoughtInput) {
  const thoughtExists = await prisma.thought.findUnique({
    where: { id },
    select: { id: true, messageId: true }
  });

  if (!thoughtExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Thought not found');
  }

  return prisma.thought.update({
    where: { id },
    data: {
      text: input.text.trim(),
      sentAt: new Date(input.sentAt)
    },
    select: {
      id: true,
      messageId: true,
      text: true,
      sentAt: true,
      createdAt: true
    }
  });
}

export async function deleteThought(id: string) {
  const thoughtExists = await prisma.thought.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!thoughtExists) {
    throw new ApiError(404, 'NOT_FOUND', 'Thought not found');
  }

  await prisma.thought.delete({
    where: { id }
  });
}
