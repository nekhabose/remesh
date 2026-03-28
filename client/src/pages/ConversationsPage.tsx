import { useState } from 'react';
import { ConversationComposer } from '../features/conversations/components/ConversationComposer';
import { ConversationResultsPanel } from '../features/conversations/components/ConversationResultsPanel';
import { useConversations } from '../features/conversations/hooks';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatErrorMessage } from '../utils/validation';

const useCases = [
  {
    title: 'Customer feedback research',
    conversation: 'New onboarding feedback',
    message: 'What was confusing during sign-up?',
    thought: 'Email verification took too long.'
  },
  {
    title: 'Employee listening session',
    conversation: 'Engineering team retrospective',
    message: 'What slowed us down this sprint?',
    thought: 'Too many manual QA steps.'
  },
  {
    title: 'Product discovery',
    conversation: 'Mobile app usability study',
    message: 'What was hardest to do in the app?',
    thought: 'Finding saved items was difficult.'
  },
  {
    title: 'Town hall or workshop feedback',
    conversation: 'Town hall follow-up',
    message: 'What topic should get more time next time?',
    thought: 'Roadmap priorities and decision making.'
  }
];

export function ConversationsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const conversationsQuery = useConversations(debouncedSearch);
  const items = conversationsQuery.data ?? [];

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Remesh Take Home</p>
        <h1>Start with a conversation, then drill into messages and thoughts.</h1>
        <p>
          Create a conversation here, search by title, and open any result to manage its messages and responses.
        </p>
      </header>

      <section className="hero-grid">
        <ConversationComposer />
        <ConversationResultsPanel
          items={items}
          loading={conversationsQuery.isLoading}
          error={conversationsQuery.isError ? formatErrorMessage(conversationsQuery.error) : ''}
          search={search}
          onSearchChange={setSearch}
        />
      </section>

      <section className="scenario-panel">
        <div className="scenario-header">
          <div>
            <p className="eyebrow">Example use cases</p>
            <h2>Where this conversation model fits</h2>
          </div>
          <p className="muted">
            Each scenario follows the same structure: a conversation contains messages, and each message collects thoughts.
          </p>
        </div>

        <div className="scenario-grid">
          {useCases.map((useCase) => (
            <article key={useCase.title} className="scenario-card">
              <h3>{useCase.title}</h3>
              <dl className="scenario-list">
                <div>
                  <dt>Conversation</dt>
                  <dd>{useCase.conversation}</dd>
                </div>
                <div>
                  <dt>Message</dt>
                  <dd>{useCase.message}</dd>
                </div>
                <div>
                  <dt>Thought</dt>
                  <dd>{useCase.thought}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
