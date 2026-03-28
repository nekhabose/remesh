import type { ConversationListItem } from 'shared/api';
import { ConversationCard } from './ConversationCard';

type ConversationResultsPanelProps = {
  items: ConversationListItem[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (value: string) => void;
};

export function ConversationResultsPanel({ items, loading, error, search, onSearchChange }: ConversationResultsPanelProps) {
  return (
    <div className="panel">
      <div className="list-header">
        <div>
          <h2>Browse conversations</h2>
          <p className="muted">Search is case-insensitive and runs against conversation titles.</p>
        </div>
        <div className="field" style={{ minWidth: 'min(320px, 100%)' }}>
          <label htmlFor="conversation-search">Search</label>
          <input
            id="conversation-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by title"
          />
        </div>
      </div>

      {error ? <div className="status-banner" role="alert">{error}</div> : null}
      {!error && loading ? <div className="empty-state">Loading conversations…</div> : null}
      {!error && !loading && items.length === 0 ? (
        <div className="empty-state">
          {search.trim() ? 'No conversations match that search.' : 'No conversations exist yet.'}
        </div>
      ) : null}

      <ul className="conversation-list">
        {items.map((item) => (
          <ConversationCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
