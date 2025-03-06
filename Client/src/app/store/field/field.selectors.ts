import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FieldState } from './field.reducer';

export const selectFieldState = createFeatureSelector<FieldState>('fields');

export const selectAllFields = createSelector(
  selectFieldState,
  state => state.fields
);

export const selectCurrentField = createSelector(
  selectFieldState,
  state => state.currentField
);

export const selectMessageFields = createSelector(
  selectFieldState,
  state => state.messageFields
);

export const selectChildFields = createSelector(
  selectFieldState,
  state => state.childFields
);

export const selectFieldsLoading = createSelector(
  selectFieldState,
  state => state.loading
);

export const selectFieldsError = createSelector(
  selectFieldState,
  state => state.error
);

export const selectExportedXml = createSelector(
  selectFieldState,
  state => state.exportedXml
);

export const selectFieldById = (id: string) => createSelector(
  selectAllFields,
  fields => fields.find(field => field.id === id) || null
);

export const selectFieldsByMessageId = (messageId: string) => createSelector(
  selectAllFields,
  fields => fields.filter(field => field.messageId === messageId && !field.parentFieldId)
);

export const selectFieldsByParentId = (parentId: string) => createSelector(
  selectAllFields,
  fields => fields.filter(field => field.parentFieldId === parentId)
);