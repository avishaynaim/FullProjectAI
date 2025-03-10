import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { EnumValueService } from '../../services/enum-value.service';
import { loadEnumValues, loadEnumValuesSuccess, loadEnumValuesFailure, loadEnumValue, loadEnumValueSuccess, loadEnumValueFailure, loadEnumValuesByField, loadEnumValuesByFieldSuccess, loadEnumValuesByFieldFailure, createEnumValue, createEnumValueSuccess, createEnumValueFailure, updateEnumValue, updateEnumValueSuccess, updateEnumValueFailure, deleteEnumValue, deleteEnumValueSuccess, deleteEnumValueFailure, searchEnumValues, searchEnumValuesSuccess, searchEnumValuesFailure } from './enum-value.actions';

@Injectable()
export class EnumValueEffects {
  constructor(  ) {}
  private actions$ = inject(Actions);
  private enumValueService = inject(EnumValueService);
  loadEnumValues$ = createEffect(() => this.actions$?.pipe(
    ofType(loadEnumValues),
    switchMap(() => this.enumValueService.getEnumValues().pipe(
      map(enumValues => loadEnumValuesSuccess({ enumValues })),
      catchError(error => of(loadEnumValuesFailure({ error })))
    ))
  ));

  loadEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(loadEnumValue),
    switchMap(({ id }) => this.enumValueService.getEnumValue(id).pipe(
      map(enumValue => loadEnumValueSuccess({ enumValue })),
      catchError(error => of(loadEnumValueFailure({ error })))
    ))
  ));

  loadEnumValuesByField$ = createEffect(() => this.actions$?.pipe(
    ofType(loadEnumValuesByField),
    switchMap(({ fieldId }) => this.enumValueService.getEnumValuesByField(fieldId).pipe(
      map(enumValues => loadEnumValuesByFieldSuccess({ enumValues })),
      catchError(error => of(loadEnumValuesByFieldFailure({ error })))
    ))
  ));

  createEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(createEnumValue),
    mergeMap(({ enumValue }) => this.enumValueService.createEnumValue(enumValue).pipe(
      map(createdEnumValue => createEnumValueSuccess({ enumValue: createdEnumValue })),
      catchError(error => of(createEnumValueFailure({ error })))
    ))
  ));

  updateEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(updateEnumValue),
    mergeMap(({ enumValue }) => this.enumValueService.updateEnumValue(enumValue).pipe(
      map(() => updateEnumValueSuccess({ enumValue })),
      catchError(error => of(updateEnumValueFailure({ error })))
    ))
  ));

  deleteEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(deleteEnumValue),
    mergeMap(({ id }) => this.enumValueService.deleteEnumValue(id).pipe(
      map(() => deleteEnumValueSuccess({ id })),
      catchError(error => of(deleteEnumValueFailure({ error })))
    ))
  ));

  searchEnumValues$ = createEffect(() => this.actions$?.pipe(
    ofType(searchEnumValues),
    switchMap(({ term }) => this.enumValueService.searchEnumValues(term).pipe(
      map(enumValues => searchEnumValuesSuccess({ enumValues })),
      catchError(error => of(searchEnumValuesFailure({ error })))
    ))
  ));

 
}