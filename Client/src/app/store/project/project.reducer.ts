import { createReducer, on } from '@ngrx/store';
import * as ProjectActions from './project.actions';
import { Project } from '../../components/project/project.model';

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: any;
}

export const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null
};

export const projectReducer = createReducer(
  initialState,
  on(ProjectActions.loadProjects, state => ({
    ...state,
    loading: true
  })),
  on(ProjectActions.loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    loading: false,
    error: null
  })),
  on(ProjectActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProjectActions.loadProject, state => ({
    ...state,
    loading: true
  })),
  on(ProjectActions.loadProjectSuccess, (state, { project }) => ({
    ...state,
    currentProject: project,
    loading: false,
    error: null
  })),
  on(ProjectActions.loadProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProjectActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
    loading: false,
    error: null
  })),
  on(ProjectActions.createProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProjectActions.updateProjectSuccess, (state, { project }) => ({
    ...state,
    projects: state.projects.map(p => p.id === project.id ? project : p),
    currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    loading: false,
    error: null
  })),
  on(ProjectActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProjectActions.deleteProjectSuccess, (state, { id }) => ({
    ...state,
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject,
    loading: false,
    error: null
  })),
  on(ProjectActions.deleteProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProjectActions.searchProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    loading: false,
    error: null
  })),
  on(ProjectActions.searchProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ProjectActions.projectUpdatedFromSignalR, (state, { project }) => ({
    ...state,
    projects: state.projects.some(p => p.id === project.id) 
      ? state.projects.map(p => p.id === project.id ? project : p) 
      : [...state.projects, project],
    currentProject: state.currentProject?.id === project.id ? project : state.currentProject
  })),
  on(ProjectActions.projectDeletedFromSignalR, (state, { id }) => ({
    ...state,
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  }))
);