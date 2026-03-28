import type { Message } from 'shared/api';
import { MessageCard } from './MessageCard';

type MessageResultsPanelProps = {
  conversationId: string;
  messages: Message[];
  search: string;
  error: string;
  onSearchChange: (value: string) => void;
};

export function MessageResultsPanel({ conversationId, messages, search, error, onSearchChange }: MessageResultsPanelProps) {
  return (
    <div className="panel">
      <div className="list-header">
        <div>
          <h2>Messages</h2>
          <p className="muted">Search runs only within this conversation, and each message contains its own responses below.</p>
        </div>
        <div className="field" style={{ minWidth: 'min(320px, 100%)' }}>
          <label htmlFor="message-search">Search</label>
          <input
            id="message-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search messages by text"
          />
        </div>
      </div>

      {error ? <div className="status-banner" role="alert">{error}</div> : null}
      {!error && messages.length === 0 ? (
        <div className="empty-state">
          {search.trim() ? 'No messages match that search.' : 'No messages have been added yet.'}
        </div>
      ) : null}

      <ul className="message-list">
        {messages.map((message) => (
          <MessageCard key={message.id} conversationId={conversationId} message={message} />
        ))}
      </ul>
    </div>
  );
}
