import { createReducer, on } from '@ngrx/store';
import { Root } from '../../models/root.model';
import * as RootActions from './root.actions';

export interface RootState {
  roots: Root[];
  currentRoot: Root | null;
  projectRoots: Root[];
  loading: boolean;
  error: any;
  exportedXml: string | null;
}

export const initialState: RootState = {
  roots: [],
  currentRoot: null,
  projectRoots: [],
  loading: false,
  error: null,
  exportedXml: null
};

export const rootReducer = createReducer(
  initialState,
  on(RootActions.loadRoots, state => ({
    ...state,
    loading: true
  })),
  on(RootActions.loadRootsSuccess, (state, { roots }) => ({
    ...state,
    roots,
    loading: false,
    error: null
  })),
  on(RootActions.loadRootsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.loadRoot, state => ({
    ...state,
    loading: true
  })),
  on(RootActions.loadRootSuccess, (state, { root }) => ({
    ...state,
    currentRoot: root,
    loading: false,
    error: null
  })),
  on(RootActions.loadRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.loadRootsByProject, state => ({
    ...state,
    loading: true
  })),
  on(RootActions.loadRootsByProjectSuccess, (state, { roots }) => ({
    ...state,
    projectRoots: roots,
    loading: false,
    error: null
  })),
  on(RootActions.loadRootsByProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.createRootSuccess, (state, { root }) => ({
    ...state,
    roots: [...state.roots, root],
    projectRoots: root.projectId === state.projectRoots[0]?.projectId 
      ? [...state.projectRoots, root]
      : state.projectRoots,
    loading: false,
    error: null
  })),
  on(RootActions.createRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.updateRootSuccess, (state, { root }) => ({
    ...state,
    roots: state.roots.map(r => r.id === root.id ? root : r),
    projectRoots: state.projectRoots.map(r => r.id === root.id ? root : r),
    currentRoot: state.currentRoot?.id === root.id ? root : state.currentRoot,
    loading: false,
    error: null
  })),
  on(RootActions.updateRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.deleteRootSuccess, (state, { id }) => ({
    ...state,
    roots: state.roots.filter(r => r.id !== id),
    projectRoots: state.projectRoots.filter(r => r.id !== id),
    currentRoot: state.currentRoot?.id === id ? null : state.currentRoot,
    loading: false,
    error: null
  })),
  on(RootActions.deleteRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.searchRootsSuccess, (state, { roots }) => ({
    ...state,
    roots,
    loading: false,
    error: null
  })),
  on(RootActions.searchRootsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.exportRootSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(RootActions.exportRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.exportAllRootsSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(RootActions.exportAllRootsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RootActions.rootUpdatedFromSignalR, (state, { root }) => ({
    ...state,
    roots: state.roots.some(r => r.id === root.id) 
      ? state.roots.map(r => r.id === root.id ? root : r) 
      : [...state.roots, root],
    projectRoots: state.projectRoots.some(r => r.projectId === root.projectId)
      ? (state.projectRoots.some(r => r.id === root.id)
        ? state.projectRoots.map(r => r.id === root.id ? root : r)
        : [...state.projectRoots, root])
      : state.projectRoots,
    currentRoot: state.currentRoot?.id === root.id ? root : state.currentRoot
  })),
  on(RootActions.rootDeletedFromSignalR, (state, { id }) => ({
    ...state,
    roots: state.roots.filter(r => r.id !== id),
    projectRoots: state.projectRoots.filter(r => r.id !== id),
    currentRoot: state.currentRoot?.id === id ? null : state.currentRoot
  }))
);