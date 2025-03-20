// project-detail.component.ts
import { Component, OnDestroy, OnInit, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AppState } from '../../store/app.state';
import { selectProjectById } from '../../store/project/project.selectors';
import { selectRootsByProjectId } from '../../store/root/root.selectors';
import { Root } from '../../models/root.model';
import { TreeNode } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SignalRService } from '../../services/signalr.service';
import { Project } from '../../models/project.model';
import { loadProject } from '../../store/project/project.actions';
import { loadRootsByProject, deleteRoot, exportRoot, exportAllRoots, updateRoot, createRoot } from '../../store/root/root.actions';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    TreeModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    TabViewModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [MessageService, ConfirmationService],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="project-container" @fadeIn>
      <!-- Breadcrumb navigation -->
      <div class="breadcrumb-container">
        <ng-container *ngFor="let crumb of breadcrumbs(); let last = last; let i = index">
          <div class="breadcrumb-item">
            <a 
              [routerLink]="crumb.routerLink" 
              class="breadcrumb-link"
              [class.active]="last"
            >
              <i *ngIf="i === 0" class="pi pi-home"></i>
              <span>{{ crumb.label }}</span>
            </a>
            <i *ngIf="!last" class="pi pi-angle-right breadcrumb-separator"></i>
          </div>
        </ng-container>
      </div>

      <!-- Main header with search and actions -->
      <div class="project-header" @slideIn>
        <div class="header-left">
          <h1 class="project-title">{{ project()?.name || 'Project Details' }}</h1>
        </div>
        <div class="header-right">
          <div class="search-container">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [ngModel]="searchTerm()" 
                (input)="onSearch($event)" 
                placeholder="Search by name, description, etc."
                class="search-input"
              />
            </span>
            <button 
              *ngIf="searchTerm()" 
              pButton 
              pRipple 
              type="button" 
              icon="pi pi-times" 
              class="p-button-rounded p-button-text clear-search-btn" 
              (click)="onClearSearch()"
              pTooltip="Clear search"
            ></button>
          </div>
          <button 
            pButton 
            pRipple 
            type="button" 
            label="New Root" 
            icon="pi pi-plus" 
            class="p-button-success action-button" 
            (click)="showCreateRootDialog()"
            pTooltip="Create new root"
          ></button>
          <button 
            pButton 
            pRipple 
            type="button" 
            label="Export All" 
            icon="pi pi-download" 
            class="p-button-primary action-button" 
            (click)="exportAllRoots()"
            [disabled]="!roots()?.length"
            pTooltip="Export all roots"
          ></button>
        </div>
      </div>
      
      <!-- Tab navigation -->
      <div class="tab-container" @slideIn>
        <ul class="tab-nav">
          <li 
            class="tab-item" 
            [class.active]="activeTab() === 'tree'" 
            (click)="setActiveTab('tree')"
          >
            <i class="pi pi-sitemap"></i>
            <span>Tree View</span>
          </li>
          <li 
            class="tab-item" 
            [class.active]="activeTab() === 'list'" 
            (click)="setActiveTab('list')"
          >
            <i class="pi pi-list"></i>
            <span>Roots List</span>
          </li>
        </ul>
      </div>

      <!-- Tab content -->
      <div class="tab-content" @staggerIn>
        <!-- Tree View -->
        <div *ngIf="activeTab() === 'tree'" class="tree-view-container">
          <div class="tree-layout">
            <div class="tree-sidebar stagger-item">
            <p-tree
  [value]="treeNodes()"
  selectionMode="single"
  [selection]="selectedNode()" 
  (selectionChange)="onSelectionChange($event)"
  (onNodeSelect)="onNodeSelect($event)"
  [filter]="true"
  [filterMode]="'lenient'"
  filterPlaceholder="Search tree..."
  styleClass="custom-tree"
