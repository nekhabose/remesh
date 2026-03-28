import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  createConversationSchema,
  createMessageSchema,
  searchSchema,
  updateConversationSchema,
  uuidParamSchema
} from '../utils/validators.js';
import {
  createConversation,
  deleteConversation,
  getConversationDetail,
  listConversations,
  updateConversation
} from '../domains/conversations/service.js';
import { createMessage } from '../domains/messages/service.js';

export const conversationsRouter = Router();

conversationsRouter.get('/', validateQuery(searchSchema), async (req, res, next) => {
  try {
    const data = await listConversations(res.locals.validatedQuery.search as string | undefined);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

conversationsRouter.post('/', validateBody(createConversationSchema), async (req, res, next) => {
  try {
    const data = await createConversation(res.locals.validatedBody);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

conversationsRouter.patch('/:id', validateParams(uuidParamSchema), validateBody(updateConversationSchema), async (req, res, next) => {
  try {
    const data = await updateConversation(res.locals.validatedParams.id, res.locals.validatedBody);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

conversationsRouter.delete('/:id', validateParams(uuidParamSchema), async (req, res, next) => {
  try {
    await deleteConversation(res.locals.validatedParams.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

conversationsRouter.get('/:id', validateParams(uuidParamSchema), validateQuery(searchSchema), async (req, res, next) => {
  try {
    const data = await getConversationDetail(
      res.locals.validatedParams.id,
      res.locals.validatedQuery.messageSearch as string | undefined
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

conversationsRouter.post('/:id/messages', validateParams(uuidParamSchema), validateBody(createMessageSchema), async (req, res, next) => {
  try {
    const data = await createMessage(res.locals.validatedParams.id, res.locals.validatedBody);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});
