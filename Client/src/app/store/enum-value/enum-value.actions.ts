import { createAction, props } from '@ngrx/store';
import { EnumValue } from '../../models/enum-value.model';

export const loadEnumValues = createAction('[EnumValue] Load EnumValues');
export const loadEnumValuesSuccess = createAction(
  '[EnumValue] Load EnumValues Success',
  props<{ enumValues: EnumValue[] }>()
);
export const loadEnumValuesFailure = createAction(
  '[EnumValue] Load EnumValues Failure',
  props<{ error: any }>()
);

export const loadEnumValue = createAction(
  '[EnumValue] Load EnumValue',
  props<{ id: string }>()
);
export const loadEnumValueSuccess = createAction(
  '[EnumValue] Load EnumValue Success',
  props<{ enumValue: EnumValue }>()
);
export const loadEnumValueFailure = createAction(
  '[EnumValue] Load EnumValue Failure',
  props<{ error: any }>()
);

export const loadEnumValuesByField = createAction(
  '[EnumValue] Load EnumValues By Field',
  props<{ fieldId: string }>()
);
export const loadEnumValuesByFieldSuccess = createAction(
  '[EnumValue] Load EnumValues By Field Success',
  props<{ enumValues: EnumValue[] }>()
);
export const loadEnumValuesByFieldFailure = createAction(
  '[EnumValue] Load EnumValues By Field Failure',
  props<{ error: any }>()
);

export const createEnumValue = createAction(
  '[EnumValue] Create EnumValue',
  props<{ enumValue: EnumValue }>()
);
export const createEnumValueSuccess = createAction(
  '[EnumValue] Create EnumValue Success',
  props<{ enumValue: EnumValue }>()
);
export const createEnumValueFailure = createAction(
  '[EnumValue] Create EnumValue Failure',
  props<{ error: any }>()
);

export const updateEnumValue = createAction(
  '[EnumValue] Update EnumValue',
  props<{ enumValue: EnumValue }>()
);
export const updateEnumValueSuccess = createAction(
  '[EnumValue] Update EnumValue Success',
  props<{ enumValue: EnumValue }>()
);
export const updateEnumValueFailure = createAction(
  '[EnumValue] Update EnumValue Failure',
  props<{ error: any }>()
);

export const deleteEnumValue = createAction(
  '[EnumValue] Delete EnumValue',
  props<{ id: string }>()
);
export const deleteEnumValueSuccess = createAction(
  '[EnumValue] Delete EnumValue Success',
  props<{ id: string }>()
);
export const deleteEnumValueFailure = createAction(
  '[EnumValue] Delete EnumValue Failure',
  props<{ error: any }>()
);

export const searchEnumValues = createAction(
  '[EnumValue] Search EnumValues',
  props<{ term: string }>()
);
export const searchEnumValuesSuccess = createAction(
  '[EnumValue] Search EnumValues Success',
  props<{ enumValues: EnumValue[] }>()
);
export const searchEnumValuesFailure = createAction(
  '[EnumValue] Search EnumValues Failure',
  props<{ error: any }>()
);

export const enumValueUpdatedFromSignalR = createAction(
  '[EnumValue] EnumValue Updated From SignalR',
  props<{ enumValue: EnumValue }>()
);

export const enumValueDeletedFromSignalR = createAction(
  '[EnumValue] EnumValue Deleted From SignalR',
  props<{ id: string }>()
);