import { createReducer, on } from '@ngrx/store';
import { Root } from '../../models/root.model';
import { loadRoots, loadRootsSuccess, loadRootsFailure, loadRoot, loadRootSuccess, loadRootFailure, loadRootsByProject, loadRootsByProjectSuccess, loadRootsByProjectFailure, createRootSuccess, createRootFailure, updateRootSuccess, updateRootFailure, deleteRootSuccess, deleteRootFailure, searchRootsSuccess, searchRootsFailure, exportRootSuccess, exportRootFailure, exportAllRootsSuccess, exportAllRootsFailure, rootUpdatedFromSignalR, rootDeletedFromSignalR } from './root.actions';

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
  on(loadRoots, state => ({
    ...state,
    loading: true
  })),
  on(loadRootsSuccess, (state, { roots }) => ({
    ...state,
    roots,
    loading: false,
    error: null
  })),
  on(loadRootsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadRoot, state => ({
    ...state,
    loading: true
  })),
  on(loadRootSuccess, (state, { root }) => ({
    ...state,
    currentRoot: root,
    loading: false,
    error: null
  })),
  on(loadRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadRootsByProject, state => ({
    ...state,
    loading: true
  })),
  on(loadRootsByProjectSuccess, (state, { roots }) => ({
    ...state,
    projectRoots: roots,
    loading: false,
    error: null
  })),
  on(loadRootsByProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(createRootSuccess, (state, { root }) => ({
    ...state,
    roots: [...state.roots, root],
    projectRoots: root.projectId === state.projectRoots[0]?.projectId 
      ? [...state.projectRoots, root]
      : state.projectRoots,
    loading: false,
    error: null
  })),
  on(createRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(updateRootSuccess, (state, { root }) => ({
    ...state,
    roots: state.roots.map(r => r.id === root.id ? root : r),
    projectRoots: state.projectRoots.map(r => r.id === root.id ? root : r),
    currentRoot: state.currentRoot?.id === root.id ? root : state.currentRoot,
    loading: false,
    error: null
  })),
  on(updateRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(deleteRootSuccess, (state, { id }) => ({
    ...state,
    roots: state.roots.filter(r => r.id !== id),
    projectRoots: state.projectRoots.filter(r => r.id !== id),
    currentRoot: state.currentRoot?.id === id ? null : state.currentRoot,
    loading: false,
    error: null
  })),
  on(deleteRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(searchRootsSuccess, (state, { roots }) => ({
    ...state,
    roots,
    loading: false,
    error: null
  })),
  on(searchRootsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(exportRootSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(exportRootFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(exportAllRootsSuccess, (state, { xml }) => ({
    ...state,
    exportedXml: xml,
    loading: false,
    error: null
  })),
  on(exportAllRootsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(rootUpdatedFromSignalR, (state, { root }) => ({
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
  on(rootDeletedFromSignalR, (state, { id }) => ({
    ...state,
    roots: state.roots.filter(r => r.id !== id),
    projectRoots: state.projectRoots.filter(r => r.id !== id),
    currentRoot: state.currentRoot?.id === id ? null : state.currentRoot
  }))
);