import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { RootService } from '../../services/root.service';
import * as RootActions from './root.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class RootEffects {
  constructor(private actions$: Actions,private rootService: RootService) {}

  loadRoots$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.loadRoots),
    switchMap(() => this.rootService.getRoots().pipe(
      map(roots => RootActions.loadRootsSuccess({ roots })),
      catchError(error => of(RootActions.loadRootsFailure({ error })))
    ))
  ));

  loadRoot$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.loadRoot),
    switchMap(({ id }) => this.rootService.getRoot(id).pipe(
      map(root => RootActions.loadRootSuccess({ root })),
      catchError(error => of(RootActions.loadRootFailure({ error })))
    ))
  ));

  loadRootsByProject$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.loadRootsByProject),
    switchMap(({ projectId }) => this.rootService.getRootsByProject(projectId).pipe(
      map(roots => RootActions.loadRootsByProjectSuccess({ roots })),
      catchError(error => of(RootActions.loadRootsByProjectFailure({ error })))
    ))
  ));

  createRoot$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.createRoot),
    mergeMap(({ root }) => this.rootService.createRoot(root).pipe(
      map(createdRoot => RootActions.createRootSuccess({ root: createdRoot })),
      catchError(error => of(RootActions.createRootFailure({ error })))
    ))
  ));

  updateRoot$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.updateRoot),
    mergeMap(({ root }) => this.rootService.updateRoot(root).pipe(
      map(() => RootActions.updateRootSuccess({ root })),
      catchError(error => of(RootActions.updateRootFailure({ error })))
    ))
  ));

  deleteRoot$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.deleteRoot),
    mergeMap(({ id }) => this.rootService.deleteRoot(id).pipe(
      map(() => RootActions.deleteRootSuccess({ id })),
      catchError(error => of(RootActions.deleteRootFailure({ error })))
    ))
  ));

  searchRoots$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.searchRoots),
    switchMap(({ term }) => this.rootService.searchRoots(term).pipe(
      map(roots => RootActions.searchRootsSuccess({ roots })),
      catchError(error => of(RootActions.searchRootsFailure({ error })))
    ))
  ));

  exportRoot$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.exportRoot),
    switchMap(({ id }) => this.rootService.exportRoot(id).pipe(
      map(xml => RootActions.exportRootSuccess({ xml })),
      catchError(error => of(RootActions.exportRootFailure({ error })))
    ))
  ));

  exportAllRoots$ = createEffect(() => this.actions$.pipe(
    ofType(RootActions.exportAllRoots),
    switchMap(({ projectId }) => this.rootService.exportAllRoots(projectId).pipe(
      map(xml => RootActions.exportAllRootsSuccess({ xml })),
      catchError(error => of(RootActions.exportAllRootsFailure({ error })))
    ))
  ));
}