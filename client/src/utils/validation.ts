import { ZodError } from 'zod';
import { ApiRequestError } from '../api/client';
import { conversationFormSchema, messageFormSchema, thoughtFormSchema } from 'shared/schemas';

export function validateConversationForm(input: { title: string; startDate: string }) {
  const result = conversationFormSchema.safeParse(input);
  return result.success ? {} : parseFieldErrors(result.error);
}

export function validateMessageForm(input: { text: string; sentAt: string }) {
  const result = messageFormSchema.safeParse(input);
  return result.success ? {} : parseFieldErrors(result.error);
}

export function validateThoughtForm(input: { text: string; sentAt: string }) {
  const result = thoughtFormSchema.safeParse(input);
  return result.success ? {} : parseFieldErrors(result.error);
}

export function formatErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

export function extractFieldErrors(error: unknown) {
  if (error instanceof ApiRequestError) {
    return error.details ?? {};
  }

  if (error instanceof ZodError) {
    return parseFieldErrors(error);
  }

  return {};
}

export function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseFieldErrors(error: ZodError | null) {
  if (!error) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
