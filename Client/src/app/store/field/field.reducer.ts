import { createReducer, on } from '@ngrx/store';
import { Field } from '../../models/field.model';
import { loadFields, loadFieldsSuccess, loadFieldsFailure, loadField, loadFieldSuccess, loadFieldFailure, loadFieldsByMessage, loadFieldsByMessageSuccess, loadFieldsByMessageFailure, loadFieldsByParent, loadFieldsByParentSuccess, loadFieldsByParentFailure, createFieldSuccess, createFieldFailure, updateFieldSuccess, updateFieldFailure, deleteFieldSuccess, deleteFieldFailure, searchFieldsSuccess, searchFieldsFailure, exportFieldSuccess, exportFieldFailure, fieldUpdatedFromSignalR, fieldDeletedFromSignalR } from './field.actions';

export interface FieldState {
  fields: Field[];
  currentField: Field | null;
  messageFields: Field[];
  childFields: Field[];
  loading: boolean;
  error: any;
  exportedXml: string | null;
}

export const initialState: FieldState = {
  fields: [],
  currentField: null,
  messageFields: [],
  childFields: [],
  loading: false,
  error: null,
  exportedXml: null
};

export const fieldReducer = createReducer(
  initialState,
  on(loadFields, state => ({
    ...state,
    loading: true
  })),
  on(loadFieldsSuccess, (state, { fields }) => ({
    ...state,
    fields,
    loading: false,
    error: null
  })),
  on(loadFieldsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadField, state => ({
    ...state,
    loading: true
  })),
  on(loadFieldSuccess, (state, { field }) => ({
    ...state,
    currentField: field,
    loading: false,
    error: null
  })),
  on(loadFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadFieldsByMessage, state => ({
    ...state,
    loading: true
  })),
  on(loadFieldsByMessageSuccess, (state, { fields }) => ({
    ...state,
    messageFields: fields,
    loading: false,
    error: null
  })),
  on(loadFieldsByMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadFieldsByParent, state => ({
    ...state,
    loading: true
  })),
  on(loadFieldsByParentSuccess, (state, { fields }) => ({
    ...state,
    childFields: fields,
    loading: false,
    error: null
  })),
  on(loadFieldsByParentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(createFieldSuccess, (state, { field }) => {
    // Determine which collections to update
    let messageFields = state.messageFields;
    let childFields = state.childFields;
    
    if (field.messageId) {
      // It's a top-level field
      const isForCurrentMessage = state.messageFields.length > 0 && 
                                 state.messageFields[0].messageId === field.messageId;
      if (isForCurrentMessage) {
        messageFields = [...state.messageFields, field];
      }
    } else if (field.parentFieldId) {
      // It's a child field
      const isForCurrentParent = state.childFields.length > 0 && 
                               state.childFields[0].parentFieldId === field.parentFieldId;
      if (isForCurrentParent) {
        childFields = [...state.childFields, field];
      }
    }
    
    return {
      ...state,
      fields: [...state.fields, field],
      messageFields,
      childFields,
      loading: false,
      error: null
    };
  }),
  on(createFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(updateFieldSuccess, (state, { field }) => ({
    ...state,
    fields: state.fields.map(f => f.id === field.id ? field : f),
    messageFields: state.messageFields.map(f => f.id === field.id ? field : f),
    childFields: state.childFields.map(f => f.id === field.id ? field : f),
    currentField: state.currentField?.id === field.id ? field : state.currentField,
    loading: false,
    error: null
  })),
  on(updateFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(deleteFieldSuccess, (state, { id }) => ({
    ...state,
    fields: state.fields.filter(f => f.id !== id),
    messageFields: state.messageFields.filter(f => f.id !== id),
    childFields: state.childFields.filter(f => f.id !== id),
    currentField: state.currentField?.id === id ? null : state.currentField,
    loading: false,
    error: null
  })),
  on(deleteFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(searchFieldsSuccess, (state, { fields }) => ({
    ...state,
    fields,
    loading: false,
    error: null
  })),
  on(searchFieldsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(exportFieldSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(exportFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(fieldUpdatedFromSignalR, (state, { field }) => ({
    ...state,
    fields: state.fields.some(f => f.id === field.id) 
      ? state.fields.map(f => f.id === field.id ? field : f) 
      : [...state.fields, field],
    messageFields: field.messageId
      ? (state.messageFields.some(f => f.messageId === field.messageId)
        ? (state.messageFields.some(f => f.id === field.id)
          ? state.messageFields.map(f => f.id === field.id ? field : f)
          : [...state.messageFields, field])
        : state.messageFields)
      : state.messageFields,
    childFields: field.parentFieldId
      ? (state.childFields.some(f => f.parentFieldId === field.parentFieldId)
        ? (state.childFields.some(f => f.id === field.id)
          ? state.childFields.map(f => f.id === field.id ? field : f)
          : [...state.childFields, field])
        : state.childFields)
      : state.childFields,
    currentField: state.currentField?.id === field.id ? field : state.currentField
  })),
  on(fieldDeletedFromSignalR, (state, { id }) => ({
    ...state,
    fields: state.fields.filter(f => f.id !== id),
    messageFields: state.messageFields.filter(f => f.id !== id),
    childFields: state.childFields.filter(f => f.id !== id),
    currentField: state.currentField?.id === id ? null : state.currentField
  }))
);