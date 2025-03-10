import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { RootService } from '../../services/root.service';

import { Store } from '@ngrx/store';
import { loadRoots, loadRootsSuccess, loadRootsFailure, loadRoot, loadRootSuccess, loadRootFailure, loadRootsByProject, loadRootsByProjectSuccess, loadRootsByProjectFailure, createRoot, createRootSuccess, createRootFailure, updateRoot, updateRootSuccess, updateRootFailure, deleteRoot, deleteRootSuccess, deleteRootFailure, searchRoots, searchRootsSuccess, searchRootsFailure, exportRoot, exportRootSuccess, exportRootFailure, exportAllRoots, exportAllRootsSuccess, exportAllRootsFailure } from './root.actions';

@Injectable()
export class RootEffects {
    private actions$ = inject(Actions);
    private rootService = inject(RootService);
  constructor() {}

  loadRoots$ = createEffect(() => this.actions$.pipe(
    ofType(loadRoots),
    switchMap(() => this.rootService.getRoots().pipe(
      map(roots => loadRootsSuccess({ roots })),
      catchError(error => of(loadRootsFailure({ error })))
    ))
  ));

  loadRoot$ = createEffect(() => this.actions$.pipe(
    ofType(loadRoot),
    switchMap(({ id }) => this.rootService.getRoot(id).pipe(
      map(root => loadRootSuccess({ root })),
      catchError(error => of(loadRootFailure({ error })))
    ))
  ));

  loadRootsByProject$ = createEffect(() => this.actions$.pipe(
    ofType(loadRootsByProject),
    switchMap(({ projectId }) => this.rootService.getRootsByProject(projectId).pipe(
      map(roots => loadRootsByProjectSuccess({ roots })),
      catchError(error => of(loadRootsByProjectFailure({ error })))
    ))
  ));

  createRoot$ = createEffect(() => this.actions$.pipe(
    ofType(createRoot),
    mergeMap(({ root }) => this.rootService.createRoot(root).pipe(
      map(createdRoot => createRootSuccess({ root: createdRoot })),
      catchError(error => of(createRootFailure({ error })))
    ))
  ));

  updateRoot$ = createEffect(() => this.actions$.pipe(
    ofType(updateRoot),
    mergeMap(({ root }) => this.rootService.updateRoot(root).pipe(
      map(() => updateRootSuccess({ root })),
      catchError(error => of(updateRootFailure({ error })))
    ))
  ));

  deleteRoot$ = createEffect(() => this.actions$.pipe(
    ofType(deleteRoot),
    mergeMap(({ id }) => this.rootService.deleteRoot(id).pipe(
      map(() => deleteRootSuccess({ id })),
      catchError(error => of(deleteRootFailure({ error })))
    ))
  ));

  searchRoots$ = createEffect(() => this.actions$.pipe(
    ofType(searchRoots),
    switchMap(({ term }) => this.rootService.searchRoots(term).pipe(
      map(roots => searchRootsSuccess({ roots })),
      catchError(error => of(searchRootsFailure({ error })))
    ))
  ));

  exportRoot$ = createEffect(() => this.actions$.pipe(
    ofType(exportRoot),
    switchMap(({ id }) => this.rootService.exportRoot(id).pipe(
      map(xml => exportRootSuccess({ xml })),
      catchError(error => of(exportRootFailure({ error })))
    ))
  ));

  exportAllRoots$ = createEffect(() => this.actions$.pipe(
    ofType(exportAllRoots),
    switchMap(({ projectId }) => this.rootService.exportAllRoots(projectId).pipe(
      map(xml => exportAllRootsSuccess({ xml })),
      catchError(error => of(exportAllRootsFailure({ error })))
    ))
  ));
}