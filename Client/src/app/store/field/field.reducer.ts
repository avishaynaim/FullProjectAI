import { createReducer, on } from '@ngrx/store';
import { Field } from '../../models/field.model';
import * as FieldActions from './field.actions';

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
  on(FieldActions.loadFields, state => ({
    ...state,
    loading: true
  })),
  on(FieldActions.loadFieldsSuccess, (state, { fields }) => ({
    ...state,
    fields,
    loading: false,
    error: null
  })),
  on(FieldActions.loadFieldsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.loadField, state => ({
    ...state,
    loading: true
  })),
  on(FieldActions.loadFieldSuccess, (state, { field }) => ({
    ...state,
    currentField: field,
    loading: false,
    error: null
  })),
  on(FieldActions.loadFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.loadFieldsByMessage, state => ({
    ...state,
    loading: true
  })),
  on(FieldActions.loadFieldsByMessageSuccess, (state, { fields }) => ({
    ...state,
    messageFields: fields,
    loading: false,
    error: null
  })),
  on(FieldActions.loadFieldsByMessageFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.loadFieldsByParent, state => ({
    ...state,
    loading: true
  })),
  on(FieldActions.loadFieldsByParentSuccess, (state, { fields }) => ({
    ...state,
    childFields: fields,
    loading: false,
    error: null
  })),
  on(FieldActions.loadFieldsByParentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.createFieldSuccess, (state, { field }) => {
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
  on(FieldActions.createFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.updateFieldSuccess, (state, { field }) => ({
    ...state,
    fields: state.fields.map(f => f.id === field.id ? field : f),
    messageFields: state.messageFields.map(f => f.id === field.id ? field : f),
    childFields: state.childFields.map(f => f.id === field.id ? field : f),
    currentField: state.currentField?.id === field.id ? field : state.currentField,
    loading: false,
    error: null
  })),
  on(FieldActions.updateFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.deleteFieldSuccess, (state, { id }) => ({
    ...state,
    fields: state.fields.filter(f => f.id !== id),
    messageFields: state.messageFields.filter(f => f.id !== id),
    childFields: state.childFields.filter(f => f.id !== id),
    currentField: state.currentField?.id === id ? null : state.currentField,
    loading: false,
    error: null
  })),
  on(FieldActions.deleteFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.searchFieldsSuccess, (state, { fields }) => ({
    ...state,
    fields,
    loading: false,
    error: null
  })),
  on(FieldActions.searchFieldsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.exportFieldSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(FieldActions.exportFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FieldActions.fieldUpdatedFromSignalR, (state, { field }) => ({
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
  on(FieldActions.fieldDeletedFromSignalR, (state, { id }) => ({
    ...state,
    fields: state.fields.filter(f => f.id !== id),
    messageFields: state.messageFields.filter(f => f.id !== id),
    childFields: state.childFields.filter(f => f.id !== id),
    currentField: state.currentField?.id === id ? null : state.currentField
  }))
);