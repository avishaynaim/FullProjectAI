import { createAction, props } from '@ngrx/store';
import { Root } from '../../models/root.model';

export const loadRoots = createAction('[Root] Load Roots');
export const loadRootsSuccess = createAction(
  '[Root] Load Roots Success',
  props<{ roots: Root[] }>()
);
export const loadRootsFailure = createAction(
  '[Root] Load Roots Failure',
  props<{ error: any }>()
);

export const loadRoot = createAction(
  '[Root] Load Root',
  props<{ id: string }>()
);
export const loadRootSuccess = createAction(
  '[Root] Load Root Success',
  props<{ root: Root }>()
);
export const loadRootFailure = createAction(
  '[Root] Load Root Failure',
  props<{ error: any }>()
);

export const loadRootsByProject = createAction(
  '[Root] Load Roots By Project',
  props<{ projectId: string }>()
);
export const loadRootsByProjectSuccess = createAction(
  '[Root] Load Roots By Project Success',
  props<{ roots: Root[] }>()
);
export const loadRootsByProjectFailure = createAction(
  '[Root] Load Roots By Project Failure',
  props<{ error: any }>()
);

export const createRoot = createAction(
  '[Root] Create Root',
  props<{ root: Root }>()
);
export const createRootSuccess = createAction(
  '[Root] Create Root Success',
  props<{ root: Root }>()
);
export const createRootFailure = createAction(
  '[Root] Create Root Failure',
  props<{ error: any }>()
);

export const updateRoot = createAction(
  '[Root] Update Root',
  props<{ root: Root }>()
);
export const updateRootSuccess = createAction(
  '[Root] Update Root Success',
  props<{ root: Root }>()
);
export const updateRootFailure = createAction(
  '[Root] Update Root Failure',
  props<{ error: any }>()
);

export const deleteRoot = createAction(
  '[Root] Delete Root',
  props<{ id: string }>()
);
export const deleteRootSuccess = createAction(
  '[Root] Delete Root Success',
  props<{ id: string }>()
);
export const deleteRootFailure = createAction(
  '[Root] Delete Root Failure',
  props<{ error: any }>()
);

export const searchRoots = createAction(
  '[Root] Search Roots',
  props<{ term: string }>()
);
export const searchRootsSuccess = createAction(
  '[Root] Search Roots Success',
  props<{ roots: Root[] }>()
);
export const searchRootsFailure = createAction(
  '[Root] Search Roots Failure',
  props<{ error: any }>()
);

export const exportRoot = createAction(
  '[Root] Export Root',
  props<{ id: string }>()
);
export const exportRootSuccess = createAction(
  '[Root] Export Root Success',
  props<{ xml: string }>()
);
export const exportRootFailure = createAction(
  '[Root] Export Root Failure',
  props<{ error: any }>()
);

export const exportAllRoots = createAction(
  '[Root] Export All Roots',
  props<{ projectId: string }>()
);
export const exportAllRootsSuccess = createAction(
  '[Root] Export All Roots Success',
  props<{ xml: string }>()
);
export const exportAllRootsFailure = createAction(
  '[Root] Export All Roots Failure',
  props<{ error: any }>()
);

export const rootUpdatedFromSignalR = createAction(
  '[Root] Root Updated From SignalR',
  props<{ root: Root }>()
);

export const rootDeletedFromSignalR = createAction(
  '[Root] Root Deleted From SignalR',
  props<{ id: string }>()
);