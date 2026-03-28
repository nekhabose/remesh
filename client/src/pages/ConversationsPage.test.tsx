import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConversationsPage } from './ConversationsPage';
import * as api from '../api/conversations';

vi.mock('../api/conversations');

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ConversationsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ConversationsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders empty state', async () => {
    vi.mocked(api.getConversations).mockResolvedValue({ data: [] });

    renderPage();

    expect(await screen.findByText('No conversations exist yet.')).toBeInTheDocument();
  });

  it('submits a conversation form and reloads data', async () => {
    vi.mocked(api.getConversations)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: '1',
            title: 'Town Hall',
            startDate: '2026-03-27T20:00:00.000Z',
            createdAt: '2026-03-27T20:00:00.000Z',
            _count: { messages: 0 }
          }
        ]
      });
    vi.mocked(api.createConversation).mockResolvedValue({
      data: {
        id: '1',
        title: 'Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z'
      }
    });

    renderPage();

    await userEvent.type(screen.getByLabelText('Title'), 'Town Hall');
    await userEvent.click(screen.getByRole('button', { name: 'Create Conversation' }));

    await waitFor(() => {
      expect(screen.getByText('Town Hall')).toBeInTheDocument();
    });
  });

  it('shows backend errors', async () => {
    vi.mocked(api.getConversations).mockResolvedValue({ data: [] });
    vi.mocked(api.createConversation).mockRejectedValue(new Error('Invalid request'));

    renderPage();

    await userEvent.type(screen.getByLabelText('Title'), 'Town Hall');
    await userEvent.click(screen.getByRole('button', { name: 'Create Conversation' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid request');
  });

  it('blocks invalid conversation submits on the client', async () => {
    vi.mocked(api.getConversations).mockResolvedValue({ data: [] });

    renderPage();

    await userEvent.clear(screen.getByLabelText('Title'));
    await userEvent.clear(screen.getByLabelText('Start date'));
    await userEvent.click(screen.getByRole('button', { name: 'Create Conversation' }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid local date and time.')).toBeInTheDocument();
    expect(api.createConversation).not.toHaveBeenCalled();
  });

  it('shows a search-specific empty state', async () => {
    vi.mocked(api.getConversations)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    renderPage();

    await userEvent.type(screen.getByLabelText('Search'), 'missing');

    expect(await screen.findByText('No conversations match that search.')).toBeInTheDocument();
  });

  it('edits a conversation from the list', async () => {
    vi.mocked(api.getConversations).mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          _count: { messages: 0 }
        }
      ]
    });
    vi.mocked(api.updateConversation).mockResolvedValue({
      data: {
        id: '1',
        title: 'Updated Town Hall',
        startDate: '2026-03-27T20:00:00.000Z',
        createdAt: '2026-03-27T20:00:00.000Z'
      }
    });

    renderPage();

    expect(await screen.findByText('Town Hall')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.clear(screen.getByLabelText('Edit title'));
    await userEvent.type(screen.getByLabelText('Edit title'), 'Updated Town Hall');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(api.updateConversation).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes a conversation from the list', async () => {
    vi.mocked(api.getConversations).mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Town Hall',
          startDate: '2026-03-27T20:00:00.000Z',
          createdAt: '2026-03-27T20:00:00.000Z',
          _count: { messages: 0 }
        }
      ]
    });
    vi.mocked(api.deleteConversation).mockResolvedValue(undefined);

    renderPage();

    expect(await screen.findByText('Town Hall')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(api.deleteConversation).toHaveBeenCalledWith('1');
    });
  });
});
