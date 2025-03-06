import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EnumValueState } from './enum-value.reducer';

export const selectEnumValueState = createFeatureSelector<EnumValueState>('enumValues');

export const selectAllEnumValues = createSelector(
  selectEnumValueState,
  state => state.enumValues
);

export const selectCurrentEnumValue = createSelector(
  selectEnumValueState,
  state => state.currentEnumValue
);

export const selectFieldEnumValues = createSelector(
  selectEnumValueState,
  state => state.fieldEnumValues
);

export const selectEnumValuesLoading = createSelector(
  selectEnumValueState,
  state => state.loading
);

export const selectEnumValuesError = createSelector(
  selectEnumValueState,
  state => state.error
);

export const selectEnumValueById = (id: string) => createSelector(
  selectAllEnumValues,
  enumValues => enumValues.find(enumValue => enumValue.id === id) || null
);

export const selectEnumValuesByFieldId = (fieldId: string) => createSelector(
  selectAllEnumValues,
  enumValues => enumValues.filter(enumValue => enumValue.fieldId === fieldId)
);