>
                <ng-template pTemplate="header">
                  <div class="p-tree-header">
                    <strong>Project Structure</strong>
                  </div>
                </ng-template>
              </p-tree>
            </div>
            
            <div class="tree-details stagger-item">
              <ng-container *ngIf="selectedNode()">
                <div class="details-card">
                  <div class="details-header">
                    <h2 class="details-title">{{ getSelectedNodeHeader(selectedNode()) }}</h2>
                  </div>
                  
                  <div class="details-content" *ngIf="selectedNodeDetails()">
                    <div class="details-property" *ngFor="let prop of getVisibleProperties(selectedNodeDetails(), selectedNode()?.type ?? '')">
                      <div class="property-label">{{ prop.label }}:</div>
                      <div class="property-value">
                        <ng-container [ngSwitch]="prop.type">
                          <span *ngSwitchCase="'date'">{{ selectedNodeDetails()[prop.field] | date }}</span>
                          <span *ngSwitchCase="'boolean'">{{ selectedNodeDetails()[prop.field] ? 'Yes' : 'No' }}</span>
                          <span *ngSwitchCase="'count'">{{ selectedNodeDetails()[prop.field]?.length || 0 }}</span>
                          <span *ngSwitchDefault>{{ selectedNodeDetails()[prop.field] }}</span>
                        </ng-container>
                      </div>
                    </div>
                  </div>
                  
                  <div class="details-actions">
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-eye" 
                      label="View Details" 
                      class="p-button-info action-btn"
                      (click)="viewNodeDetails(selectedNode())"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-pencil" 
                      label="Edit" 
                      class="p-button-success action-btn" 
                      (click)="editSelectedNode(selectedNode())"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-trash" 
                      label="Delete" 
                      class="p-button-danger action-btn" 
                      (click)="deleteSelectedNode(selectedNode())"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-download" 
                      label="Export" 
                      class="p-button-secondary action-btn" 
                      (click)="exportSelectedNode(selectedNode())"
                      *ngIf="selectedNode()?.type !== 'project'"
                    ></button>
                  </div>
                </div>
              </ng-container>
              
              <div *ngIf="!selectedNode()" class="no-selection stagger-item">
                <div class="selection-hint">
                  <i class="pi pi-arrow-left hint-icon"></i>
                  <p class="hint-text">Select an item from the tree to view details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Roots List -->
        <div *ngIf="activeTab() === 'list'" class="roots-list-container stagger-item">
          <p-table 
            [value]="roots() ?? []" 
            styleClass="custom-table"
            [paginator]="true" 
            [rows]="10" 
            [rowsPerPageOptions]="[10, 25, 50]" 
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} roots"
            [rowHover]="true"
            responsiveLayout="scroll"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Messages</th>
                <th>Created</th>
                <th>Last Modified</th>
                <th style="width: 150px">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-root>
              <tr>
                <td>{{ root.name }}</td>
                <td>{{ root.description }}</td>
                <td>{{ root.messages?.length || 0 }}</td>
                <td>{{ root.createdDate | date:'short' }}</td>
                <td>{{ root.lastModifiedDate | date:'short' }}</td>
                <td>
                  <div class="table-actions">
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-eye" 
                      class="p-button-rounded p-button-info p-button-sm" 
                      [routerLink]="['/roots', root.id]"
                      pTooltip="View"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-success p-button-sm" 
                      (click)="showEditRootDialog(root)"
                      pTooltip="Edit"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-danger p-button-sm" 
                      (click)="confirmDeleteRoot(root)"
                      pTooltip="Delete"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="empty-message">
                  <i class="pi pi-folder-open empty-icon"></i>
                  <p>No roots found for this project</p>
                  <button 
                    pButton 
                    pRipple 
                    type="button" 
                    label="Create Root" 
                    icon="pi pi-plus" 
                    class="p-button-success p-button-sm" 
                    (click)="showCreateRootDialog()"
                  ></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>

    <!-- Root dialog -->
    <p-dialog 
        [visible]="rootDialogVisible()" (visibleChange)="rootDialogVisible.set($event)"
      [header]="rootDialogHeader()"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
      [contentStyle]="{padding: '1.5rem'}"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      styleClass="custom-dialog"
      (onHide)="onDialogHide()"
    >
      <ng-container *ngIf="rootDialogVisible()">
        <div class="dialog-form">
          <form [formGroup]="rootForm">
            <div class="form-field">
              <label for="rootName" class="field-label">Name</label>
              <input 
                id="rootName" 
                type="text" 
                pInputText 
                formControlName="name"
                class="w-full field-input" 
              />
            </div>
            
            <div class="form-field">
              <label for="rootDescription" class="field-label">Description</label>
              <textarea 
                id="rootDescription"
                pInputTextarea
                formControlName="description"
                rows="4"
                class="w-full field-input textarea"
              ></textarea>
            </div>
          </form>
        </div>
      </ng-container>
      
      <ng-template pTemplate="footer">
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Cancel" 
          icon="pi pi-times" 
          class="p-button-outlined" 
          (click)="closeDialog()"
        ></button>
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Save" 
          icon="pi pi-check" 
          class="p-button-success" 
          [disabled]="rootForm.invalid"
          (click)="saveRoot()"
        ></button>
      </ng-template>
    </p-dialog>

    <!-- Export dialog -->
    <p-dialog 
        [visible]="exportDialogVisible()" (visibleChange)="exportDialogVisible.set($event)"
      
      header="Exported XML"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '80vw'}"
      [contentStyle]="{padding: '0'}"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      styleClass="custom-dialog export-dialog"
    >
      <div class="export-content">
        <pre class="export-code">{{ exportedXml() }}</pre>
      </div>
      
      <ng-template pTemplate="footer">
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Copy" 
          icon="pi pi-copy" 
          class="p-button-primary" 
          (click)="exportedXml() && copyToClipboard(exportedXml()!)"
          *ngIf="exportedXml()"
        ></button>
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-outlined" 
          (click)="closeExportDialog()"
        ></button>
      </ng-template>
    </p-dialog>
    
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  // Injected services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store<AppState>);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private signalRService = inject(SignalRService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // State
  projectId = signal<string>('');

  // Signals derived from Store
  project = toSignal<Project | null>(
    this.store.select(selectProjectById(this.projectId())).pipe(
      filter(project => !!project)
    ),
    { initialValue: null }
  );

