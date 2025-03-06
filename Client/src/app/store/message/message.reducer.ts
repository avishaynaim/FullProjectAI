import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import * as MessageActions from './message.actions';

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
  on(MessageActions.loadMessages, state => ({
    ...state,
    loading: true
  })),
  on(MessageActions.loadMessagesSuccess, (state, { messages }) => ({
    ...state,
    messages,
    loading: false,
    error: null
  })),
  on(MessageActions.loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.loadMessage, state => ({
    ...state,
    loading: true
  })),
  on(MessageActions.loadMessageSuccess, (state, { message }) => ({
    ...state,
    currentMessage: message,
    loading: false,
    error: null
  })),
  on(MessageActions.loadMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.loadMessagesByRoot, state => ({
    ...state,
    loading: true
  })),
  on(MessageActions.loadMessagesByRootSuccess, (state, { messages }) => ({
    ...state,
    rootMessages: messages,
    loading: false,
    error: null
  })),
  on(MessageActions.loadMessagesByRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.createMessageSuccess, (state, { message }) => ({
    ...state,
    messages: [...state.messages, message],
    rootMessages: message.rootId === state.rootMessages[0]?.rootId 
      ? [...state.rootMessages, message]
      : state.rootMessages,
    loading: false,
    error: null
  })),
  on(MessageActions.createMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.updateMessageSuccess, (state, { message }) => ({
    ...state,
    messages: state.messages.map(m => m.id === message.id ? message : m),
    rootMessages: state.rootMessages.map(m => m.id === message.id ? message : m),
    currentMessage: state.currentMessage?.id === message.id ? message : state.currentMessage,
    loading: false,
    error: null
  })),
  on(MessageActions.updateMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.deleteMessageSuccess, (state, { id }) => ({
    ...state,
    messages: state.messages.filter(m => m.id !== id),
    rootMessages: state.rootMessages.filter(m => m.id !== id),
    currentMessage: state.currentMessage?.id === id ? null : state.currentMessage,
    loading: false,
    error: null
  })),
  on(MessageActions.deleteMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.searchMessagesSuccess, (state, { messages }) => ({
    ...state,
    messages,
    loading: false,
    error: null
  })),
  on(MessageActions.searchMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.exportMessageSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(MessageActions.exportMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MessageActions.messageUpdatedFromSignalR, (state, { message }) => ({
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
  on(MessageActions.messageDeletedFromSignalR, (state, { id }) => ({
    ...state,
    messages: state.messages.filter(m => m.id !== id),
    rootMessages: state.rootMessages.filter(m => m.id !== id),
    currentMessage: state.currentMessage?.id === id ? null : state.currentMessage
  }))
);