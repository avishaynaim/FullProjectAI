// src/app/services/manual-effects.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { loadProjects, loadProjectsSuccess, loadProjectsFailure } from '../store/project/project.actions';
import { AppState } from '../store/app.state';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class ManualEffectsService {
  constructor(
    private store: Store<AppState>,
    private projectService: ProjectService
  ) {
    console.log('ManualEffectsService initialized');
    this.setupEffects();
  }

  setupEffects() {
    // Manual implementation of the loadProjects effect
    this.store.pipe(
      filter((action: any) => action.type === '[Project] Load Projects')
    ).subscribe(action => {
      console.log('Manual effect caught loadProjects action', action);
      
      this.projectService.getProjects().subscribe({
        next: projects => {
          console.log('Manual effect: projects loaded successfully', projects);
          this.store.dispatch(loadProjectsSuccess({ projects }));
        },
        error: error => {
          console.error('Manual effect: error loading projects', error);
          this.store.dispatch(loadProjectsFailure({ error }));
        }
      });
    });

    // You can add more manual effects here
  }
}