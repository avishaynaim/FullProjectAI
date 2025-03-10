import { createReducer, on } from '@ngrx/store';
import { EnumValue } from '../../models/enum-value.model';
import { createEnumValueFailure, createEnumValueSuccess, deleteEnumValueFailure, deleteEnumValueSuccess, enumValueDeletedFromSignalR, enumValueUpdatedFromSignalR, loadEnumValue, loadEnumValueFailure, loadEnumValues, loadEnumValuesByField, loadEnumValuesByFieldFailure, loadEnumValuesByFieldSuccess, loadEnumValuesFailure, loadEnumValuesSuccess, loadEnumValueSuccess, searchEnumValuesFailure, searchEnumValuesSuccess, updateEnumValueFailure, updateEnumValueSuccess } from './enum-value.actions';

export interface EnumValueState {
  enumValues: EnumValue[];
  currentEnumValue: EnumValue | null;
  fieldEnumValues: EnumValue[];
  loading: boolean;
  error: any;
}

export const initialState: EnumValueState = {
  enumValues: [],
  currentEnumValue: null,
  fieldEnumValues: [],
  loading: false,
  error: null
};

export const enumValueReducer = createReducer(
  initialState,
  on(loadEnumValues, state => ({
    ...state,
    loading: true
  })),
  on(loadEnumValuesSuccess, (state, { enumValues }) => ({
    ...state,
    enumValues,
    loading: false,
    error: null
  })),
  on(loadEnumValuesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadEnumValue, state => ({
    ...state,
    loading: true
  })),
  on(loadEnumValueSuccess, (state, { enumValue }) => ({
    ...state,
    currentEnumValue: enumValue,
    loading: false,
    error: null
  })),
  on(loadEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadEnumValuesByField, state => ({
    ...state,
    loading: true
  })),
  on(loadEnumValuesByFieldSuccess, (state, { enumValues }) => ({
    ...state,
    fieldEnumValues: enumValues,
    loading: false,
    error: null
  })),
  on(loadEnumValuesByFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(createEnumValueSuccess, (state, { enumValue }) => ({
    ...state,
    enumValues: [...state.enumValues, enumValue],
    fieldEnumValues: enumValue.fieldId === state.fieldEnumValues[0]?.fieldId 
      ? [...state.fieldEnumValues, enumValue]
      : state.fieldEnumValues,
    loading: false,
    error: null
  })),
  on(createEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(updateEnumValueSuccess, (state, { enumValue }) => ({
    ...state,
    enumValues: state.enumValues.map(ev => ev.id === enumValue.id ? enumValue : ev),
    fieldEnumValues: state.fieldEnumValues.map(ev => ev.id === enumValue.id ? enumValue : ev),
    currentEnumValue: state.currentEnumValue?.id === enumValue.id ? enumValue : state.currentEnumValue,
    loading: false,
    error: null
  })),
  on(updateEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(deleteEnumValueSuccess, (state, { id }) => ({
    ...state,
    enumValues: state.enumValues.filter(ev => ev.id !== id),
    fieldEnumValues: state.fieldEnumValues.filter(ev => ev.id !== id),
    currentEnumValue: state.currentEnumValue?.id === id ? null : state.currentEnumValue,
    loading: false,
    error: null
  })),
  on(deleteEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(searchEnumValuesSuccess, (state, { enumValues }) => ({
    ...state,
    enumValues,
    loading: false,
    error: null
  })),
  on(searchEnumValuesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(enumValueUpdatedFromSignalR, (state, { enumValue }) => ({
    ...state,
    enumValues: state.enumValues.some(ev => ev.id === enumValue.id) 
      ? state.enumValues.map(ev => ev.id === enumValue.id ? enumValue : ev) 
      : [...state.enumValues, enumValue],
    fieldEnumValues: state.fieldEnumValues.some(ev => ev.fieldId === enumValue.fieldId)
      ? (state.fieldEnumValues.some(ev => ev.id === enumValue.id)
        ? state.fieldEnumValues.map(ev => ev.id === enumValue.id ? enumValue : ev)
        : [...state.fieldEnumValues, enumValue])
      : state.fieldEnumValues,
    currentEnumValue: state.currentEnumValue?.id === enumValue.id ? enumValue : state.currentEnumValue
  })),
  on(enumValueDeletedFromSignalR, (state, { id }) => ({
    ...state,
    enumValues: state.enumValues.filter(ev => ev.id !== id),
    fieldEnumValues: state.fieldEnumValues.filter(ev => ev.id !== id),
    currentEnumValue: state.currentEnumValue?.id === id ? null : state.currentEnumValue
  }))
);