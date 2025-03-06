import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';

export const loadMessages = createAction('[Message] Load Messages');
export const loadMessagesSuccess = createAction(
  '[Message] Load Messages Success',
  props<{ messages: Message[] }>()
);
export const loadMessagesFailure = createAction(
  '[Message] Load Messages Failure',
  props<{ error: any }>()
);

export const loadMessage = createAction(
  '[Message] Load Message',
  props<{ id: string }>()
);
export const loadMessageSuccess = createAction(
  '[Message] Load Message Success',
  props<{ message: Message }>()
);
export const loadMessageFailure = createAction(
  '[Message] Load Message Failure',
  props<{ error: any }>()
);

export const loadMessagesByRoot = createAction(
  '[Message] Load Messages By Root',
  props<{ rootId: string }>()
);
export const loadMessagesByRootSuccess = createAction(
  '[Message] Load Messages By Root Success',
  props<{ messages: Message[] }>()
);
export const loadMessagesByRootFailure = createAction(
  '[Message] Load Messages By Root Failure',
  props<{ error: any }>()
);

export const createMessage = createAction(
  '[Message] Create Message',
  props<{ message: Message }>()
);
export const createMessageSuccess = createAction(
  '[Message] Create Message Success',
  props<{ message: Message }>()
);
export const createMessageFailure = createAction(
  '[Message] Create Message Failure',
  props<{ error: any }>()
);

export const updateMessage = createAction(
  '[Message] Update Message',
  props<{ message: Message }>()
);
export const updateMessageSuccess = createAction(
  '[Message] Update Message Success',
  props<{ message: Message }>()
);
export const updateMessageFailure = createAction(
  '[Message] Update Message Failure',
  props<{ error: any }>()
);

export const deleteMessage = createAction(
  '[Message] Delete Message',
  props<{ id: string }>()
);
export const deleteMessageSuccess = createAction(
  '[Message] Delete Message Success',
  props<{ id: string }>()
);
export const deleteMessageFailure = createAction(
  '[Message] Delete Message Failure',
  props<{ error: any }>()
);

export const searchMessages = createAction(
  '[Message] Search Messages',
  props<{ term: string }>()
);
export const searchMessagesSuccess = createAction(
  '[Message] Search Messages Success',
  props<{ messages: Message[] }>()
);
export const searchMessagesFailure = createAction(
  '[Message] Search Messages Failure',
  props<{ error: any }>()
);

export const exportMessage = createAction(
  '[Message] Export Message',
  props<{ id: string }>()
);
export const exportMessageSuccess = createAction(
  '[Message] Export Message Success',
  props<{ xml: string }>()
);
export const exportMessageFailure = createAction(
  '[Message] Export Message Failure',
  props<{ error: any }>()
);

export const messageUpdatedFromSignalR = createAction(
  '[Message] Message Updated From SignalR',
  props<{ message: Message }>()
);

export const messageDeletedFromSignalR = createAction(
  '[Message] Message Deleted From SignalR',
  props<{ id: string }>()
);