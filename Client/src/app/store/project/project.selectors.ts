import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>('projects');

export const selectAllProjects = createSelector(
  selectProjectState,
  state => state.projects
);
export const selectdummyy = createSelector(
  selectProjectState,
  state => state.dummy
);

export const selectCurrentProject = createSelector(
  selectProjectState,
  state => state.currentProject
);

export const selectProjectsLoading = createSelector(
  selectProjectState,
  state => state.loading
);

export const selectProjectsError = createSelector(
  selectProjectState,
  state => state.error
);

export const selectProjectById = (id: string) => createSelector(
  selectAllProjects,
  projects => projects.find(project => project.id === id) || null
);