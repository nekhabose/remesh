import { type FormEvent, useState } from 'react';
import { useCreateMessage } from '../../conversations/hooks';
import { toOffsetIsoString } from '../../../utils/date';
import { extractFieldErrors, formatErrorMessage, validateMessageForm } from '../../../utils/validation';
import { useLiveLocalDateTime } from '../../../hooks/useLiveLocalDateTime';

type MessageComposerProps = {
  conversationId: string;
};

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const createMessage = useCreateMessage(conversationId);
  const [text, setText] = useState('');
  const sentAt = useLiveLocalDateTime();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateMessageForm({ text, sentAt: sentAt.value });
    const sentAtIso = toOffsetIsoString(sentAt.value);

    if (!sentAtIso) {
      validationErrors.sentAt = 'Enter a valid local date and time.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});

    try {
      await createMessage.mutateAsync({
        text,
        sentAt: sentAtIso!
      });
      setText('');
      sentAt.resetValue();
    } catch (error) {
      setFieldErrors((prev) => ({ ...prev, ...extractFieldErrors(error) }));
    }
  }

  return (
    <aside className="panel stack composer-panel">
      <div>
        <h2>Add message</h2>
        <p className="muted">Add the next prompt or statement for this conversation. Responses will appear under each message.</p>
      </div>

      <form onSubmit={onSubmit} aria-label="create-message-form" className="stack">
        <div className="field">
          <label htmlFor="message-text">Message text</label>
          <textarea
            id="message-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What prompt do you want this conversation to respond to?"
            rows={4}
          />
          {fieldErrors.text ? <p className="field-error">{fieldErrors.text}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="message-sent-at">Date and time sent</label>
          <input
            id="message-sent-at"
            type="datetime-local"
            value={sentAt.value}
            onChange={(event) => sentAt.setValue(event.target.value)}
          />
          {fieldErrors.sentAt ? <p className="field-error">{fieldErrors.sentAt}</p> : null}
        </div>

        <button className="primary-button" disabled={createMessage.isPending}>
          {createMessage.isPending ? 'Saving...' : 'Add Message'}
        </button>
      </form>

      {createMessage.isError ? <div className="status-banner" role="alert">{formatErrorMessage(createMessage.error)}</div> : null}
    </aside>
  );
}
