import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AppState } from '../../store/app.state';
import * as ProjectActions from '../../store/project/project.actions';
import * as RootActions from '../../store/root/root.actions';
import { selectProjectById } from '../../store/project/project.selectors';
import { selectRootsByProjectId } from '../../store/root/root.selectors';
import { Root } from '../../models/root.model';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { TreeNode } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';
import { SearchBoxComponent } from '../shared/search-box/search-box.component';
import { SignalRService } from '../../services/signalr.service';
import { Project } from './project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    TreeModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    TabViewModule,
    SearchBoxComponent,
    FormsModule,
    SearchBoxComponent,
    BreadcrumbComponent
],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="mb-4">
        <app-breadcrumb [breadcrumbs]="breadcrumbs"></app-breadcrumb>
      </div>
      
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-bold m-0" *ngIf="project">{{ project.name }}</h1>
        </div>
        <div class="p-toolbar-group-end">
          <app-search-box 
            (search)="onSearch($event)" 
            (clear)="onClearSearch()"
          ></app-search-box>
          <button 
            pButton 
            type="button" 
            label="New Root" 
            icon="pi pi-plus" 
            class="ml-2" 
            (click)="showCreateRootDialog()"
          ></button>
          <button 
            pButton 
            type="button" 
            label="Export All" 
            icon="pi pi-download" 
            class="p-button-success ml-2" 
            (click)="exportAllRoots()"
            [disabled]="!roots.length"
          ></button>
        </div>
      </p-toolbar>
      
      <p-tabView styleClass="mt-4">
        <p-tabPanel header="Tree View">
          <div class="grid">
            <div class="col-4">
              <p-tree 
                [value]="treeNodes" 
                selectionMode="single" 
                [(selection)]="selectedNode"
                (onNodeSelect)="onNodeSelect($event)"
                styleClass="w-full"
              ></p-tree>
            </div>
            <div class="col-8">
              <p-card *ngIf="selectedNode" [header]="getSelectedNodeHeader()">
                <div class="mb-4" *ngIf="selectedNodeDetails">
                  <div class="grid">
                    <div class="col-3 font-bold">Name:</div>
                    <div class="col-9">{{ selectedNodeDetails.name }}</div>
                    
                    <div class="col-3 font-bold">Description:</div>
                    <div class="col-9">{{ selectedNodeDetails.description }}</div>
                    
                    <div class="col-3 font-bold">Created:</div>
                    <div class="col-9">{{ selectedNodeDetails.createdDate | date }}</div>
                    
                    <div class="col-3 font-bold">Last Modified:</div>
                    <div class="col-9">{{ selectedNodeDetails.lastModifiedDate | date }}</div>
                  </div>
                </div>
                
                <div class="flex justify-content-end gap-2">
                  <button 
                    pButton 
                    type="button" 
                    icon="pi pi-eye" 
                    label="View Details" 
                    (click)="viewNodeDetails()"
                  ></button>
                  <button 
                    pButton 
                    type="button" 
                    icon="pi pi-pencil" 
                    label="Edit" 
                    class="p-button-success" 
                    (click)="editSelectedNode()"
                  ></button>
                  <button 
                    pButton 
                    type="button" 
                    icon="pi pi-trash" 
                    label="Delete" 
                    class="p-button-danger" 
                    (click)="deleteSelectedNode()"
                  ></button>
                  <button 
                    pButton 
                    type="button" 
                    icon="pi pi-download" 
                    label="Export" 
                    class="p-button-info" 
                    (click)="exportSelectedNode()"
                    *ngIf="selectedNode.type !== 'project'"
                  ></button>
                </div>
              </p-card>
              
              <div *ngIf="!selectedNode" class="flex align-items-center justify-content-center" style="height: 300px;">
                <div class="text-center">
                  <i class="pi pi-arrow-left text-4xl text-gray-400 mb-3"></i>
                  <p class="text-xl text-gray-500">Select an item from the tree to view details</p>
                </div>
              </div>
            </div>
          </div>
        </p-tabPanel>
        <p-tabPanel header="Roots List">
          <p-table 
            [value]="roots" 
            styleClass="p-datatable-sm p-datatable-gridlines"
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
                <th>Messages</th>
                <th>Created Date</th>
                <th>Last Modified</th>
                <th style="width: 150px">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-root>
              <tr>
                <td>{{ root.name }}</td>
                <td>{{ root.description }}</td>
                <td>{{ root.messages?.length || 0 }}</td>
                <td>{{ root.createdDate | date }}</td>
                <td>{{ root.lastModifiedDate | date }}</td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      pButton 
                      type="button" 
                      icon="pi pi-eye" 
                      class="p-button-sm p-button-info" 
                      [routerLink]="['/roots', root.id]"
                      pTooltip="View"
                    ></button>
                    <button 
                      pButton 
                      type="button" 
                      icon="pi pi-pencil" 
                      class="p-button-sm p-button-success" 
                      (click)="showEditRootDialog(root)"
                      pTooltip="Edit"
                    ></button>
                    <button 
                      pButton 
                      type="button" 
                      icon="pi pi-trash" 
                      class="p-button-sm p-button-danger" 
                      (click)="confirmDeleteRoot(root)"
                      pTooltip="Delete"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-tabPanel>
      </p-tabView>
    </div>
    
    <p-dialog 
      [(visible)]="rootDialogVisible" 
      [header]="rootDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
    >
      <ng-container *ngIf="rootDialogVisible">
        <div class="p-fluid">
          <div class="field">
            <label for="rootName" class="font-bold">Name</label>
            <input 
              id="rootName" 
              type="text" 
              pInputText 
              [(ngModel)]="editingRoot.name"
              class="w-full" 
            />
          </div>
          
          <div class="field">
            <label for="rootDescription" class="font-bold">Description</label>
            <textarea 
              id="rootDescription"
              pInputTextarea
              [(ngModel)]="editingRoot.description"
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
              (click)="rootDialogVisible = false"
            ></button>
            <button 
              pButton 
              type="button" 
              label="Save" 
              (click)="saveRoot()"
            ></button>
          </div>
        </div>
      </ng-container>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="exportDialogVisible"
      header="Exported XML"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '80vw'}"
    >
      <div class="p-3 border rounded bg-gray-100 overflow-auto" style="max-height: 70vh">
        <pre>{{ exportedXml }}</pre>
      </div>
      <div class="flex justify-content-end mt-4">
        <button 
          pButton 
          type="button" 
          label="Copy" 
          icon="pi pi-copy" 
          (click)="copyToClipboard(exportedXml)"
        ></button>
        <button 
          pButton 
          type="button" 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-outlined ml-2" 
          (click)="exportDialogVisible = false"
        ></button>
      </div>
    </p-dialog>
  `
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  projectId: string = '';
  project: Project | null = null;
  roots: Root[] = [];
  treeNodes: TreeNode[] = [];
  selectedNode: any = null;
  selectedNodeDetails: any = null;
  breadcrumbs: Breadcrumb[] = [
    { label: 'Projects', routerLink: ['/projects'] },
    { label: 'Project Details' }
  ];
  
  rootDialogVisible = false;
  rootDialogHeader = '';
  editingRoot: Partial<Root> = {};
  isEditingRoot = false;
  
  exportDialogVisible = false;
  exportedXml: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private signalRService: SignalRService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.projectId = params['id'];
      
      // Load project details
      this.store.dispatch(ProjectActions.loadProject({ id: this.projectId }));
      
      // Load roots for this project
      this.store.dispatch(RootActions.loadRootsByProject({ projectId: this.projectId }));
      
      // Join SignalR group for this project
      this.signalRService.joinProject(this.projectId);
      
      // Subscribe to project data
      this.store.select(selectProjectById(this.projectId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(project => {
        if (project) {
          this.project = project;
          this.breadcrumbs[1].label = project.name;
          this.updateTreeNodes();
        }
      });
      
      // Subscribe to roots data
      this.store.select(selectRootsByProjectId(this.projectId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(roots => {
        this.roots = roots;
        this.updateTreeNodes();
      });
    });
  }

  ngOnDestroy() {
    // Leave SignalR group
    if (this.projectId) {
      this.signalRService.leaveProject(this.projectId);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateTreeNodes() {
    if (!this.project) return;
    
    const projectNode: TreeNode = {
      key: this.project.id,
      label: this.project.name,
      type: 'project',
      data: this.project,
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: [],
      expanded: true
    };
    
    if (this.roots && this.roots.length > 0) {
      projectNode.children = this.roots.map(root => this.createRootNode(root));
    }
    
    this.treeNodes = [projectNode];
    
    // If a node was selected, try to find it again after the tree updates
    if (this.selectedNode) {
      this.findAndSelectNode(this.selectedNode.key);
    }
  }

  createRootNode(root: Root): TreeNode {
    return {
      key: root.id,
      label: root.name,
      type: 'root',
      data: root,
      expandedIcon: 'pi pi-sitemap',
      collapsedIcon: 'pi pi-sitemap',
      children: [],
      expanded: false
    };
  }

  findAndSelectNode(key: string) {
    const findNode = (nodes: TreeNode[]): TreeNode | null => {
      for (const node of nodes) {
        if (node.key === key) {
          return node;
        }
        if (node.children) {
          const found = findNode(node.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    
    const found = findNode(this.treeNodes);
    if (found) {
      this.selectedNode = found;
      this.updateSelectedNodeDetails();
    } else {
      this.selectedNode = null;
      this.selectedNodeDetails = null;
    }
  }

  onNodeSelect(event: any) {
    this.updateSelectedNodeDetails();
  }

  updateSelectedNodeDetails() {
    if (!this.selectedNode) {
      this.selectedNodeDetails = null;
      return;
    }
    
    this.selectedNodeDetails = this.selectedNode.data;
  }

  getSelectedNodeHeader(): string {
    if (!this.selectedNode) return '';
    
    const type = this.selectedNode.type.charAt(0).toUpperCase() + this.selectedNode.type.slice(1);
    return `${type} Details: ${this.selectedNode.label}`;
  }

  viewNodeDetails() {
    if (!this.selectedNode) return;
    
    switch (this.selectedNode.type) {
      case 'project':
        // Already on project details page
        break;
      case 'root':
        this.router.navigate(['/roots', this.selectedNode.key]);
        break;
      case 'message':
        this.router.navigate(['/messages', this.selectedNode.key]);
        break;
      case 'field':
        this.router.navigate(['/fields', this.selectedNode.key]);
        break;
    }
  }

  editSelectedNode() {
    if (!this.selectedNode) return;
    
    switch (this.selectedNode.type) {
      case 'project':
        // Edit project
        const project = this.selectedNode.data as Project;
        this.router.navigate(['/projects', project.id]);
        break;
      case 'root':
        this.showEditRootDialog(this.selectedNode.data as Root);
        break;
      // Will add message and field editing later
    }
  }

  deleteSelectedNode() {
    if (!this.selectedNode) return;
    
    const name = this.selectedNode.label;
    const type = this.selectedNode.type;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the ${type} "${name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        switch (type) {
          case 'root':
            this.store.dispatch(RootActions.deleteRoot({ id: this.selectedNode!.key }));
            break;
          // Will add message and field deletion later
        }
        
        this.selectedNode = null;
        this.selectedNodeDetails = null;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `${type} deleted successfully` });
      }
    });
  }

  exportSelectedNode() {
    if (!this.selectedNode) return;
    
    switch (this.selectedNode.type) {
      case 'root':
        this.store.dispatch(RootActions.exportRoot({ id: this.selectedNode.key }));
        break;
      // Will add message and field export later
    }
    
    // Subscribe to the exported XML
    this.store.select(state => state.roots.exportedXml).pipe(
      takeUntil(this.destroy$)
    ).subscribe(xml => {
      if (xml) {
        this.exportedXml = xml;
        this.exportDialogVisible = true;
      }
    });
  }

  exportAllRoots() {
    if (!this.projectId) return;
    
    this.store.dispatch(RootActions.exportAllRoots({ projectId: this.projectId }));
    
    // Subscribe to the exported XML
    this.store.select(state => state.roots.exportedXml).pipe(
      takeUntil(this.destroy$)
    ).subscribe(xml => {
      if (xml) {
        this.exportedXml = xml;
        this.exportDialogVisible = true;
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'XML copied to clipboard' });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy to clipboard' });
      }
    );
  }

  showCreateRootDialog() {
    this.editingRoot = {};
    this.rootDialogHeader = 'Create New Root';
    this.isEditingRoot = false;
    this.rootDialogVisible = true;
  }

  showEditRootDialog(root: Root) {
    this.editingRoot = { ...root };
    this.rootDialogHeader = 'Edit Root';
    this.isEditingRoot = true;
    this.rootDialogVisible = true;
  }

  saveRoot() {
    if (this.isEditingRoot) {
      const root = this.editingRoot as Root;
      this.store.dispatch(RootActions.updateRoot({ root }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root updated successfully' });
    } else {
      const newRoot: Root = {
        id: '',
        name: this.editingRoot.name || '',
        description: this.editingRoot.description || '',
        projectId: this.projectId,
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        messages: []
      };
      this.store.dispatch(RootActions.createRoot({ root: newRoot }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root created successfully' });
    }
    this.rootDialogVisible = false;
  }

  confirmDeleteRoot(root: Root) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the root "${root.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(RootActions.deleteRoot({ id: root.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root deleted successfully' });
      }
    });
  }

  onSearch(term: string) {
    // Implement search functionality
  }

  onClearSearch() {
    // Reset search results
  }
}