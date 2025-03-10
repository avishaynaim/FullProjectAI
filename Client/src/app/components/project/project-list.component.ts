import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectAllProjects, selectProjectsLoading } from '../../store/project/project.selectors';
import { Project } from '../../models/project.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SearchBoxComponent } from '../shared/search-box/search-box.component';
import { loadProjects, updateProject, createProject, deleteProject, searchProjects } from '../../store/project/project.actions';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToolbarModule,
    ConfirmDialogModule,
    SearchBoxComponent,
    FormsModule,
    SearchBoxComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-bold m-0">Projects</h1>
        </div>
        <div class="p-toolbar-group-end">
          <app-search-box 
            (search)="onSearch($event)" 
            (clear)="onClearSearch()"
          ></app-search-box>
          <button 
            pButton 
            type="button" 
            label="New Project" 
            icon="pi pi-plus" 
            class="ml-2" 
            (click)="showCreateDialog()"
          ></button>
        </div>
      </p-toolbar>
      
      <p-table 
        [value]="projects" 
        [loading]="loading" 
        styleClass="p-datatable-sm p-datatable-gridlines mt-2"
        [paginator]="true" 
        [rows]="10" 
        [rowsPerPageOptions]="[10, 25, 50]" 
        [showCurrentPageReport]="true"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created Date</th>
            <th>Last Modified</th>
            <th style="width: 150px">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-project>
          <tr>
            <td>{{ project.name }}</td>
            <td>{{ project.description }}</td>
            <td>{{ project.createdDate | date }}</td>
            <td>{{ project.lastModifiedDate | date }}</td>
            <td>
              <div class="flex gap-2">
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-eye" 
                  class="p-button-sm p-button-info" 
                  [routerLink]="['/projects', project.id]"
                  pTooltip="View"
                ></button>
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-pencil" 
                  class="p-button-sm p-button-success" 
                  (click)="showEditDialog(project)"
                  pTooltip="Edit"
                ></button>
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-trash" 
                  class="p-button-sm p-button-danger" 
                  (click)="confirmDelete(project)"
                  pTooltip="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4">
              No projects found.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    
    <p-dialog 
      [(visible)]="dialogVisible" 
      [header]="dialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
    >
      <ng-container *ngIf="dialogVisible">
        <div class="p-fluid">
          <div class="field">
            <label for="name" class="font-bold">Name</label>
            <input 
              id="name" 
              type="text" 
              pInputText 
              [(ngModel)]="editingProject.name"
              class="w-full" 
            />
          </div>
          
          <div class="field">
            <label for="description" class="font-bold">Description</label>
            <textarea 
              id="description"
              pInputTextarea
              [(ngModel)]="editingProject.description"
              rows="3"
              class="w-full"
            ></textarea>
          </div>
          
          <div class="flex justify-content-end gap-2 mt-4">
            <button 
              pButton 
              type="button" 
              label="Cancel" 
              class="p-button-outlined" 
              (click)="dialogVisible = false"
            ></button>
            <button 
              pButton 
              type="button" 
              label="Save" 
              (click)="saveProject()"
            ></button>
          </div>
        </div>
      </ng-container>
    </p-dialog>
  `
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  dialogVisible = false;
  dialogHeader = '';
  editingProject: Partial<Project> = {};
  isEditing = false;

  constructor(
    private store: Store<AppState>,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadProjects();
    
    this.store.select(selectAllProjects).subscribe(projects => {
      this.projects = projects;
    });
    
    this.store.select(selectProjectsLoading).subscribe(loading => {
      this.loading = loading;
    });
  }

  loadProjects() {
    this.store.dispatch(loadProjects());
  }

  showCreateDialog() {
    this.editingProject = {};
    this.dialogHeader = 'Create New Project';
    this.isEditing = false;
    this.dialogVisible = true;
  }

  showEditDialog(project: Project) {
    this.editingProject = { ...project };
    this.dialogHeader = 'Edit Project';
    this.isEditing = true;
    this.dialogVisible = true;
  }

  saveProject() {
    if (this.isEditing) {
      const project = this.editingProject as Project;
      this.store.dispatch(updateProject({ project }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated successfully' });
    } else {
      const newProject: Project = {
        id: '',
        name: this.editingProject.name || '',
        description: this.editingProject.description || '',
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        roots: []
      };
      this.store.dispatch(createProject({ project: newProject }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project created successfully' });
    }
    this.dialogVisible = false;
  }

  confirmDelete(project: Project) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the project "${project.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteProject({ id: project.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project deleted successfully' });
      }
    });
  }

  onSearch(term: string) {
    if (term) {
      this.store.dispatch(searchProjects({ term }));
    } else {
      this.loadProjects();
    }
  }

  onClearSearch() {
    this.loadProjects();
  }
}