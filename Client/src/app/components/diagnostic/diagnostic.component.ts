// src/app/components/diagnostic/diagnostic.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AppState } from '../../store/app.state';
import { selectAllProjects, selectdummyy, selectProjectsLoading } from '../../store/project/project.selectors';
import { Project } from '../../models/project.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { loadProjects, createProjectSuccess } from '../../store/project/project.actions';

@Component({
  selector: 'app-diagnostic',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <p-card header="NgRx Diagnostic Tool" styleClass="mt-4">
      <div class="mb-4">
        <h3>Actions</h3>
        <button pButton type="button" label="Dispatch loadProjects" (click)="dispatchLoadProjects()" class="mr-2"></button>
        <button pButton type="button" label="Manually Create Test Project" (click)="createTestProject()" class="mr-2"></button>
      </div>

      <div class="mb-4">
        <h3>Store State</h3>
        <div>
          <h4>Loading: {{ loading$ | async }}</h4>
          <h4>Projects Count: {{ (projects$ | async)?.length || 0 }}</h4>
        </div>
      </div>

      <div class="mb-4">
        <h3>Projects Data</h3>
        <pre>{{ projectsJson$ | async }}</pre>
      </div>
    </p-card>
  `
})
export class DiagnosticComponent implements OnInit {
  projects$: Observable<Project[]>;
  projectsJson$: Observable<string>;
  loading$: Observable<boolean>;
  
  constructor(private store: Store<AppState>) {
    // Initialize observables
    this.projects$ = this.store.select(selectAllProjects);
    this.loading$ = this.store.select(selectProjectsLoading);
    this.projectsJson$ = this.store.select(selectdummyy)
      .pipe(map(projects => JSON.stringify(projects, null, 2)));
  }

  ngOnInit(): void {
    console.log('DiagnosticComponent initialized');
  }

  dispatchLoadProjects() {
    console.log('Manually dispatching loadProjects action');
    this.store.dispatch(loadProjects());
  }

  createTestProject() {
    console.log('Creating test project manually');
    const testProject: Project = {
      id: crypto.randomUUID(),
      name: 'Test Project ' + Date.now(),
      description: 'A test project created by the diagnostic tool',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      roots: []
    };
    
    this.store.dispatch(createProjectSuccess({ project: testProject }));
  }
}

// Don't forget to add this to your routes
// In app.routes.ts, add:
// {
//   path: 'diagnostic',
//   loadComponent: () => import('./components/diagnostic/diagnostic.component').then(m => m.DiagnosticComponent)
// }