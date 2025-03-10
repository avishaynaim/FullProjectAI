import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { loadMessages, loadMessagesSuccess, loadMessagesFailure, loadMessage, loadMessageSuccess, loadMessageFailure, loadMessagesByRoot, loadMessagesByRootSuccess, loadMessagesByRootFailure, createMessageSuccess, createMessageFailure, updateMessageSuccess, updateMessageFailure, deleteMessageSuccess, deleteMessageFailure, searchMessagesSuccess, searchMessagesFailure, exportMessageSuccess, exportMessageFailure, messageUpdatedFromSignalR, messageDeletedFromSignalR } from './message.actions';

export interface MessageState {
  messages: Message[];
  currentMessage: Message | null;
  rootMessages: Message[];
  loading: boolean;
  error: any;
  exportedXml: string | null;
}

export const initialState: MessageState = {
  messages: [],
  currentMessage: null,
  rootMessages: [],
  loading: false,
  error: null,
  exportedXml: null
};

export const messageReducer = createReducer(
  initialState,
  on(loadMessages, state => ({
    ...state,
    loading: true
  })),
  on(loadMessagesSuccess, (state, { messages }) => ({
    ...state,
    messages,
    loading: false,
    error: null
  })),
  on(loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadMessage, state => ({
    ...state,
    loading: true
  })),
  on(loadMessageSuccess, (state, { message }) => ({
    ...state,
    currentMessage: message,
    loading: false,
    error: null
  })),
  on(loadMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadMessagesByRoot, state => ({
    ...state,
    loading: true
  })),
  on(loadMessagesByRootSuccess, (state, { messages }) => ({
    ...state,
    rootMessages: messages,
    loading: false,
    error: null
  })),
  on(loadMessagesByRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(createMessageSuccess, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
    rootMessages: message.rootId === state.rootMessages[0]?.rootId 
      ? [...state.rootMessages, message]
      : state.rootMessages,
    loading: false,
    error: null
  })),
  on(createMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(updateMessageSuccess, (state, { message }) => ({
    ...state,
    messages: state.messages.map(m => m.id === message.id ? message : m),
    rootMessages: state.rootMessages.map(m => m.id === message.id ? message : m),
    currentMessage: state.currentMessage?.id === message.id ? message : state.currentMessage,
    loading: false,
    error: null
  })),
  on(updateMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(deleteMessageSuccess, (state, { id }) => ({
    ...state,
    messages: state.messages.filter(m => m.id !== id),
    rootMessages: state.rootMessages.filter(m => m.id !== id),
    currentMessage: state.currentMessage?.id === id ? null : state.currentMessage,
    loading: false,
    error: null
  })),
  on(deleteMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(searchMessagesSuccess, (state, { messages }) => ({
    ...state,
    messages,
    loading: false,
    error: null
  })),
  on(searchMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(exportMessageSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(exportMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(messageUpdatedFromSignalR, (state, { message }) => ({
    ...state,
    messages: state.messages.some(m => m.id === message.id) 
      ? state.messages.map(m => m.id === message.id ? message : m) 
      : [...state.messages, message],
    rootMessages: state.rootMessages.some(m => m.rootId === message.rootId)
      ? (state.rootMessages.some(m => m.id === message.id)
        ? state.rootMessages.map(m => m.id === message.id ? message : m)
        : [...state.rootMessages, message])
      : state.rootMessages,
    currentMessage: state.currentMessage?.id === message.id ? message : state.currentMessage
  })),
  on(messageDeletedFromSignalR, (state, { id }) => ({
    ...state,
    messages: state.messages.filter(m => m.id !== id),
    rootMessages: state.rootMessages.filter(m => m.id !== id),
    currentMessage: state.currentMessage?.id === id ? null : state.currentMessage
  }))
);