roots = toSignal<Root[] | null>(
  this.store.select(selectRootsByProjectId(this.projectId())).pipe(
    filter(roots => !!roots)
  ),
  { initialValue: null }
);

  exportedXml = toSignal<string>(
    this.store.select(state => state.roots.exportedXml).pipe(
      filter((xml): xml is string => xml !== null)
    ),
    { initialValue: null }
  );

  // UI state signals
  activeTab = signal<'tree' | 'list'>('tree');
  selectedNode = signal<TreeNode | null>(null);  // Changed from TreeNode[] | null

  searchTerm = signal<string>('');
  treeNodes = signal<TreeNode[]>([]);
  rootDialogVisible = signal<boolean>(false);
  rootDialogHeader = signal<string>('');
  isEditingRoot = signal<boolean>(false);
  exportDialogVisible = signal<boolean>(false);

  // Computed signals
  breadcrumbs = computed(() => {
    const project = this.project();
    return [
      { label: 'Projects', routerLink: ['/projects'] },
      { label: 'Project', routerLink: ['/projects', project?.id || ''] },
      { label: project?.name || 'Loading...' }
    ];
  });

  selectedNodeDetails = computed(() => {
    const node = this.selectedNode();
    return node ? node.data : null;
  });

  // Reactive form
  rootForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });

  constructor() {
    // Effects to handle side effects of signal changes`
    effect(() => {
      const nodes = this.buildTreeNodes(this.project(), this.roots() ?? []);
      this.treeNodes.set(nodes);

      // If we have nodes and this is initial load, expand first level
      if (nodes.length > 0 && this.selectedNode() === null) {
        setTimeout(() => this.expandFirstLevel(nodes), 100);
      }
    });

    // Effect to handle search term changes
    effect(() => {
      const term = this.searchTerm();
      const nodes = this.treeNodes();

      if (term && nodes.length > 0) {
        this.filterTreeNodes(term, nodes);
      }
    });
  }

  ngOnInit() {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const id = params['id'];
      this.projectId.set(id);

      // Load project details and roots
      this.store.dispatch(loadProject({ id }));
      this.store.dispatch(loadRootsByProject({ projectId: id }));

      // Join SignalR group for this project
      this.signalRService.joinProject(id);
    });
  }

  onDialogHide() {
    this.rootForm.reset();
  }

  closeDialog() {
    this.rootDialogVisible.set(false);
  }

  closeExportDialog() {
    this.exportDialogVisible.set(false);
  }

  buildTreeNodes(project: Project | null, roots: Root[]): TreeNode[] {
    if (!project) return [];

    const projectNode: TreeNode = {
      key: project.id,
      label: project.name,
      type: 'project',
      data: project,
      icon: 'pi pi-folder-open',
      children: [],
      expanded: true // Always expand the project node
    };

    if (roots && roots.length > 0) {
      projectNode.children = roots.map(root => this.createRootNode(root));
    }

    return [projectNode];
  }

  createRootNode(root: Root): TreeNode {
    // Create messages for this root
    const messageNodes = root.messages?.map(message => {
      // Create field nodes for this message
      const fieldNodes = message.fields
        ?.filter(field => !field.parentFieldId) // Get only top-level fields
        .map(field => this.createFieldNode(field, message.fields || [])) || [];

      return {
        key: message.id,
        label: message.name || '',
        type: 'message',
        data: message,
        icon: 'pi pi-envelope',
        children: fieldNodes,
        expanded: false
      } as TreeNode;
    }) || [];

    const node: TreeNode = {
      key: root.id,
      label: root.name || '',
      type: 'root',
      data: root,
      icon: 'pi pi-sitemap',
      children: messageNodes,
      expanded: false
    };

    return node;
  }

  createFieldNode(field: any, allFields: any[]): TreeNode {
    const node: TreeNode = {
      key: field.id,
      label: field.name || '',
      type: 'field',
      data: field,
      icon: this.getFieldIcon(field.type),
      expanded: false
    };

    // Add child fields if this is a complex field
    if (field.type === 'Complex') {
      const childFields = allFields.filter(f => f.parentFieldId === field.id);
      if (childFields.length > 0) {
        node.children = childFields.map(childField => this.createFieldNode(childField, allFields));
      }
    }

    return node;
  }

  getFieldIcon(fieldType: string): string {
    switch (fieldType) {
      case 'String': return 'pi pi-align-left';
      case 'Integer': return 'pi pi-hashtag';
      case 'Decimal': return 'pi pi-percentage';
      case 'Boolean': return 'pi pi-check-square';
      case 'DateTime': return 'pi pi-calendar';
      case 'Enum': return 'pi pi-list';
      case 'Complex': return 'pi pi-table';
      default: return 'pi pi-tag';
    }
  }

  // Expand the first level of nodes
  expandFirstLevel(treeNodes: TreeNode[]) {
    if (treeNodes && treeNodes.length > 0) {
      // Create a deep copy of the nodes to modify
      const expandedNodes = JSON.parse(JSON.stringify(treeNodes));

      // Expand the first 2-3 root nodes (if they exist)
      if (expandedNodes[0].children) {
        const rootsToExpand = Math.min(3, expandedNodes[0].children.length);
        for (let i = 0; i < rootsToExpand; i++) {
          expandedNodes[0].children[i].expanded = true;

          // Also expand the first message of each expanded root
          if (expandedNodes[0]?.children?.[i]?.children?.length) {
            expandedNodes[0].children[i].children[0].expanded = true;
          }
        }
      }

      // Update the signal with the expanded nodes
      this.treeNodes.set(expandedNodes);
    }
  }

  // Handle node selection
  onNodeSelect(event: any) {
    const node = event.node as TreeNode;  // Ensure correct typing
    this.selectedNode.set(node);
  
    if (node) {
      // Get the current nodes to expand the parent path
      const currentNodes = this.treeNodes();
      // Expand the parent path
      this.expandParentPath(node, currentNodes);
    }
  }

  // Find and expand parent nodes
  expandParentPath(node: TreeNode, treeNodes: TreeNode[]) {
    // Create a deep copy to avoid modifying the original data
    const expandedNodes = JSON.parse(JSON.stringify(treeNodes));

    const findAndExpandParent = (nodes: TreeNode[], targetKey: string | undefined): boolean => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const hasTarget = node.children.some(child => child.key === targetKey);
          if (hasTarget) {
            node.expanded = true;
            return true;
          }

          const foundInChildren = findAndExpandParent(node.children, targetKey);
          if (foundInChildren) {
            node.expanded = true;
            return true;
          }
        }
      }
      return false;
    };

    if (node && expandedNodes) {
      findAndExpandParent(expandedNodes, node.key);

      // Update the signal with the expanded nodes
      this.treeNodes.set(expandedNodes);
    }
  }

  // Set active tab (tree or list view)
  setActiveTab(tab: 'tree' | 'list') {
    this.activeTab.set(tab);
  }

  // Show dialog to create new root
  showCreateRootDialog() {
    this.rootForm.reset();
    this.rootDialogHeader.set('Create New Root');
    this.isEditingRoot.set(false);
    this.rootDialogVisible.set(true);
  }

  // Show dialog to edit existing root
  showEditRootDialog(root: Root) {
    this.rootForm.setValue({
      name: root.name || '',
      description: root.description || ''
    });
    this.rootDialogHeader.set('Edit Root');
    this.isEditingRoot.set(true);
    this.rootForm.patchValue({
      id: root.id
    });
    this.rootDialogVisible.set(true);
  }

  // Save root (create or update)
  saveRoot() {
    if (this.rootForm.invalid) return;

    const formValues = this.rootForm.value;

    if (this.isEditingRoot()) {
      const root: Root = {
        id: (this.rootForm.get('id')?.value) as string,
        name: formValues.name,
        description: formValues.description,
        projectId: this.projectId(),
        lastModifiedDate: new Date(),
        // Preserve these fields from the existing root
        createdDate: this.roots()?.find(r => r.id === formValues.id)?.createdDate || new Date(),
        messages: this.roots()?.find(r => r.id === formValues.id)?.messages ?? []
      };

      this.store.dispatch(updateRoot({ root }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root updated successfully' });
    } else {
      const newRoot: Root = {
        id: '', // ID will be generated by the backend
        name: formValues.name,
        description: formValues.description,
        projectId: this.projectId(),
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        messages: []
      };

      this.store.dispatch(createRoot({ root: newRoot }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root created successfully' });
    }

    this.closeDialog();
  }

  // Confirm deletion of a root
  confirmDeleteRoot(root: Root) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the root "${root.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(deleteRoot({ id: root.id }));
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Root deleted successfully',
          life: 3000
        });
      }
    });
  }

  // Export all roots
  exportAllRoots() {
    const projectId = this.projectId();
    if (!projectId) return;

    this.store.dispatch(exportAllRoots({ projectId }));
    this.exportDialogVisible.set(true);
  }

  // Copy exported XML to clipboard
  copyToClipboard(text: string) {
    if (!text) return;

    navigator.clipboard.writeText(text).then(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copied',
          detail: 'XML copied to clipboard',
          life: 3000
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy to clipboard',
          life: 3000
        });
      }
    );
  }


  // Handle search input
  onSearch(event: any) {
    const term = typeof event === 'string' ? event : event.target.value;
    this.searchTerm.set(term);
  }

  // Clear search
  onClearSearch() {
    this.searchTerm.set('');
    // When search is cleared, rebuild tree nodes from original data
    this.treeNodes.set(this.buildTreeNodes(this.project(), this.roots() ?? []));
  }

  // Filter tree nodes based on search term
  filterTreeNodes(term: string, nodes: TreeNode[]) {
    if (!term || !nodes.length) return;

    // Make a deep copy of the original nodes to work with
    const nodesCopy = JSON.parse(JSON.stringify(nodes));

    const filterNode = (node: TreeNode): boolean => {
      // Check if the current node matches
      const nodeLabel = node.label?.toLowerCase() || '';
      const nodeDescription = (node.data?.description || '').toLowerCase();
      const matches = nodeLabel.includes(term.toLowerCase()) ||
        nodeDescription.includes(term.toLowerCase());

      // Check if any children match
      let childrenMatch = false;

      if (node.children && node.children.length > 0) {
        // Filter children and keep only matching ones
        const filteredChildren = node.children.filter(filterNode);
        childrenMatch = filteredChildren.length > 0;

        // Replace children with filtered children
        node.children = filteredChildren;

        // Expand parent nodes that have matching children
        if (childrenMatch) {
          node.expanded = true;
        }
      }

      // Keep this node if it matches or any of its children match
      return matches || childrenMatch;
    };

    // Apply filter to the root nodes
    const filteredNodes = nodesCopy.filter(filterNode);

    // Update the treeNodes signal with filtered data
    this.treeNodes.set(filteredNodes);
  }

  // Function to get header text for selected node
  getSelectedNodeHeader(node: TreeNode | null): string {
    if (!node) return '';
  
    const type = (node.type as string)?.charAt(0).toUpperCase() + (node.type as string)?.slice(1);
    return `${type} Details: ${node.label || ''}`;
  }

  // Function to get properties to display for the selected node
  getVisibleProperties(nodeDetails: any, nodeType: string): { label: string, field: string, type: string }[] {
    if (!nodeDetails) return [];

    // Common properties
    const properties = [
      { label: 'Name', field: 'name', type: 'string' },
      { label: 'Description', field: 'description', type: 'string' },
      { label: 'Created Date', field: 'createdDate', type: 'date' },
      { label: 'Last Modified Date', field: 'lastModifiedDate', type: 'date' }
    ];

    // Type-specific properties
    switch (nodeType) {
      case 'project':
        properties.push({ label: 'Roots Count', field: 'roots', type: 'count' });
        break;
      case 'root':
        properties.push({ label: 'Messages Count', field: 'messages', type: 'count' });
        break;
      case 'message':
        properties.push({ label: 'Fields Count', field: 'fields', type: 'count' });
        break;
      case 'field':
        properties.push({ label: 'Type', field: 'type', type: 'string' });
        properties.push({ label: 'Required', field: 'isRequired', type: 'boolean' });
        if (nodeDetails.type === 'Complex') {
          properties.push({ label: 'Child Fields', field: 'childFields', type: 'count' });
        }
        if (nodeDetails.type === 'Enum') {
          properties.push({ label: 'Enum Values', field: 'enumValues', type: 'count' });
        }
        if (nodeDetails.defaultValue) {
          properties.push({ label: 'Default Value', field: 'defaultValue', type: 'string' });
        }
        break;
    }

    return properties;
  }

  // Navigate to details view for selected node
  viewNodeDetails(node: TreeNode | null) {
    if (!node) return;
  
    switch (node.type as string) {
      case 'project':
        // Already on project details page
        break;
      case 'root':
        this.router.navigate(['/roots', node.key]);
        break;
      case 'message':
        this.router.navigate(['/messages', node.key]);
        break;
      case 'field':
        this.router.navigate(['/fields', node.key]);
        break;
    }
  }
  
  editSelectedNode(node: TreeNode | null) {
    if (!node) return;
  
    switch (node.type as string) {
      case 'project':
        // Edit project logic
        break;
      case 'root':
        this.showEditRootDialog(node.data as Root);
        break;
      case 'message':
        // Navigate to message edit page
        this.router.navigate(['/messages', node.key], { queryParams: { edit: true } });
        break;
      case 'field':
        // Navigate to field edit page
        this.router.navigate(['/fields', node.key], { queryParams: { edit: true } });
        break;
    }
  }
  
  deleteSelectedNode(node: TreeNode | null) {
    if (!node) return;
  
    const name = node.label || '';
    const type = node.type as string;
  
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the ${type} "${name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        switch (type) {
          case 'root':
            this.store.dispatch(deleteRoot({ id: node.key as string }));
            break;
          // Add other entity type deletions when implemented
        }
  
        this.selectedNode.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${type} deleted successfully`
        });
      }
    });
  }

  // Export selected node to XML
  exportSelectedNode(node: TreeNode | null) {
    if (!node) return;
  
    switch (node.type as string) {
      case 'root':
        this.store.dispatch(exportRoot({ id: node.key as string }));
        this.exportDialogVisible.set(true);
        break;
      // Add other entity type exports when implemented
    }
  }
  onSelectionChange(event: TreeNode | TreeNode[]|null) {
    if (Array.isArray(event)) {
      // If it's an array, take the first item (shouldn't happen in single mode, but just in case)
      this.selectedNode.set(event.length > 0 ? event[0] : null);
    } else {
      // If it's a single node, use it directly
      this.selectedNode.set(event);
    }
  }
}