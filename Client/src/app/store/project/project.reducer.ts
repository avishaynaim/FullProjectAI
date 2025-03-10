import { createReducer, on } from '@ngrx/store';
import { Project } from '../../models/project.model';
import { loadProjects, loadProjectsSuccess, loadProjectsFailure, loadProject, loadProjectSuccess, loadProjectFailure, createProjectSuccess, createProjectFailure, updateProjectSuccess, updateProjectFailure, deleteProjectSuccess, deleteProjectFailure, searchProjectsSuccess, searchProjectsFailure, projectUpdatedFromSignalR, projectDeletedFromSignalR } from './project.actions';

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: any;
  dummy: string;
}

export const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  dummy:'moshe'
};

export const projectReducer = createReducer(
  initialState,
  on(loadProjects, state => {
    console.log('Reducer: loadProjects action received');
    return({
    ...state,
    dummy:'david',
    loading: true
  })}),
  on(loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    loading: false,
    error: null
  })),
  on(loadProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(loadProject, state => ({
    ...state,
    loading: true
  })),
  on(loadProjectSuccess, (state, { project }) => ({
    ...state,
    currentProject: project,
    loading: false,
    error: null
  })),
  on(loadProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(createProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
    loading: false,
    error: null
  })),
  on(createProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(updateProjectSuccess, (state, { project }) => ({
    ...state,
    projects: state.projects.map(p => p.id === project.id ? project : p),
    currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    loading: false,
    error: null
  })),
  on(updateProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(deleteProjectSuccess, (state, { id }) => ({
    ...state,
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject,
    loading: false,
    error: null
  })),
  on(deleteProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(searchProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    loading: false,
    error: null
  })),
  on(searchProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(projectUpdatedFromSignalR, (state, { project }) => ({
    ...state,
    projects: state.projects.some(p => p.id === project.id) 
      ? state.projects.map(p => p.id === project.id ? project : p) 
      : [...state.projects, project],
    currentProject: state.currentProject?.id === project.id ? project : state.currentProject
  })),
  on(projectDeletedFromSignalR, (state, { id }) => ({
    ...state,
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  }))
);