import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { ApiError } from '../utils/api-error.js';
import * as conversationService from '../domains/conversations/service.js';
import * as messageService from '../domains/messages/service.js';
import * as thoughtService from '../domains/thoughts/service.js';

vi.mock('../domains/conversations/service.js');
vi.mock('../domains/messages/service.js');
vi.mock('../domains/thoughts/service.js');

describe('conversation routes', () => {
  const app = createApp();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a conversation', async () => {
    vi.mocked(conversationService.createConversation).mockResolvedValue({
      id: 'f789b81b-aa1d-4d15-89cd-f5db664db700',
      title: 'Town Hall',
      startDate: new Date('2026-03-27T20:00:00.000Z'),
      createdAt: new Date('2026-03-27T20:00:00.000Z')
    });

    const res = await request(app).post('/api/conversations').send({
      title: 'Town Hall',
      startDate: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Town Hall');
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/api/conversations').send({
      title: '   ',
      startDate: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid conversation dates', async () => {
    const res = await request(app).post('/api/conversations').send({
      title: 'Town Hall',
      startDate: 'not-a-date'
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details.startDate).toContain('valid ISO datetime');
  });

  it('rejects malformed UUID params', async () => {
    const res = await request(app).get('/api/conversations/not-a-uuid');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('passes trimmed search terms to the listing service', async () => {
    vi.mocked(conversationService.listConversations).mockResolvedValue([]);

    const res = await request(app).get('/api/conversations?search=%20Town%20');

    expect(res.status).toBe(200);
    expect(conversationService.listConversations).toHaveBeenCalledWith('Town');
  });

  it('returns not found when service says conversation is missing', async () => {
    vi.mocked(conversationService.getConversationDetail).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Conversation not found'));

    const res = await request(app).get('/api/conversations/f789b81b-aa1d-4d15-89cd-f5db664db700');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns malformed json errors', async () => {
    const res = await request(app)
      .post('/api/conversations')
      .set('Content-Type', 'application/json')
      .send('{"title":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('updates a conversation', async () => {
    vi.mocked(conversationService.updateConversation).mockResolvedValue({
      id: 'f789b81b-aa1d-4d15-89cd-f5db664db700',
      title: 'Updated title',
      startDate: new Date('2026-03-27T20:00:00.000Z'),
      createdAt: new Date('2026-03-27T20:00:00.000Z')
    } as never);

    const res = await request(app).patch('/api/conversations/f789b81b-aa1d-4d15-89cd-f5db664db700').send({
      title: 'Updated title',
      startDate: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated title');
  });

  it('deletes a conversation', async () => {
    vi.mocked(conversationService.deleteConversation).mockResolvedValue(undefined as never);

    const res = await request(app).delete('/api/conversations/f789b81b-aa1d-4d15-89cd-f5db664db700');

    expect(res.status).toBe(204);
  });

  it('creates a thought on a message route', async () => {
    vi.mocked(thoughtService.createThought).mockResolvedValue({
      id: 'a789b81b-aa1d-4d15-89cd-f5db664db700',
      messageId: 'f789b81b-aa1d-4d15-89cd-f5db664db700',
      text: 'Agreed',
      sentAt: new Date('2026-03-27T20:00:00.000Z'),
      createdAt: new Date('2026-03-27T20:00:00.000Z')
    });

    const res = await request(app).post('/api/messages/f789b81b-aa1d-4d15-89cd-f5db664db700/thoughts').send({
      text: 'Agreed',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(201);
    expect(res.body.data.text).toBe('Agreed');
  });

  it('rejects invalid message payloads', async () => {
    const res = await request(app).post('/api/conversations/f789b81b-aa1d-4d15-89cd-f5db664db700/messages').send({
      text: '  ',
      sentAt: 'not-a-date'
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('surfaces not found when creating a message under a missing conversation', async () => {
    vi.mocked(messageService.createMessage).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Conversation not found'));

    const res = await request(app).post('/api/conversations/f789b81b-aa1d-4d15-89cd-f5db664db700/messages').send({
      text: 'Prompt',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('updates a message', async () => {
    vi.mocked(messageService.updateMessage).mockResolvedValue({
      id: 'f789b81b-aa1d-4d15-89cd-f5db664db700',
      conversationId: 'c1',
      text: 'Edited prompt',
      sentAt: new Date('2026-03-27T20:00:00.000Z'),
      createdAt: new Date('2026-03-27T20:00:00.000Z')
    } as never);

    const res = await request(app).patch('/api/messages/f789b81b-aa1d-4d15-89cd-f5db664db700').send({
      text: 'Edited prompt',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(200);
    expect(res.body.data.text).toBe('Edited prompt');
  });

  it('deletes a message', async () => {
    vi.mocked(messageService.deleteMessage).mockResolvedValue(undefined as never);

    const res = await request(app).delete('/api/messages/f789b81b-aa1d-4d15-89cd-f5db664db700');

    expect(res.status).toBe(204);
  });

  it('rejects invalid thought payloads', async () => {
    const res = await request(app).post('/api/messages/f789b81b-aa1d-4d15-89cd-f5db664db700/thoughts').send({
      text: '',
      sentAt: 'bad-date'
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('updates a thought', async () => {
    vi.mocked(thoughtService.updateThought).mockResolvedValue({
      id: 'a789b81b-aa1d-4d15-89cd-f5db664db700',
      messageId: 'f789b81b-aa1d-4d15-89cd-f5db664db700',
      text: 'Edited thought',
      sentAt: new Date('2026-03-27T20:00:00.000Z'),
      createdAt: new Date('2026-03-27T20:00:00.000Z')
    } as never);

    const res = await request(app).patch('/api/messages/thoughts/a789b81b-aa1d-4d15-89cd-f5db664db700').send({
      text: 'Edited thought',
      sentAt: '2026-03-27T13:00:00-07:00'
    });

    expect(res.status).toBe(200);
    expect(res.body.data.text).toBe('Edited thought');
  });

  it('deletes a thought', async () => {
    vi.mocked(thoughtService.deleteThought).mockResolvedValue(undefined as never);

    const res = await request(app).delete('/api/messages/thoughts/a789b81b-aa1d-4d15-89cd-f5db664db700');

    expect(res.status).toBe(204);
  });

  it('rejects overly long search strings', async () => {
    const res = await request(app).get(`/api/conversations?search=${'a'.repeat(201)}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
