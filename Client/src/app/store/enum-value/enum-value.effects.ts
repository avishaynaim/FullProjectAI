import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { EnumValueService } from '../../services/enum-value.service';
import * as EnumValueActions from './enum-value.actions';

@Injectable()
export class EnumValueEffects {
  loadEnumValues$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.loadEnumValues),
    switchMap(() => this.enumValueService.getEnumValues().pipe(
      map(enumValues => EnumValueActions.loadEnumValuesSuccess({ enumValues })),
      catchError(error => of(EnumValueActions.loadEnumValuesFailure({ error })))
    ))
  ));

  loadEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.loadEnumValue),
    switchMap(({ id }) => this.enumValueService.getEnumValue(id).pipe(
      map(enumValue => EnumValueActions.loadEnumValueSuccess({ enumValue })),
      catchError(error => of(EnumValueActions.loadEnumValueFailure({ error })))
    ))
  ));

  loadEnumValuesByField$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.loadEnumValuesByField),
    switchMap(({ fieldId }) => this.enumValueService.getEnumValuesByField(fieldId).pipe(
      map(enumValues => EnumValueActions.loadEnumValuesByFieldSuccess({ enumValues })),
      catchError(error => of(EnumValueActions.loadEnumValuesByFieldFailure({ error })))
    ))
  ));

  createEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.createEnumValue),
    mergeMap(({ enumValue }) => this.enumValueService.createEnumValue(enumValue).pipe(
      map(createdEnumValue => EnumValueActions.createEnumValueSuccess({ enumValue: createdEnumValue })),
      catchError(error => of(EnumValueActions.createEnumValueFailure({ error })))
    ))
  ));

  updateEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.updateEnumValue),
    mergeMap(({ enumValue }) => this.enumValueService.updateEnumValue(enumValue).pipe(
      map(() => EnumValueActions.updateEnumValueSuccess({ enumValue })),
      catchError(error => of(EnumValueActions.updateEnumValueFailure({ error })))
    ))
  ));

  deleteEnumValue$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.deleteEnumValue),
    mergeMap(({ id }) => this.enumValueService.deleteEnumValue(id).pipe(
      map(() => EnumValueActions.deleteEnumValueSuccess({ id })),
      catchError(error => of(EnumValueActions.deleteEnumValueFailure({ error })))
    ))
  ));

  searchEnumValues$ = createEffect(() => this.actions$?.pipe(
    ofType(EnumValueActions.searchEnumValues),
    switchMap(({ term }) => this.enumValueService.searchEnumValues(term).pipe(
      map(enumValues => EnumValueActions.searchEnumValuesSuccess({ enumValues })),
      catchError(error => of(EnumValueActions.searchEnumValuesFailure({ error })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private enumValueService: EnumValueService
  ) {}
}