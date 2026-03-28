import { useNavigate } from 'react-router-dom';
import { type FormEvent, type KeyboardEvent, useState } from 'react';
import type { ConversationListItem } from 'shared/api';
import { formatDisplayDate, toOffsetIsoString } from '../../../utils/date';
import { extractFieldErrors, formatErrorMessage, validateConversationForm } from '../../../utils/validation';
import { useDeleteConversation, useUpdateConversation } from '../hooks';

type ConversationCardProps = {
  item: ConversationListItem;
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

export function ConversationCard({ item }: ConversationCardProps) {
  const navigate = useNavigate();
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [startDate, setStartDate] = useState(toLocalDateTimeValue(item.startDate));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateConversationForm({ title, startDate });
    const startDateIso = toOffsetIsoString(startDate);

    if (!startDateIso) {
      validationErrors.startDate = 'Enter a valid local date and time.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});

    try {
      await updateConversation.mutateAsync({
        id: item.id,
        input: {
          title,
          startDate: startDateIso!
        }
      });
      setIsEditing(false);
    } catch (error) {
      setFieldErrors((prev) => ({ ...prev, ...extractFieldErrors(error) }));
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete conversation "${item.title}"? This will also remove its messages and thoughts.`)) {
      return;
    }

    await deleteConversation.mutateAsync(item.id);
  }

  function openConversation() {
    navigate(`/conversations/${item.id}`);
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openConversation();
    }
  }

  if (isEditing) {
    return (
      <li className="card">
        <form onSubmit={onSubmit} className="stack" aria-label={`edit-conversation-form-${item.id}`}>
          <div className="field">
            <label htmlFor={`conversation-title-${item.id}`}>Edit title</label>
            <input
              id={`conversation-title-${item.id}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {fieldErrors.title ? <p className="field-error">{fieldErrors.title}</p> : null}
          </div>

          <div className="field">
            <label htmlFor={`conversation-start-date-${item.id}`}>Edit start date</label>
            <input
              id={`conversation-start-date-${item.id}`}
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            {fieldErrors.startDate ? <p className="field-error">{fieldErrors.startDate}</p> : null}
          </div>

          {updateConversation.isError ? (
            <div className="status-banner" role="alert">{formatErrorMessage(updateConversation.error)}</div>
          ) : null}

          <div className="action-row">
            <button className="primary-button" disabled={updateConversation.isPending}>
              {updateConversation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setIsEditing(false);
                setTitle(item.title);
                setStartDate(toLocalDateTimeValue(item.startDate));
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
    <li
      className="card clickable-card"
      role="link"
      tabIndex={0}
      aria-label={`Open conversation ${item.title}`}
      onClick={openConversation}
      onKeyDown={onCardKeyDown}
    >
      <div className="conversation-card-header">
        <div className="conversation-link">
          <h3>{item.title}</h3>
          <div className="meta-row">
            <span className="pill">Starts {formatDisplayDate(item.startDate)}</span>
            <span className="pill">
              {item._count.messages} message{item._count.messages === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="secondary-button icon-button action-icon-button"
            aria-label="Edit"
            title="Edit"
            onClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
          >
            <span className="edit-icon" aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            type="button"
            className="secondary-button danger-button icon-button action-icon-button"
            aria-label={deleteConversation.isPending ? 'Deleting' : 'Delete'}
            title={deleteConversation.isPending ? 'Deleting' : 'Delete'}
            onClick={(event) => {
              event.stopPropagation();
              void onDelete();
            }}
            disabled={deleteConversation.isPending}
          >
            <span className="trash-icon" aria-hidden="true" />
            <span className="sr-only">{deleteConversation.isPending ? 'Deleting' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {deleteConversation.isError ? <div className="status-banner" role="alert">{formatErrorMessage(deleteConversation.error)}</div> : null}
    </li>
  );
}
