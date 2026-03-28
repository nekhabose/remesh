import { type FormEvent, useState } from 'react';
import type { Message } from 'shared/api';
import { formatDisplayDate, toOffsetIsoString } from '../../../utils/date';
import { extractFieldErrors, formatErrorMessage, validateMessageForm } from '../../../utils/validation';
import { useDeleteMessage, useUpdateMessage } from '../../conversations/hooks';
import { ThoughtComposer } from '../../thoughts/components/ThoughtComposer';
import { ThoughtItem } from '../../thoughts/components/ThoughtItem';

type MessageCardProps = {
  conversationId: string;
  message: Message;
};

function toLocalDateTimeValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function MessageCard({ conversationId, message }: MessageCardProps) {
  const updateMessage = useUpdateMessage(conversationId, message.id);
  const deleteMessage = useDeleteMessage(conversationId);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [thoughtSearch, setThoughtSearch] = useState('');
  const [text, setText] = useState(message.text);
  const [sentAt, setSentAt] = useState(toLocalDateTimeValue(message.sentAt));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const normalizedThoughtSearch = thoughtSearch.trim().toLowerCase();
  const visibleThoughts = normalizedThoughtSearch
    ? message.thoughts.filter((thought) => thought.text.toLowerCase().includes(normalizedThoughtSearch))
    : message.thoughts;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateMessageForm({ text, sentAt });
    const sentAtIso = toOffsetIsoString(sentAt);

    if (!sentAtIso) {
      validationErrors.sentAt = 'Enter a valid local date and time.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});

    try {
      await updateMessage.mutateAsync({
        text,
        sentAt: sentAtIso!
      });
      setIsEditing(false);
    } catch (error) {
      setFieldErrors((prev) => ({ ...prev, ...extractFieldErrors(error) }));
    }
  }

  async function onDelete() {
    if (!window.confirm('Delete this message? This will also remove its thoughts.')) {
      return;
    }

    await deleteMessage.mutateAsync(message.id);
  }

  if (isEditing) {
    return (
      <li className="message-card">
        <form onSubmit={onSubmit} className="stack" aria-label={`edit-message-form-${message.id}`}>
          <div className="field">
            <label htmlFor={`edit-message-text-${message.id}`}>Edit message text</label>
            <textarea
              id={`edit-message-text-${message.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
            />
            {fieldErrors.text ? <p className="field-error">{fieldErrors.text}</p> : null}
          </div>

          <div className="field">
            <label htmlFor={`edit-message-sent-at-${message.id}`}>Edit message sent at</label>
            <input
              id={`edit-message-sent-at-${message.id}`}
              type="datetime-local"
              value={sentAt}
              onChange={(event) => setSentAt(event.target.value)}
            />
            {fieldErrors.sentAt ? <p className="field-error">{fieldErrors.sentAt}</p> : null}
          </div>

          {updateMessage.isError ? <div className="status-banner" role="alert">{formatErrorMessage(updateMessage.error)}</div> : null}

          <div className="action-row">
            <button className="primary-button" disabled={updateMessage.isPending}>
              {updateMessage.isPending ? 'Saving...' : 'Save message'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setIsEditing(false);
                setText(message.text);
                setSentAt(toLocalDateTimeValue(message.sentAt));
                setFieldErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="message-card">
      <div className="message-header">
        <div className="message-card-body">
          <h3>{message.text}</h3>
          <div className="meta-row compact-meta-row">
            <span className="pill">Sent {formatDisplayDate(message.sentAt)}</span>
            <span className="pill">
              {message.thoughts.length} thought{message.thoughts.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="secondary-button icon-button message-toggle-button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            aria-controls={`message-panel-${message.id}`}
            aria-label={isExpanded ? 'Collapse message' : 'Expand message'}
            title={isExpanded ? 'Collapse message' : 'Expand message'}
          >
            <span className={`chevron-icon ${isExpanded ? 'chevron-up' : 'chevron-down'}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="secondary-button icon-button action-icon-button"
            aria-label="Edit message"
            title="Edit message"
            onClick={() => setIsEditing(true)}
          >
            <span className="edit-icon" aria-hidden="true" />
            <span className="sr-only">Edit message</span>
          </button>
          <button
            type="button"
            className="secondary-button danger-button icon-button action-icon-button"
            aria-label={deleteMessage.isPending ? 'Deleting message' : 'Delete message'}
            title={deleteMessage.isPending ? 'Deleting message' : 'Delete message'}
            onClick={() => void onDelete()}
            disabled={deleteMessage.isPending}
          >
            <span className="trash-icon" aria-hidden="true" />
            <span className="sr-only">{deleteMessage.isPending ? 'Deleting message' : 'Delete message'}</span>
          </button>
        </div>
      </div>

      <section
        id={`message-panel-${message.id}`}
        className={`thought-section${isExpanded ? '' : ' thought-section-collapsed'}`}
        hidden={!isExpanded}
      >
        <h4 className="section-heading">Thoughts</h4>
        <div className="thought-toolbar">
          <p className="muted helper-copy">Thoughts are responses attached to this specific message.</p>
          <div className="field thought-search-field">
            <label htmlFor={`thought-search-${message.id}`}>Search thoughts</label>
            <input
              id={`thought-search-${message.id}`}
              value={thoughtSearch}
              onChange={(event) => setThoughtSearch(event.target.value)}
              placeholder="Search thoughts by text"
            />
          </div>
        </div>
        {message.thoughts.length === 0 ? (
          <div className="empty-state">No thoughts yet. Add the first response below.</div>
        ) : visibleThoughts.length === 0 ? (
          <div className="empty-state">No thoughts match that search.</div>
        ) : (
          <ul className="thought-list">
            {visibleThoughts.map((thought) => (
              <ThoughtItem key={thought.id} conversationId={conversationId} thought={thought} />
            ))}
          </ul>
        )}

        <div className="thought-composer-shell">
          <ThoughtComposer conversationId={conversationId} messageId={message.id} />
        </div>
      </section>

      {deleteMessage.isError ? <div className="status-banner" role="alert">{formatErrorMessage(deleteMessage.error)}</div> : null}
    </li>
  );
}
