import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import { loadProjects, loadProjectsSuccess, loadProjectsFailure, createProject, createProjectFailure, createProjectSuccess, deleteProject, deleteProjectFailure, deleteProjectSuccess, loadProject, loadProjectFailure, loadProjectSuccess, searchProjects, searchProjectsFailure, searchProjectsSuccess, updateProject, updateProjectFailure, updateProjectSuccess } from './project.actions';
import { loadRootsByProjectSuccess } from '../root/root.actions';
import { Store } from '@ngrx/store';



@Injectable()
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);
  private store = inject(Store);

  constructor() {
  }
  //   allActions$ = createEffect(() => this.actions$.pipe(
  //     tap(action => console.log('Action in system:', action.type)),
  //     map(() => ({ type: '[Debug] Action Logged' }))
  //   ));
  //   // Add this to your ProjectEffects class
  //   debugEffect$ = createEffect(() => this.actions$.pipe(
  //     tap(action => console.log('Action received in effects:', action.type)),
  //     map(() => ({ type: '[Debug] Action Logged' }))
  //   ));
  loadProjects$ = createEffect(() => this.actions$?.pipe(
    tap(() => console.log('Loading projects...2')),
    ofType(loadProjects),
    switchMap(() => this.projectService.getProjects().pipe(
      map(projects => loadProjectsSuccess({ projects })),
      catchError(error => of(loadProjectsFailure({ error })))
    ))
  ));

  loadProject$ = createEffect(() => this.actions$.pipe(
    ofType(loadProject),
    switchMap(({ id }) => this.projectService.getProject(id).pipe(
      map(project => {
        // Dispatch loadRootsByProjectSuccess with the project's roots
        if (project && project.roots) {
          this.store.dispatch(loadRootsByProjectSuccess({ roots: project.roots }));
        }
        return loadProjectSuccess({ project });
      }),
      catchError(error => of(loadProjectFailure({ error })))
    ))
  ));

  createProject$ = createEffect(() => this.actions$.pipe(
    ofType(createProject),
    tap(({ project }) => console.log('ProjectEffects: createProject action received', project)),
    mergeMap(({ project }) => this.projectService.createProject(project).pipe(
      tap(createdProject => console.log('ProjectEffects: Project created successfully', createdProject)),
      map(createdProject => createProjectSuccess({ project: createdProject })),
      catchError(error => {
        console.error('ProjectEffects: Error creating project', error);
        return of(createProjectFailure({ error }));
      })
    ))
  ));

  updateProject$ = createEffect(() => this.actions$.pipe(
    ofType(updateProject),
    tap(({ project }) => console.log(`ProjectEffects: updateProject action received for id ${project.id}`, project)),
    mergeMap(({ project }) => this.projectService.updateProject(project).pipe(
      tap(() => console.log(`ProjectEffects: Project ${project.id} updated successfully`)),
      map(() => updateProjectSuccess({ project })),
      catchError(error => {
        console.error(`ProjectEffects: Error updating project ${project.id}`, error);
        return of(updateProjectFailure({ error }));
      })
    ))
  ));

  deleteProject$ = createEffect(() => this.actions$.pipe(
    ofType(deleteProject),
    tap(({ id }) => console.log(`ProjectEffects: deleteProject action received for id ${id}`)),
    mergeMap(({ id }) => this.projectService.deleteProject(id).pipe(
      tap(() => console.log(`ProjectEffects: Project ${id} deleted successfully`)),
      map(() => deleteProjectSuccess({ id })),
      catchError(error => {
        console.error(`ProjectEffects: Error deleting project ${id}`, error);
        return of(deleteProjectFailure({ error }));
      })
    ))
  ));

  searchProjects$ = createEffect(() => this.actions$.pipe(
    ofType(searchProjects),
    tap(({ term }) => console.log(`ProjectEffects: searchProjects action received with term "${term}"`)),
    switchMap(({ term }) => this.projectService.searchProjects(term).pipe(
      tap(projects => console.log('ProjectEffects: Projects search completed', projects)),
      map(projects => searchProjectsSuccess({ projects })),
      catchError(error => {
        console.error('ProjectEffects: Error searching projects', error);
        return of(searchProjectsFailure({ error }));
      })
    ))
  ));
}