// src/app/components/ngrx-diagnostic/ngrx-diagnostic.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { AppState } from '../store/app.state';
import { ManualEffectsService } from '../services/ManualEffectsService';
import { loadProjects } from '../store/project/project.actions';
import { selectProjectsLoading, selectAllProjects } from '../store/project/project.selectors';

@Component({
  selector: 'app-ngrx-diagnostic',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <p-card header="NgRx Diagnostic Tool" styleClass="mt-4">
      <div class="mb-4">
        <h3>Actions</h3>
        <button pButton type="button" label="Dispatch loadProjects Action" (click)="dispatchLoadProjects()" class="mr-2"></button>
        <button pButton type="button" label="Direct API Call" (click)="directApiCall()" class="mr-2"></button>
      </div>

      <div class="mb-4">
        <h3>Create Custom Action</h3>
        <div class="p-inputgroup mb-2">
          <span class="p-inputgroup-addon">Action Type</span>
          <input type="text" pInputText [(ngModel)]="customActionType" placeholder="[Custom] Action Type">
        </div>
        <button pButton type="button" label="Dispatch Custom Action" (click)="dispatchCustomAction()" class="mr-2"></button>
      </div>

      <div class="mb-4">
        <h3>Store State</h3>
        <div>
          <h4>Loading: {{ loading }}</h4>
          <h4>Projects Count: {{ projectsCount }}</h4>
        </div>
      </div>

      <div class="mb-4">
        <h3>Projects Data</h3>
        <pre>{{ projectsJson }}</pre>
      </div>

      <div class="mb-4">
        <h3>Logs</h3>
        <pre>{{ logs }}</pre>
      </div>
    </p-card>
  `
})
export class NgRxDiagnosticComponent implements OnInit {
  customActionType = '[Custom] Test Action';
  loading = false;
  projectsCount = 0;
  projectsJson = '';
  logs = '';

  constructor(
    private store: Store<AppState>,
    private projectService: ProjectService,
    private manualEffectsService: ManualEffectsService // Just injecting to activate it
  ) {
    console.log('NgRxDiagnosticComponent initialized');
  }

  ngOnInit(): void {
    this.addLog('Component initialized');
    
    // Subscribe to store selectors
    this.store.select(selectProjectsLoading).subscribe(loading => {
      this.loading = loading;
      this.addLog(`Loading state changed: ${loading}`);
    });
    
    this.store.select(selectAllProjects).subscribe(projects => {
      this.projectsCount = projects.length;
      this.projectsJson = JSON.stringify(projects, null, 2);
      this.addLog(`Projects updated: ${projects.length} items`);
    });

    // Subscribe to all actions in the store for debugging
    (this.store as any).actionsObserver.subscribe((action: any) => {
      this.addLog(`Action dispatched: ${action.type}`);
    });
  }

  dispatchLoadProjects() {
    this.addLog('Dispatching loadProjects action');
    const action = loadProjects();
    this.addLog(`Action type: ${action.type}`);
    this.store.dispatch(action);
  }

  directApiCall() {
    this.addLog('Making direct API call to get projects');
    this.projectService.getProjects().subscribe({
      next: projects => {
        this.addLog(`API call successful: ${projects.length} projects received`);
      },
      error: err => {
        this.addLog(`API call failed: ${err.message}`);
      }
    });
  }

  dispatchCustomAction() {
    this.addLog(`Dispatching custom action: ${this.customActionType}`);
    this.store.dispatch({ type: this.customActionType });
  }

  addLog(message: string) {
    const timestamp = new Date().toISOString().substr(11, 8);
    this.logs = `[${timestamp}] ${message}\n${this.logs}`;
    console.log(`[NgRxDiagnostic] ${message}`);
  }
}