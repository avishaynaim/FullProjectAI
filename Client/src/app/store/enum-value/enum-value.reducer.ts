import { createReducer, on } from '@ngrx/store';
import { EnumValue } from '../../models/enum-value.model';
import * as EnumValueActions from './enum-value.actions';

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
  on(EnumValueActions.loadEnumValues, state => ({
    ...state,
    loading: true
  })),
  on(EnumValueActions.loadEnumValuesSuccess, (state, { enumValues }) => ({
    ...state,
    enumValues,
    loading: false,
    error: null
  })),
  on(EnumValueActions.loadEnumValuesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.loadEnumValue, state => ({
    ...state,
    loading: true
  })),
  on(EnumValueActions.loadEnumValueSuccess, (state, { enumValue }) => ({
    ...state,
    currentEnumValue: enumValue,
    loading: false,
    error: null
  })),
  on(EnumValueActions.loadEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.loadEnumValuesByField, state => ({
    ...state,
    loading: true
  })),
  on(EnumValueActions.loadEnumValuesByFieldSuccess, (state, { enumValues }) => ({
    ...state,
    fieldEnumValues: enumValues,
    loading: false,
    error: null
  })),
  on(EnumValueActions.loadEnumValuesByFieldFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.createEnumValueSuccess, (state, { enumValue }) => ({
    ...state,
    enumValues: [...state.enumValues, enumValue],
    fieldEnumValues: enumValue.fieldId === state.fieldEnumValues[0]?.fieldId 
      ? [...state.fieldEnumValues, enumValue]
      : state.fieldEnumValues,
    loading: false,
    error: null
  })),
  on(EnumValueActions.createEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.updateEnumValueSuccess, (state, { enumValue }) => ({
    ...state,
    enumValues: state.enumValues.map(ev => ev.id === enumValue.id ? enumValue : ev),
    fieldEnumValues: state.fieldEnumValues.map(ev => ev.id === enumValue.id ? enumValue : ev),
    currentEnumValue: state.currentEnumValue?.id === enumValue.id ? enumValue : state.currentEnumValue,
    loading: false,
    error: null
  })),
  on(EnumValueActions.updateEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.deleteEnumValueSuccess, (state, { id }) => ({
    ...state,
    enumValues: state.enumValues.filter(ev => ev.id !== id),
    fieldEnumValues: state.fieldEnumValues.filter(ev => ev.id !== id),
    currentEnumValue: state.currentEnumValue?.id === id ? null : state.currentEnumValue,
    loading: false,
    error: null
  })),
  on(EnumValueActions.deleteEnumValueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.searchEnumValuesSuccess, (state, { enumValues }) => ({
    ...state,
    enumValues,
    loading: false,
    error: null
  })),
  on(EnumValueActions.searchEnumValuesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(EnumValueActions.enumValueUpdatedFromSignalR, (state, { enumValue }) => ({
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
  on(EnumValueActions.enumValueDeletedFromSignalR, (state, { id }) => ({
    ...state,
    enumValues: state.enumValues.filter(ev => ev.id !== id),
    fieldEnumValues: state.fieldEnumValues.filter(ev => ev.id !== id),
    currentEnumValue: state.currentEnumValue?.id === id ? null : state.currentEnumValue
  }))
);