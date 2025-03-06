import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import * as ProjectActions from './project.actions';
import { inject } from '@angular/core';

@Injectable()
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);

  loadProjects$ = createEffect(() => this.actions$?.pipe(
    ofType(ProjectActions.loadProjects),
    switchMap(() => this.projectService.getProjects().pipe(
      map(projects => ProjectActions.loadProjectsSuccess({ projects })),
      catchError(error => of(ProjectActions.loadProjectsFailure({ error })))
    ))
  ));

  loadProject$ = createEffect(() => this.actions$?.pipe(
    ofType(ProjectActions.loadProject),
    switchMap(({ id }) => this.projectService.getProject(id).pipe(
      map(project => ProjectActions.loadProjectSuccess({ project })),
      catchError(error => of(ProjectActions.loadProjectFailure({ error })))
    ))
  ));

  createProject$ = createEffect(() => this.actions$?.pipe(
    ofType(ProjectActions.createProject),
    mergeMap(({ project }) => this.projectService.createProject(project).pipe(
      map(createdProject => ProjectActions.createProjectSuccess({ project: createdProject })),
      catchError(error => of(ProjectActions.createProjectFailure({ error })))
    ))
  ));

  updateProject$ = createEffect(() => this.actions$?.pipe(
    ofType(ProjectActions.updateProject),
    mergeMap(({ project }) => this.projectService.updateProject(project).pipe(
      map(() => ProjectActions.updateProjectSuccess({ project })),
      catchError(error => of(ProjectActions.updateProjectFailure({ error })))
    ))
  ));

  deleteProject$ = createEffect(() => this.actions$?.pipe(
    ofType(ProjectActions.deleteProject),
    mergeMap(({ id }) => this.projectService.deleteProject(id).pipe(
      map(() => ProjectActions.deleteProjectSuccess({ id })),
      catchError(error => of(ProjectActions.deleteProjectFailure({ error })))
    ))
  ));

  searchProjects$ = createEffect(() => this.actions$?.pipe(
    ofType(ProjectActions.searchProjects),
    switchMap(({ term }) => this.projectService.searchProjects(term).pipe(
      map(projects => ProjectActions.searchProjectsSuccess({ projects })),
      catchError(error => of(ProjectActions.searchProjectsFailure({ error })))
    ))
  ));
}