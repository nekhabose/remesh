import { z } from 'zod';

export const TITLE_MAX_LENGTH = 200;
export const TEXT_MAX_LENGTH = 5000;
export const SEARCH_MAX_LENGTH = 200;

const blankToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const trimmedRequiredString = (field: string, maxLength: number) =>
  z
    .string({ required_error: `${field} is required.` })
    .trim()
    .min(1, `${field} is required.`)
    .max(maxLength, `${field} must be ${maxLength} characters or fewer.`);

const offsetDateTime = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .datetime({ offset: true, message: `${field} must be a valid ISO datetime with timezone offset.` });

const localDateTime = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .min(1, `${field} is required.`)
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Enter a valid local date and time.');

export const conversationTitleSchema = trimmedRequiredString('Title', TITLE_MAX_LENGTH);
export const messageTextSchema = trimmedRequiredString('Text', TEXT_MAX_LENGTH);

export const createConversationSchema = z.object({
  title: conversationTitleSchema,
  startDate: offsetDateTime('Start date')
});
export const updateConversationSchema = createConversationSchema;

export const createMessageSchema = z.object({
  text: messageTextSchema,
  sentAt: offsetDateTime('Sent at')
});
export const updateMessageSchema = createMessageSchema;

export const createThoughtSchema = z.object({
  text: messageTextSchema,
  sentAt: offsetDateTime('Sent at')
});
export const updateThoughtSchema = createThoughtSchema;

export const conversationFormSchema = z.object({
  title: conversationTitleSchema,
  startDate: localDateTime('Start date')
});
export const updateConversationFormSchema = conversationFormSchema;

export const messageFormSchema = z.object({
  text: messageTextSchema,
  sentAt: localDateTime('Date and time sent')
});
export const updateMessageFormSchema = messageFormSchema;

export const thoughtFormSchema = z.object({
  text: messageTextSchema,
  sentAt: localDateTime('Date and time sent')
});
export const updateThoughtFormSchema = thoughtFormSchema;

export const searchSchema = z.object({
  search: z.preprocess(blankToUndefined, z.string().max(SEARCH_MAX_LENGTH).optional()),
  messageSearch: z.preprocess(blankToUndefined, z.string().max(SEARCH_MAX_LENGTH).optional())
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID')
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type CreateThoughtInput = z.infer<typeof createThoughtSchema>;
export type UpdateThoughtInput = z.infer<typeof updateThoughtSchema>;
export type ConversationFormInput = z.infer<typeof conversationFormSchema>;
export type UpdateConversationFormInput = z.infer<typeof updateConversationFormSchema>;
export type MessageFormInput = z.infer<typeof messageFormSchema>;
export type UpdateMessageFormInput = z.infer<typeof updateMessageFormSchema>;
export type ThoughtFormInput = z.infer<typeof thoughtFormSchema>;
export type UpdateThoughtFormInput = z.infer<typeof updateThoughtFormSchema>;
