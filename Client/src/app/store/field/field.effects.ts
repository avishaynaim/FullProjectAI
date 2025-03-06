import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { FieldService } from '../../services/field.service';
import * as FieldActions from './field.actions';

@Injectable()
export class FieldEffects {
  loadFields$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.loadFields),
    switchMap(() => this.fieldService.getFields().pipe(
      map(fields => FieldActions.loadFieldsSuccess({ fields })),
      catchError(error => of(FieldActions.loadFieldsFailure({ error })))
    ))
  ));

  loadField$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.loadField),
    switchMap(({ id }) => this.fieldService.getField(id).pipe(
      map(field => FieldActions.loadFieldSuccess({ field })),
      catchError(error => of(FieldActions.loadFieldFailure({ error })))
    ))
  ));

  loadFieldsByMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.loadFieldsByMessage),
    switchMap(({ messageId }) => this.fieldService.getFieldsByMessage(messageId).pipe(
      map(fields => FieldActions.loadFieldsByMessageSuccess({ fields })),
      catchError(error => of(FieldActions.loadFieldsByMessageFailure({ error })))
    ))
  ));

  loadFieldsByParent$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.loadFieldsByParent),
    switchMap(({ parentFieldId }) => this.fieldService.getFieldsByParent(parentFieldId).pipe(
      map(fields => FieldActions.loadFieldsByParentSuccess({ fields })),
      catchError(error => of(FieldActions.loadFieldsByParentFailure({ error })))
    ))
  ));

  createField$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.createField),
    mergeMap(({ field }) => this.fieldService.createField(field).pipe(
      map(createdField => FieldActions.createFieldSuccess({ field: createdField })),
      catchError(error => of(FieldActions.createFieldFailure({ error })))
    ))
  ));

  updateField$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.updateField),
    mergeMap(({ field }) => this.fieldService.updateField(field).pipe(
      map(() => FieldActions.updateFieldSuccess({ field })),
      catchError(error => of(FieldActions.updateFieldFailure({ error })))
    ))
  ));

  deleteField$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.deleteField),
    mergeMap(({ id }) => this.fieldService.deleteField(id).pipe(
      map(() => FieldActions.deleteFieldSuccess({ id })),
      catchError(error => of(FieldActions.deleteFieldFailure({ error })))
    ))
  ));

  searchFields$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.searchFields),
    switchMap(({ term }) => this.fieldService.searchFields(term).pipe(
      map(fields => FieldActions.searchFieldsSuccess({ fields })),
      catchError(error => of(FieldActions.searchFieldsFailure({ error })))
    ))
  ));

  exportField$ = createEffect(() => this.actions$?.pipe(
    ofType(FieldActions.exportField),
    switchMap(({ id }) => this.fieldService.exportField(id).pipe(
      map(xml => FieldActions.exportFieldSuccess({ xml })),
      catchError(error => of(FieldActions.exportFieldFailure({ error })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private fieldService: FieldService
  ) {}
}