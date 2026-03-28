import { Link, useParams } from 'react-router-dom';
import { MessageComposer } from '../features/messages/components/MessageComposer';
import { MessageResultsPanel } from '../features/messages/components/MessageResultsPanel';
import { useConversationDetail } from '../features/conversations/hooks';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { isValidUuid, formatErrorMessage } from '../utils/validation';
import { formatDisplayDate } from '../utils/date';
import { useState } from 'react';

export function ConversationDetailPage() {
  const { id = '' } = useParams();
  const [messageSearch, setMessageSearch] = useState('');
  const debouncedMessageSearch = useDebouncedValue(messageSearch, 250);
  const invalidConversationId = !isValidUuid(id);
  const conversationQuery = useConversationDetail(id, debouncedMessageSearch, !invalidConversationId);

  if (invalidConversationId) {
    return (
      <main className="page-shell">
        <div className="status-banner" role="alert">Conversation ID is invalid.</div>
        <Link className="back-link icon-back-link" to="/" aria-label="Back to conversations" title="Back to conversations">
          <span className="back-arrow" aria-hidden="true" />
          <span className="sr-only">Back to conversations</span>
        </Link>
      </main>
    );
  }

  if (conversationQuery.isLoading) {
    return (
      <main className="page-shell">
        <div className="empty-state">Loading conversation…</div>
      </main>
    );
  }

  if (conversationQuery.isError || !conversationQuery.data) {
    return (
      <main className="page-shell">
        <div className="status-banner" role="alert">
          {conversationQuery.isError ? formatErrorMessage(conversationQuery.error) : 'Conversation unavailable.'}
        </div>
        <Link className="back-link icon-back-link" to="/" aria-label="Back to conversations" title="Back to conversations">
          <span className="back-arrow" aria-hidden="true" />
          <span className="sr-only">Back to conversations</span>
        </Link>
      </main>
    );
  }

  const conversation = conversationQuery.data;

  return (
    <main className="page-shell">
      <div className="detail-shell">
        <Link className="back-link icon-back-link" to="/" aria-label="Back to conversations" title="Back to conversations">
          <span className="back-arrow" aria-hidden="true" />
          <span className="sr-only">Back to conversations</span>
        </Link>

        <section className="page-header detail-header">
          <p className="eyebrow">Conversation detail</p>
          <h1 className="detail-title">{conversation.title}</h1>
          <p>Starts {formatDisplayDate(conversation.startDate)}. Add messages first, then capture thoughts under each one.</p>
        </section>

        <section className="detail-grid detail-flow">
          <MessageComposer conversationId={conversation.id} />
          <MessageResultsPanel
            conversationId={conversation.id}
            messages={conversation.messages}
            search={messageSearch}
            error=""
            onSearchChange={setMessageSearch}
          />
        </section>
      </div>
    </main>
  );
}
