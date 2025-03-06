import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RootState } from './root.reducer';

export const selectRootState = createFeatureSelector<RootState>('roots');

export const selectAllRoots = createSelector(
  selectRootState,
  state => state.roots
);

export const selectCurrentRoot = createSelector(
  selectRootState,
  state => state.currentRoot
);

export const selectProjectRoots = createSelector(
  selectRootState,
  state => state.projectRoots
);

export const selectRootsLoading = createSelector(
  selectRootState,
  state => state.loading
);

export const selectRootsError = createSelector(
  selectRootState,
  state => state.error
);

export const selectExportedXml = createSelector(
  selectRootState,
  state => state.exportedXml
);

export const selectRootById = (id: string) => createSelector(
  selectAllRoots,
  roots => roots.find(root => root.id === id) || null
);

export const selectRootsByProjectId = (projectId: string) => createSelector(
  selectAllRoots,
  roots => roots.filter(root => root.projectId === projectId)
);