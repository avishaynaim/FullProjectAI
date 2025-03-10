import { createAction, props } from '@ngrx/store';
import { Project } from '../../models/project.model';

export const loadProjects = createAction('[Project] Load Projects');
export const loadProjectsSuccess = createAction(
  '[Project] Load Projects Success',
  props<{ projects: Project[] }>()
);
export const loadProjectsFailure = createAction(
  '[Project] Load Projects Failure',
  props<{ error: any }>()
);

export const loadProject = createAction(
  '[Project] Load Project',
  props<{ id: string }>()
);
export const loadProjectSuccess = createAction(
  '[Project] Load Project Success',
  props<{ project: Project }>()
);
export const loadProjectFailure = createAction(
  '[Project] Load Project Failure',
  props<{ error: any }>()
);

export const createProject = createAction(
  '[Project] Create Project',
  props<{ project: Project }>()
);
export const createProjectSuccess = createAction(
  '[Project] Create Project Success',
  props<{ project: Project }>()
);
export const createProjectFailure = createAction(
  '[Project] Create Project Failure',
  props<{ error: any }>()
);

export const updateProject = createAction(
  '[Project] Update Project',
  props<{ project: Project }>()
);
export const updateProjectSuccess = createAction(
  '[Project] Update Project Success',
  props<{ project: Project }>()
);
export const updateProjectFailure = createAction(
  '[Project] Update Project Failure',
  props<{ error: any }>()
);

export const deleteProject = createAction(
  '[Project] Delete Project',
  props<{ id: string }>()
);
export const deleteProjectSuccess = createAction(
  '[Project] Delete Project Success',
  props<{ id: string }>()
);
export const deleteProjectFailure = createAction(
  '[Project] Delete Project Failure',
  props<{ error: any }>()
);

export const searchProjects = createAction(
  '[Project] Search Projects',
  props<{ term: string }>()
);
export const searchProjectsSuccess = createAction(
  '[Project] Search Projects Success',
  props<{ projects: Project[] }>()
);
export const searchProjectsFailure = createAction(
  '[Project] Search Projects Failure',
  props<{ error: any }>()
);

export const projectUpdatedFromSignalR = createAction(
  '[Project] Project Updated From SignalR',
  props<{ project: Project }>()
);

export const projectDeletedFromSignalR = createAction(
  '[Project] Project Deleted From SignalR',
  props<{ id: string }>()
);