import { type FormEvent, useState } from 'react';
import { useCreateThought } from '../../conversations/hooks';
import { toOffsetIsoString } from '../../../utils/date';
import { extractFieldErrors, validateThoughtForm } from '../../../utils/validation';
import { useLiveLocalDateTime } from '../../../hooks/useLiveLocalDateTime';

type ThoughtComposerProps = {
  conversationId: string;
  messageId: string;
};

export function ThoughtComposer({ conversationId, messageId }: ThoughtComposerProps) {
  const createThought = useCreateThought(conversationId, messageId);
  const [text, setText] = useState('');
  const sentAt = useLiveLocalDateTime();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateThoughtForm({ text, sentAt: sentAt.value });
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
      await createThought.mutateAsync({
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
    <form onSubmit={onSubmit} aria-label={`thought-form-${messageId}`} className="inline-form">
      <div className="field">
        <label htmlFor={`thought-text-${messageId}`}>Thought text</label>
        <textarea
          id={`thought-text-${messageId}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Capture a response to this message"
          rows={3}
        />
        {fieldErrors.text ? <p className="field-error">{fieldErrors.text}</p> : null}
      </div>

      <div className="field">
        <label htmlFor={`thought-sent-at-${messageId}`}>Thought sent at</label>
        <input
          id={`thought-sent-at-${messageId}`}
          type="datetime-local"
          value={sentAt.value}
          onChange={(event) => sentAt.setValue(event.target.value)}
        />
        {fieldErrors.sentAt ? <p className="field-error">{fieldErrors.sentAt}</p> : null}
      </div>

      <button className="secondary-button" disabled={createThought.isPending}>
        {createThought.isPending ? 'Saving...' : 'Add Thought'}
      </button>
    </form>
  );
}
