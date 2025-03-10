import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import { loadProjects, loadProjectsSuccess, loadProjectsFailure } from './project.actions';



@Injectable()
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);

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

  // loadProjects$ = createEffect(() => this.actions$.pipe(
  //   tap(action => console.log('YES:', action.type)),
  //   filter(action => action.type === '[Project] Load Projects'), // Use string literal
  //   tap(() => console.log('Action matched by string literal')),
  //   switchMap(() => of(loadProjectsSuccess({ projects: [] })))
  // ));

//   loadProject$ = createEffect(() => this.actions$.pipe(
//     ofType(ProjectActions.loadProject),
//     tap(({ id }) => console.log(`ProjectEffects: loadProject action received for id ${id}`)),
//     switchMap(({ id }) => this.projectService.getProject(id).pipe(
//       tap(project => console.log(`ProjectEffects: Project ${id} loaded successfully`, project)),
//       map(project => ProjectActions.loadProjectSuccess({ project })),
//       catchError(error => {
//         console.error(`ProjectEffects: Error loading project ${id}`, error);
//         return of(ProjectActions.loadProjectFailure({ error }));
//       })
//     ))
//   ));

//   createProject$ = createEffect(() => this.actions$.pipe(
//     ofType(ProjectActions.createProject),
//     tap(({ project }) => console.log('ProjectEffects: createProject action received', project)),
//     mergeMap(({ project }) => this.projectService.createProject(project).pipe(
//       tap(createdProject => console.log('ProjectEffects: Project created successfully', createdProject)),
//       map(createdProject => ProjectActions.createProjectSuccess({ project: createdProject })),
//       catchError(error => {
//         console.error('ProjectEffects: Error creating project', error);
//         return of(ProjectActions.createProjectFailure({ error }));
//       })
//     ))
//   ));

//   updateProject$ = createEffect(() => this.actions$.pipe(
//     ofType(ProjectActions.updateProject),
//     tap(({ project }) => console.log(`ProjectEffects: updateProject action received for id ${project.id}`, project)),
//     mergeMap(({ project }) => this.projectService.updateProject(project).pipe(
//       tap(() => console.log(`ProjectEffects: Project ${project.id} updated successfully`)),
//       map(() => ProjectActions.updateProjectSuccess({ project })),
//       catchError(error => {
//         console.error(`ProjectEffects: Error updating project ${project.id}`, error);
//         return of(ProjectActions.updateProjectFailure({ error }));
//       })
//     ))
//   ));

//   deleteProject$ = createEffect(() => this.actions$.pipe(
//     ofType(ProjectActions.deleteProject),
//     tap(({ id }) => console.log(`ProjectEffects: deleteProject action received for id ${id}`)),
//     mergeMap(({ id }) => this.projectService.deleteProject(id).pipe(
//       tap(() => console.log(`ProjectEffects: Project ${id} deleted successfully`)),
//       map(() => ProjectActions.deleteProjectSuccess({ id })),
//       catchError(error => {
//         console.error(`ProjectEffects: Error deleting project ${id}`, error);
//         return of(ProjectActions.deleteProjectFailure({ error }));
//       })
//     ))
//   ));

//   searchProjects$ = createEffect(() => this.actions$.pipe(
//     ofType(ProjectActions.searchProjects),
//     tap(({ term }) => console.log(`ProjectEffects: searchProjects action received with term "${term}"`)),
//     switchMap(({ term }) => this.projectService.searchProjects(term).pipe(
//       tap(projects => console.log('ProjectEffects: Projects search completed', projects)),
//       map(projects => ProjectActions.searchProjectsSuccess({ projects })),
//       catchError(error => {
//         console.error('ProjectEffects: Error searching projects', error);
//         return of(ProjectActions.searchProjectsFailure({ error }));
//       })
//     ))
//   ));
}