import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState } from './message.reducer';

export const selectMessageState = createFeatureSelector<MessageState>('messages');

export const selectAllMessages = createSelector(
  selectMessageState,
  state => state.messages
);

export const selectCurrentMessage = createSelector(
  selectMessageState,
  state => state.currentMessage
);

export const selectRootMessages = createSelector(
  selectMessageState,
  state => state.rootMessages
);

export const selectMessagesLoading = createSelector(
  selectMessageState,
  state => state.loading
);

export const selectMessagesError = createSelector(
  selectMessageState,
  state => state.error
);

export const selectExportedXml = createSelector(
  selectMessageState,
  state => state.exportedXml
);

export const selectMessageById = (id: string) => createSelector(
  selectAllMessages,
  messages => messages.find(message => message.id === id) || null
);

export const selectMessagesByRootId = (rootId: string) => createSelector(
  selectAllMessages,
  messages => messages.filter(message => message.rootId === rootId)
);