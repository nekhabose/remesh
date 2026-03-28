import { type FormEvent, useState } from 'react';
import type { Thought } from 'shared/api';
import { formatDisplayDate, toOffsetIsoString } from '../../../utils/date';
import { extractFieldErrors, formatErrorMessage, validateThoughtForm } from '../../../utils/validation';
import { useDeleteThought, useUpdateThought } from '../../conversations/hooks';

type ThoughtItemProps = {
  conversationId: string;
  thought: Thought;
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

export function ThoughtItem({ conversationId, thought }: ThoughtItemProps) {
  const updateThought = useUpdateThought(conversationId, thought.id);
  const deleteThought = useDeleteThought(conversationId);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(thought.text);
  const [sentAt, setSentAt] = useState(toLocalDateTimeValue(thought.sentAt));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateThoughtForm({ text, sentAt });
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
      await updateThought.mutateAsync({
        text,
        sentAt: sentAtIso!
      });
      setIsEditing(false);
    } catch (error) {
      setFieldErrors((prev) => ({ ...prev, ...extractFieldErrors(error) }));
    }
  }

  async function onDelete() {
    if (!window.confirm('Delete this thought?')) {
      return;
    }

    await deleteThought.mutateAsync(thought.id);
  }

  if (isEditing) {
    return (
      <li className="thought-card">
        <form onSubmit={onSubmit} className="inline-form" aria-label={`edit-thought-form-${thought.id}`}>
          <div className="field">
            <label htmlFor={`edit-thought-text-${thought.id}`}>Edit thought text</label>
            <textarea
              id={`edit-thought-text-${thought.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
            />
            {fieldErrors.text ? <p className="field-error">{fieldErrors.text}</p> : null}
          </div>

          <div className="field">
            <label htmlFor={`edit-thought-sent-at-${thought.id}`}>Edit thought sent at</label>
            <input
              id={`edit-thought-sent-at-${thought.id}`}
              type="datetime-local"
              value={sentAt}
              onChange={(event) => setSentAt(event.target.value)}
            />
            {fieldErrors.sentAt ? <p className="field-error">{fieldErrors.sentAt}</p> : null}
          </div>

          {updateThought.isError ? <div className="status-banner" role="alert">{formatErrorMessage(updateThought.error)}</div> : null}

          <div className="action-row">
            <button className="secondary-button" disabled={updateThought.isPending}>
              {updateThought.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setIsEditing(false);
                setText(thought.text);
                setSentAt(toLocalDateTimeValue(thought.sentAt));
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
    <li className="thought-card">
      <div className="thought-card-header">
        <div className="thought-card-body">
          <strong>{thought.text}</strong>
          <div className="meta-row compact-meta-row">
            <span className="pill">Sent {formatDisplayDate(thought.sentAt)}</span>
          </div>
        </div>
        <div className="action-row">
          <button
            type="button"
            className="secondary-button icon-button action-icon-button"
            aria-label="Edit"
            title="Edit"
            onClick={() => setIsEditing(true)}
          >
            <span className="edit-icon" aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </button>
          <button
            type="button"
            className="secondary-button danger-button icon-button action-icon-button"
            aria-label={deleteThought.isPending ? 'Deleting' : 'Delete'}
            title={deleteThought.isPending ? 'Deleting' : 'Delete'}
            onClick={() => void onDelete()}
            disabled={deleteThought.isPending}
          >
            <span className="trash-icon" aria-hidden="true" />
            <span className="sr-only">{deleteThought.isPending ? 'Deleting' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {deleteThought.isError ? <div className="status-banner" role="alert">{formatErrorMessage(deleteThought.error)}</div> : null}
    </li>
  );
}
