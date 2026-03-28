import { Router } from 'express';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createThoughtSchema, updateMessageSchema, updateThoughtSchema, uuidParamSchema } from '../utils/validators.js';
import { deleteMessage, updateMessage } from '../domains/messages/service.js';
import { createThought, deleteThought, updateThought } from '../domains/thoughts/service.js';

export const messagesRouter = Router();

messagesRouter.patch('/:id', validateParams(uuidParamSchema), validateBody(updateMessageSchema), async (req, res, next) => {
  try {
    const data = await updateMessage(res.locals.validatedParams.id, res.locals.validatedBody);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

messagesRouter.delete('/:id', validateParams(uuidParamSchema), async (req, res, next) => {
  try {
    await deleteMessage(res.locals.validatedParams.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

messagesRouter.post('/:id/thoughts', validateParams(uuidParamSchema), validateBody(createThoughtSchema), async (req, res, next) => {
  try {
    const data = await createThought(res.locals.validatedParams.id, res.locals.validatedBody);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

messagesRouter.patch('/thoughts/:id', validateParams(uuidParamSchema), validateBody(updateThoughtSchema), async (req, res, next) => {
  try {
    const data = await updateThought(res.locals.validatedParams.id, res.locals.validatedBody);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

messagesRouter.delete('/thoughts/:id', validateParams(uuidParamSchema), async (req, res, next) => {
  try {
    await deleteThought(res.locals.validatedParams.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
