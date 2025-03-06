import { createAction, props } from '@ngrx/store';
import { Field } from '../../models/field.model';

export const loadFields = createAction('[Field] Load Fields');
export const loadFieldsSuccess = createAction(
  '[Field] Load Fields Success',
  props<{ fields: Field[] }>()
);
export const loadFieldsFailure = createAction(
  '[Field] Load Fields Failure',
  props<{ error: any }>()
);

export const loadField = createAction(
  '[Field] Load Field',
  props<{ id: string }>()
);
export const loadFieldSuccess = createAction(
  '[Field] Load Field Success',
  props<{ field: Field }>()
);
export const loadFieldFailure = createAction(
  '[Field] Load Field Failure',
  props<{ error: any }>()
);

export const loadFieldsByMessage = createAction(
  '[Field] Load Fields By Message',
  props<{ messageId: string }>()
);
export const loadFieldsByMessageSuccess = createAction(
  '[Field] Load Fields By Message Success',
  props<{ fields: Field[] }>()
);
export const loadFieldsByMessageFailure = createAction(
  '[Field] Load Fields By Message Failure',
  props<{ error: any }>()
);

export const loadFieldsByParent = createAction(
  '[Field] Load Fields By Parent',
  props<{ parentFieldId: string }>()
);
export const loadFieldsByParentSuccess = createAction(
  '[Field] Load Fields By Parent Success',
  props<{ fields: Field[] }>()
);
export const loadFieldsByParentFailure = createAction(
  '[Field] Load Fields By Parent Failure',
  props<{ error: any }>()
);

export const createField = createAction(
  '[Field] Create Field',
  props<{ field: Field }>()
);
export const createFieldSuccess = createAction(
  '[Field] Create Field Success',
  props<{ field: Field }>()
);
export const createFieldFailure = createAction(
  '[Field] Create Field Failure',
  props<{ error: any }>()
);

export const updateField = createAction(
  '[Field] Update Field',
  props<{ field: Field }>()
);
export const updateFieldSuccess = createAction(
  '[Field] Update Field Success',
  props<{ field: Field }>()
);
export const updateFieldFailure = createAction(
  '[Field] Update Field Failure',
  props<{ error: any }>()
);

export const deleteField = createAction(
  '[Field] Delete Field',
  props<{ id: string }>()
);
export const deleteFieldSuccess = createAction(
  '[Field] Delete Field Success',
  props<{ id: string }>()
);
export const deleteFieldFailure = createAction(
  '[Field] Delete Field Failure',
  props<{ error: any }>()
);

export const searchFields = createAction(
  '[Field] Search Fields',
  props<{ term: string }>()
);
export const searchFieldsSuccess = createAction(
  '[Field] Search Fields Success',
  props<{ fields: Field[] }>()
);
export const searchFieldsFailure = createAction(
  '[Field] Search Fields Failure',
  props<{ error: any }>()
);

export const exportField = createAction(
  '[Field] Export Field',
  props<{ id: string }>()
);
export const exportFieldSuccess = createAction(
  '[Field] Export Field Success',
  props<{ xml: string }>()
);
export const exportFieldFailure = createAction(
  '[Field] Export Field Failure',
  props<{ error: any }>()
);

export const fieldUpdatedFromSignalR = createAction(
  '[Field] Field Updated From SignalR',
  props<{ field: Field }>()
);

export const fieldDeletedFromSignalR = createAction(
  '[Field] Field Deleted From SignalR',
  props<{ id: string }>()
);