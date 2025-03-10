import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { FieldService } from '../../services/field.service';
import { loadFields, loadFieldsSuccess, loadFieldsFailure, loadField, loadFieldSuccess, loadFieldFailure, loadFieldsByMessage, loadFieldsByMessageSuccess, loadFieldsByMessageFailure, loadFieldsByParent, loadFieldsByParentSuccess, loadFieldsByParentFailure, createField, createFieldSuccess, createFieldFailure, updateField, updateFieldSuccess, updateFieldFailure, deleteField, deleteFieldSuccess, deleteFieldFailure, searchFields, searchFieldsSuccess, searchFieldsFailure, exportField, exportFieldSuccess, exportFieldFailure } from './field.actions';

@Injectable()
export class FieldEffects {
  constructor(  ) {}
  private actions$ = inject(Actions);
  private fieldService = inject(FieldService);
  loadFields$ = createEffect(() => this.actions$?.pipe(
    ofType(loadFields),
    switchMap(() => this.fieldService.getFields().pipe(
      map(fields => loadFieldsSuccess({ fields })),
      catchError(error => of(loadFieldsFailure({ error })))
    ))
  ));

  loadField$ = createEffect(() => this.actions$?.pipe(
    ofType(loadField),
    switchMap(({ id }) => this.fieldService.getField(id).pipe(
      map(field => loadFieldSuccess({ field })),
      catchError(error => of(loadFieldFailure({ error })))
    ))
  ));

  loadFieldsByMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(loadFieldsByMessage),
    switchMap(({ messageId }) => this.fieldService.getFieldsByMessage(messageId).pipe(
      map(fields => loadFieldsByMessageSuccess({ fields })),
      catchError(error => of(loadFieldsByMessageFailure({ error })))
    ))
  ));

  loadFieldsByParent$ = createEffect(() => this.actions$?.pipe(
    ofType(loadFieldsByParent),
    switchMap(({ parentFieldId }) => this.fieldService.getFieldsByParent(parentFieldId).pipe(
      map(fields => loadFieldsByParentSuccess({ fields })),
      catchError(error => of(loadFieldsByParentFailure({ error })))
    ))
  ));

  createField$ = createEffect(() => this.actions$?.pipe(
    ofType(createField),
    mergeMap(({ field }) => this.fieldService.createField(field).pipe(
      map(createdField => createFieldSuccess({ field: createdField })),
      catchError(error => of(createFieldFailure({ error })))
    ))
  ));

  updateField$ = createEffect(() => this.actions$?.pipe(
    ofType(updateField),
    mergeMap(({ field }) => this.fieldService.updateField(field).pipe(
      map(() => updateFieldSuccess({ field })),
      catchError(error => of(updateFieldFailure({ error })))
    ))
  ));

  deleteField$ = createEffect(() => this.actions$?.pipe(
    ofType(deleteField),
    mergeMap(({ id }) => this.fieldService.deleteField(id).pipe(
      map(() => deleteFieldSuccess({ id })),
      catchError(error => of(deleteFieldFailure({ error })))
    ))
  ));

  searchFields$ = createEffect(() => this.actions$?.pipe(
    ofType(searchFields),
    switchMap(({ term }) => this.fieldService.searchFields(term).pipe(
      map(fields => searchFieldsSuccess({ fields })),
      catchError(error => of(searchFieldsFailure({ error })))
    ))
  ));

  exportField$ = createEffect(() => this.actions$?.pipe(
    ofType(exportField),
    switchMap(({ id }) => this.fieldService.exportField(id).pipe(
      map(xml => exportFieldSuccess({ xml })),
      catchError(error => of(exportFieldFailure({ error })))
    ))
  ));


}