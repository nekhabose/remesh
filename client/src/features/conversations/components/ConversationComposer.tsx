import { type FormEvent, useState } from 'react';
import { useCreateConversation } from '../hooks';
import { toOffsetIsoString } from '../../../utils/date';
import { extractFieldErrors, formatErrorMessage, validateConversationForm } from '../../../utils/validation';
import { useLiveLocalDateTime } from '../../../hooks/useLiveLocalDateTime';

export function ConversationComposer() {
  const createConversation = useCreateConversation();
  const [title, setTitle] = useState('');
  const startDate = useLiveLocalDateTime();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateConversationForm({ title, startDate: startDate.value });
    const startDateIso = toOffsetIsoString(startDate.value);

    if (!startDateIso) {
      validationErrors.startDate = 'Enter a valid local date and time.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});

    try {
      await createConversation.mutateAsync({
        title,
        startDate: startDateIso!
      });
      setTitle('');
      startDate.resetValue();
    } catch (error) {
      setFieldErrors((prev) => ({ ...prev, ...extractFieldErrors(error) }));
    }
  }

  return (
    <aside className="panel stack">
      <div>
        <h2>Create conversation</h2>
        <p className="muted">This is the entry point. Give the conversation a clear title and start time.</p>
      </div>

      <form onSubmit={onSubmit} aria-label="create-conversation-form" className="stack">
        <div className="field">
          <label htmlFor="conversation-title">Title</label>
          <input
            id="conversation-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Quarterly customer feedback"
          />
          {fieldErrors.title ? <p className="field-error">{fieldErrors.title}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="conversation-start-date">Start date</label>
          <input
            id="conversation-start-date"
            type="datetime-local"
            value={startDate.value}
            onChange={(event) => startDate.setValue(event.target.value)}
          />
          {fieldErrors.startDate ? <p className="field-error">{fieldErrors.startDate}</p> : null}
        </div>

        <button className="primary-button" disabled={createConversation.isPending}>
          {createConversation.isPending ? 'Creating...' : 'Create Conversation'}
        </button>
      </form>

      {createConversation.isError ? <div className="status-banner" role="alert">{formatErrorMessage(createConversation.error)}</div> : null}
    </aside>
  );
}
