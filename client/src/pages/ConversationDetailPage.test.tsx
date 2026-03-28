import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationDetailPage } from './ConversationDetailPage';
import * as api from '../api/conversations';

vi.mock('../api/conversations');

function renderPage(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ConversationDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders nested thoughts and creates a message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';
    vi.mocked(api.getConversation)
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: [
                {
                  id: 't1',
                  text: 'Good point',
                  sentAt: '2026-03-27T20:11:00.000Z',
                  createdAt: '2026-03-27T20:11:00.000Z'
                }
              ]
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: [
                {
                  id: 't1',
                  text: 'Good point',
                  sentAt: '2026-03-27T20:11:00.000Z',
                  createdAt: '2026-03-27T20:11:00.000Z'
                }
              ]
            },
            {
              id: 'm2',
              text: 'Follow-up',
              sentAt: '2026-03-27T20:12:00.000Z',
              createdAt: '2026-03-27T20:12:00.000Z',
              thoughts: []
            }
          ]
        }
      });
    vi.mocked(api.createMessage).mockResolvedValue({ data: {} });

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Opening message')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Good point/).length).toBeGreaterThan(0);

    await userEvent.type(screen.getByLabelText('Message text'), 'Follow-up');
    await userEvent.click(screen.getByRole('button', { name: 'Add Message' }));

    await waitFor(() => {
      expect(screen.getAllByText('Follow-up').length).toBeGreaterThan(0);
    });
  });

  it('shows not found errors', async () => {
    vi.mocked(api.getConversation).mockRejectedValue(new Error('Conversation not found'));
    const conversationId = '11111111-1111-4111-8111-111111111111';

    renderPage(`/conversations/${conversationId}`);

    expect(await screen.findByRole('alert')).toHaveTextContent('Conversation not found');
  });

  it('blocks invalid message submits on the client', async () => {
    vi.mocked(api.getConversation).mockResolvedValue({
      data: {
        id: '11111111-1111-4111-8111-111111111111',
        title: 'Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z',
        messages: []
      }
    });

    renderPage('/conversations/11111111-1111-4111-8111-111111111111');

    expect(await screen.findByText('Town Hall')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Message text'));
    await userEvent.clear(screen.getByLabelText('Date and time sent'));
    await userEvent.click(screen.getByRole('button', { name: 'Add Message' }));

    expect(screen.getByText('Text is required.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid local date and time.')).toBeInTheDocument();
    expect(api.createMessage).not.toHaveBeenCalled();
  });

  it('renders invalid conversation ids without calling the API', async () => {
    renderPage('/conversations/not-a-uuid');

    expect(await screen.findByRole('alert')).toHaveTextContent('Conversation ID is invalid.');
    expect(api.getConversation).not.toHaveBeenCalled();
  });

  it('creates a thought under the correct message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation)
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: []
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: [
                {
                  id: 't1',
                  text: 'Strong agreement',
                  sentAt: '2026-03-27T20:12:00.000Z',
                  createdAt: '2026-03-27T20:12:00.000Z'
                }
              ]
            }
          ]
        }
      });
    vi.mocked(api.createThought).mockResolvedValue({ data: {} });

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Opening message')).length).toBeGreaterThan(0);

    await userEvent.type(screen.getByLabelText('Thought text'), 'Strong agreement');
    fireEvent.change(screen.getByLabelText('Thought sent at'), { target: { value: '2026-03-27T13:12' } });
    await userEvent.click(screen.getByRole('button', { name: 'Add Thought' }));

    await waitFor(() => {
      expect(screen.getAllByText('Strong agreement').length).toBeGreaterThan(0);
    });
    expect(api.createThought).toHaveBeenCalledTimes(1);
  });

  it('shows a message-search-specific empty state', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation)
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: []
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: []
        }
      });

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Opening message')).length).toBeGreaterThan(0);

    await userEvent.type(screen.getByLabelText('Search'), 'missing');

    expect(await screen.findByText('No messages match that search.')).toBeInTheDocument();
  });

  it('collapses and expands a message card', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation).mockResolvedValue({
      data: {
        id: conversationId,
        title: 'Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z',
        messages: [
          {
            id: 'm1',
            text: 'Opening message',
            sentAt: '2026-03-27T20:10:00.000Z',
            createdAt: '2026-03-27T20:10:00.000Z',
            thoughts: [
              {
                id: 't1',
                text: 'Original thought',
                sentAt: '2026-03-27T20:12:00.000Z',
                createdAt: '2026-03-27T20:12:00.000Z'
              }
            ]
          }
        ]
      }
    });

    renderPage(`/conversations/${conversationId}`);

    const thoughtsHeading = await screen.findByText('Thoughts');
    expect(thoughtsHeading).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse message' }));
    expect(thoughtsHeading).not.toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Expand message' }));
    expect(await screen.findByText('Thoughts')).toBeVisible();
  });

  it('filters thoughts within a message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation).mockResolvedValue({
      data: {
        id: conversationId,
        title: 'Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z',
        messages: [
          {
            id: 'm1',
            text: 'Opening message',
            sentAt: '2026-03-27T20:10:00.000Z',
            createdAt: '2026-03-27T20:10:00.000Z',
            thoughts: [
              {
                id: 't1',
                text: 'Original thought',
                sentAt: '2026-03-27T20:12:00.000Z',
                createdAt: '2026-03-27T20:12:00.000Z'
              },
              {
                id: 't2',
                text: 'Another response',
                sentAt: '2026-03-27T20:13:00.000Z',
                createdAt: '2026-03-27T20:13:00.000Z'
              }
            ]
          }
        ]
      }
    });

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Original thought')).length).toBeGreaterThan(0);
    await userEvent.type(screen.getByLabelText('Search thoughts'), 'missing');
    expect(await screen.findByText('No thoughts match that search.')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Search thoughts'));
    await userEvent.type(screen.getByLabelText('Search thoughts'), 'another');
    expect(await screen.findByText('Another response')).toBeInTheDocument();
  });

  it('edits a message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation)
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Original message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: []
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Edited message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: []
            }
          ]
        }
      });
    vi.mocked(api.updateMessage).mockResolvedValue({ data: {} });

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Original message')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Edit message' }));
    await userEvent.clear(screen.getByLabelText('Edit message text'));
    await userEvent.type(screen.getByLabelText('Edit message text'), 'Edited message');
    await userEvent.click(screen.getByRole('button', { name: 'Save message' }));

    await waitFor(() => {
      expect(api.updateMessage).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes a message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation).mockResolvedValue({
      data: {
        id: conversationId,
        title: 'Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z',
        messages: [
          {
            id: 'm1',
            text: 'Original message',
            sentAt: '2026-03-27T20:10:00.000Z',
            createdAt: '2026-03-27T20:10:00.000Z',
            thoughts: []
          }
        ]
      }
    });
    vi.mocked(api.deleteMessage).mockResolvedValue(undefined);

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Original message')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Delete message' }));

    await waitFor(() => {
      expect(api.deleteMessage).toHaveBeenCalledWith('m1');
    });
  });

  it('edits a thought under a message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation)
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: [
                {
                  id: 't1',
                  text: 'Original thought',
                  sentAt: '2026-03-27T20:12:00.000Z',
                  createdAt: '2026-03-27T20:12:00.000Z'
                }
              ]
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          id: conversationId,
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          messages: [
            {
              id: 'm1',
              text: 'Opening message',
              sentAt: '2026-03-27T20:10:00.000Z',
              createdAt: '2026-03-27T20:10:00.000Z',
              thoughts: [
                {
                  id: 't1',
                  text: 'Edited thought',
                  sentAt: '2026-03-27T20:12:00.000Z',
                  createdAt: '2026-03-27T20:12:00.000Z'
                }
              ]
            }
          ]
        }
      });
    vi.mocked(api.updateThought).mockResolvedValue({ data: {} });

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Original thought')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await userEvent.clear(screen.getByLabelText('Edit thought text'));
    await userEvent.type(screen.getByLabelText('Edit thought text'), 'Edited thought');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(api.updateThought).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes a thought under a message', async () => {
    const conversationId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(api.getConversation).mockResolvedValue({
      data: {
        id: conversationId,
        title: 'Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z',
        messages: [
          {
            id: 'm1',
            text: 'Opening message',
            sentAt: '2026-03-27T20:10:00.000Z',
            createdAt: '2026-03-27T20:10:00.000Z',
            thoughts: [
              {
                id: 't1',
                text: 'Original thought',
                sentAt: '2026-03-27T20:12:00.000Z',
                createdAt: '2026-03-27T20:12:00.000Z'
              }
            ]
          }
        ]
      }
    });
    vi.mocked(api.deleteThought).mockResolvedValue(undefined);

    renderPage(`/conversations/${conversationId}`);

    expect((await screen.findAllByText('Original thought')).length).toBeGreaterThan(0);
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    await waitFor(() => {
      expect(api.deleteThought).toHaveBeenCalledWith('t1');
    });
  });
});
