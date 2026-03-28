import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { prisma } from '../db/prisma.js';

describe('conversation routes integration', () => {
  const app = createApp();

  beforeEach(async () => {
    await prisma.thought.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and lists conversations against Postgres', async () => {
    const createRes = await request(app).post('/api/conversations').send({
      title: 'Integration Town Hall',
      startDate: '2026-03-27T13:00:00-07:00'
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.title).toBe('Integration Town Hall');

    const listRes = await request(app).get('/api/conversations?search=town');

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].title).toBe('Integration Town Hall');
  });

  it('creates messages and thoughts and filters detail results', async () => {
    const conversationRes = await request(app).post('/api/conversations').send({
      title: 'Research Sprint',
      startDate: '2026-03-27T13:00:00-07:00'
    });
    const conversationId = conversationRes.body.data.id as string;

    const firstMessageRes = await request(app).post(`/api/conversations/${conversationId}/messages`).send({
      text: 'Opening prompt',
      sentAt: '2026-03-27T13:05:00-07:00'
    });
    const secondMessageRes = await request(app).post(`/api/conversations/${conversationId}/messages`).send({
      text: 'Follow-up prompt',
      sentAt: '2026-03-27T13:10:00-07:00'
    });

    await request(app).post(`/api/messages/${secondMessageRes.body.data.id}/thoughts`).send({
      text: 'This is the strongest signal',
      sentAt: '2026-03-27T13:12:00-07:00'
    });

    const detailRes = await request(app).get(`/api/conversations/${conversationId}?messageSearch=follow`);

    expect(firstMessageRes.status).toBe(201);
    expect(secondMessageRes.status).toBe(201);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.messages).toHaveLength(1);
    expect(detailRes.body.data.messages[0].text).toBe('Follow-up prompt');
    expect(detailRes.body.data.messages[0].thoughts).toHaveLength(1);
    expect(detailRes.body.data.messages[0].thoughts[0].text).toBe('This is the strongest signal');
  });

  it('updates and deletes conversations against Postgres', async () => {
    const conversationRes = await request(app).post('/api/conversations').send({
      title: 'Draft title',
      startDate: '2026-03-27T13:00:00-07:00'
    });
    const conversationId = conversationRes.body.data.id as string;

    const updateRes = await request(app).patch(`/api/conversations/${conversationId}`).send({
      title: 'Updated title',
      startDate: '2026-03-27T13:30:00-07:00'
    });

    const deleteRes = await request(app).delete(`/api/conversations/${conversationId}`);
    const fetchAfterDeleteRes = await request(app).get(`/api/conversations/${conversationId}`);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated title');
    expect(deleteRes.status).toBe(204);
    expect(fetchAfterDeleteRes.status).toBe(404);
  });

  it('updates and deletes thoughts against Postgres', async () => {
    const conversationRes = await request(app).post('/api/conversations').send({
      title: 'Thought workflow',
      startDate: '2026-03-27T13:00:00-07:00'
    });
    const conversationId = conversationRes.body.data.id as string;

    const messageRes = await request(app).post(`/api/conversations/${conversationId}/messages`).send({
      text: 'Prompt',
      sentAt: '2026-03-27T13:05:00-07:00'
    });

    const thoughtRes = await request(app).post(`/api/messages/${messageRes.body.data.id}/thoughts`).send({
      text: 'Original thought',
      sentAt: '2026-03-27T13:06:00-07:00'
    });
    const thoughtId = thoughtRes.body.data.id as string;

    const updateRes = await request(app).patch(`/api/messages/thoughts/${thoughtId}`).send({
      text: 'Edited thought',
      sentAt: '2026-03-27T13:07:00-07:00'
    });

    const deleteRes = await request(app).delete(`/api/messages/thoughts/${thoughtId}`);
    const detailRes = await request(app).get(`/api/conversations/${conversationId}`);

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.text).toBe('Edited thought');
    expect(deleteRes.status).toBe(204);
    expect(detailRes.body.data.messages[0].thoughts).toHaveLength(0);
  });
});
