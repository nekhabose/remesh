import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../utils/api-error.js';
import {
  createConversation,
  deleteConversation,
  getConversationDetail,
  listConversations,
  updateConversation
} from './conversations/service.js';
import { createMessage, deleteMessage, updateMessage } from './messages/service.js';
import { createThought, deleteThought, updateThought } from './thoughts/service.js';
import { prisma } from '../db/prisma.js';

vi.mock('../db/prisma.js', () => ({
  prisma: {
    conversation: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    message: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    thought: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('conversation service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trims titles before creating conversations', async () => {
    vi.mocked(prisma.conversation.create).mockResolvedValue({ id: '1' } as never);

    await createConversation({
      title: '  Town Hall  ',
      startDate: '2026-03-27T13:00:00-07:00'
    });

    expect(prisma.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Town Hall'
        })
      })
    );
  });

  it('drops blank search queries to avoid unnecessary filters', async () => {
    vi.mocked(prisma.conversation.findMany).mockResolvedValue([] as never);

    await listConversations('   ');

    expect(prisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined
      })
    );
  });

  it('throws not found for missing conversations on detail fetch', async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null);

    await expect(getConversationDetail('11111111-1111-4111-8111-111111111111')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND'
    });
  });

  it('throws not found when creating a message for a missing conversation', async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(null);

    await expect(
      createMessage('11111111-1111-4111-8111-111111111111', {
        text: 'Question',
        sentAt: '2026-03-27T13:00:00-07:00'
      })
    ).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND'
    });
  });

  it('trims thought text before persisting it', async () => {
    vi.mocked(prisma.message.findUnique).mockResolvedValue({ id: 'm1' } as never);
    vi.mocked(prisma.thought.create).mockResolvedValue({ id: 't1' } as never);

    await createThought('m1', {
      text: '  Good point  ',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(prisma.thought.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          text: 'Good point'
        })
      })
    );
  });

  it('updates messages after checking existence', async () => {
    vi.mocked(prisma.message.findUnique).mockResolvedValue({ id: 'm1', conversationId: 'c1' } as never);
    vi.mocked(prisma.message.update).mockResolvedValue({ id: 'm1' } as never);

    await updateMessage('m1', {
      text: '  Edited prompt  ',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(prisma.message.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'm1' },
        data: expect.objectContaining({
          text: 'Edited prompt'
        })
      })
    );
  });

  it('deletes messages after checking existence', async () => {
    vi.mocked(prisma.message.findUnique).mockResolvedValue({ id: 'm1' } as never);

    await deleteMessage('m1');

    expect(prisma.message.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
  });

  it('updates conversations after checking existence', async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({ id: 'c1' } as never);
    vi.mocked(prisma.conversation.update).mockResolvedValue({ id: 'c1' } as never);

    await updateConversation('c1', {
      title: '  Updated title  ',
      startDate: '2026-03-27T13:00:00-07:00'
    });

    expect(prisma.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c1' },
        data: expect.objectContaining({
          title: 'Updated title'
        })
      })
    );
  });

  it('deletes conversations after checking existence', async () => {
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue({ id: 'c1' } as never);

    await deleteConversation('c1');

    expect(prisma.conversation.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('updates thoughts after checking existence', async () => {
    vi.mocked(prisma.thought.findUnique).mockResolvedValue({ id: 't1', messageId: 'm1' } as never);
    vi.mocked(prisma.thought.update).mockResolvedValue({ id: 't1' } as never);

    await updateThought('t1', {
      text: '  Edited thought  ',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(prisma.thought.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({
          text: 'Edited thought'
        })
      })
    );
  });

  it('deletes thoughts after checking existence', async () => {
    vi.mocked(prisma.thought.findUnique).mockResolvedValue({ id: 't1' } as never);

    await deleteThought('t1');

    expect(prisma.thought.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
  });
});
