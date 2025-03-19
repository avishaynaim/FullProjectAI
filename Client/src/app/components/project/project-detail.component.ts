import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { filter, map, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
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
    CardModule,
    TableModule,
    TreeModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    TabViewModule,
    InputTextModule,
    RippleModule,
    TooltipModule
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
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  // Input parameters
  projectId: string = '';
  
  // Observables
  project$: Observable<Project | null>;
  roots$: Observable<Root[]>;
  treeNodes$: Observable<TreeNode[]>;
  breadcrumbs$: Observable<any[]>;
  selectedNodeDetails$: Observable<any>;
  exportedXml$: Observable<string>;
  
  // UI state observables
  activeTab$: BehaviorSubject<'tree' | 'list'> = new BehaviorSubject<'tree' | 'list'>('tree');
  selectedNode$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  searchTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  
  // Dialog state
  rootDialogVisible = false;
  rootDialogHeader = '';
  editingRoot: Partial<Root> = {};
  isEditingRoot = false;
  
  exportDialogVisible = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private signalRService: SignalRService
  ) {
    // Initialize observables that depend on injected services
    this.project$ = of(null);
    this.roots$ = of([]);
    this.treeNodes$ = of([]);
    this.breadcrumbs$ = of([]);
    this.selectedNodeDetails$ = of(null);
    this.exportedXml$ = this.store.select(state => state.roots.exportedXml).pipe(
      filter((xml): xml is string => xml !== null)
    );
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.projectId = params['id'];
      
      // Load project details and roots
      this.store.dispatch(loadProject({ id: this.projectId }));
      this.store.dispatch(loadRootsByProject({ projectId: this.projectId }));
      
      // Join SignalR group for this project
      this.signalRService.joinProject(this.projectId);
      
      // Set up project observable
      this.project$ = this.store.select(selectProjectById(this.projectId)).pipe(
        filter(project => !!project) // Only emit when project is available
      );
      
      // Set up roots observable
      this.roots$ = this.store.select(selectRootsByProjectId(this.projectId)).pipe(
        filter(roots => !!roots) // Only emit when roots are available
      );
      
      // Create breadcrumbs observable
      this.breadcrumbs$ = this.project$.pipe(
        map(project => [
          { label: 'Projects', routerLink: ['/projects'] },
          { label: 'Project', routerLink: ['/projects', project?.id || ''] },
          { label: project?.name || 'Loading...' }
        ])
      );
      
      // Create treeNodes observable - combines project and roots
      this.treeNodes$ = combineLatest([this.project$, this.roots$]).pipe(
        map(([project, roots]) => this.buildTreeNodes(project!, roots))
      );
      
      // Create selected node details observable
      this.selectedNodeDetails$ = this.selectedNode$.pipe(
        filter(node => !!node),
        map(node => node?.data || null)
      );
    });
    
    // When treeNodes are first loaded, expand the first level
    this.treeNodes$.pipe(
      takeUntil(this.destroy$),
      filter(nodes => nodes.length > 0),
      tap(nodes => setTimeout(() => this.expandFirstLevel(nodes), 100))
    ).subscribe();
    
    // Handle search term filtering
    this.searchTerm$.pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.treeNodes$),
      tap(([term, nodes]) => {
        if (term) {
          this.filterTreeNodes(term, nodes);
        } else {
          // When search term is cleared, rebuild the tree
          this.rebuildTreeNodes();
        }
      })
    ).subscribe();
  }
  
  // Method to rebuild tree nodes from source data
  rebuildTreeNodes() {
    // Recombine project and roots to rebuild the tree
    this.treeNodes$ = combineLatest([this.project$, this.roots$]).pipe(
      map(([project, roots]) => this.buildTreeNodes(project!, roots))
    );
  }
  
  ngOnDestroy() {
    // Leave SignalR group
    if (this.projectId) {
      this.signalRService.leaveProject(this.projectId);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildTreeNodes(project: Project, roots: Root[]): TreeNode[] {
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

  // Expand the first level of nodes (called from subscription)
  expandFirstLevel(treeNodes: TreeNode[]) {
    if (treeNodes && treeNodes.length > 0) {
      // Create a deep copy of the nodes to modify
      const expandedNodes = JSON.parse(JSON.stringify(treeNodes));
      
      // Project node is already expanded by default
      
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
      
      // Update the observable with the expanded nodes
      this.treeNodes$ = of(expandedNodes);
    }
  }

  // Handle node selection
  onNodeSelect(event: any) {
    // Update selected node
    this.selectedNode$.next(event.node);
    
    // Expand the selected node
    if (event.node) {
      // We'll need to get the current value of treeNodes$ to expand the parent path
      this.treeNodes$.pipe(
        take(1) // Take only the current value
      ).subscribe(nodes => {
        // Expand the parent path with the current nodes
        this.expandParentPath(event.node, nodes);
      });
    }
  }

  // Find and expand parent nodes
  expandParentPath(node: TreeNode, treeNodes: TreeNode[]) {
    // Create a deep copy to avoid modifying the original data
    const expandedNodes = JSON.parse(JSON.stringify(treeNodes));
    
    const findAndExpandParent = (nodes: TreeNode[], targetKey: string|undefined): boolean => {
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
      
      // Update the observable with the expanded nodes
      this.treeNodes$ = of(expandedNodes);
    }
  }

  // Set active tab (tree or list view)
  setActiveTab(tab: 'tree' | 'list') {
    this.activeTab$.next(tab);
  }

  // Show dialog to create new root
  showCreateRootDialog() {
    this.editingRoot = {};
    this.rootDialogHeader = 'Create New Root';
    this.isEditingRoot = false;
    this.rootDialogVisible = true;
  }

  // Show dialog to edit existing root
  showEditRootDialog(root: Root) {
    this.editingRoot = { ...root };
    this.rootDialogHeader = 'Edit Root';
    this.isEditingRoot = true;
    this.rootDialogVisible = true;
  }

  // Save root (create or update)
  saveRoot() {
    if (this.isEditingRoot) {
      const root = this.editingRoot as Root;
      this.store.dispatch(updateRoot({ root }));
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
      this.store.dispatch(createRoot({ root: newRoot }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root created successfully' });
    }
    this.rootDialogVisible = false;
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
    if (!this.projectId) return;

    this.store.dispatch(exportAllRoots({ projectId: this.projectId }));
    this.exportDialogVisible = true;
  }

  // Copy exported XML to clipboard
  copyToClipboard(text: string) {
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
    this.searchTerm$.next(term);
  }

  // Clear search
  onClearSearch() {
    this.searchTerm$.next('');
  }

  // Filter tree nodes based on search term
  filterTreeNodes(term: string, originalNodes: TreeNode[]) {
    if (!term || !originalNodes.length) return;

    // We need to handle filtering differently with observables
    // Since we don't want to mutate the original data in the store
    
    // Make a deep copy of the original nodes to work with
    const nodesCopy = JSON.parse(JSON.stringify(originalNodes));
    
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
    
    // Since we can't directly update the observable, we create a new
    // treeNodes$ observable with our filtered data
    this.treeNodes$ = of(filteredNodes);
  }

  // Function to get header text for selected node
  getSelectedNodeHeader(node: any): string {
    if (!node) return '';

    const type = node.type.charAt(0).toUpperCase() + node.type.slice(1);
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
  viewNodeDetails(node: any) {
    if (!node) return;

    switch (node.type) {
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

  // Edit selected node
  editSelectedNode(node: any) {
    if (!node) return;

    switch (node.type) {
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

  // Delete selected node
  deleteSelectedNode(node: any) {
    if (!node) return;

    const name = node.label || '';
    const type = node.type;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the ${type} "${name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        switch (type) {
          case 'root':
            this.store.dispatch(deleteRoot({ id: node.key }));
            break;
          // Add other entity type deletions when implemented
        }

        this.selectedNode$.next(null);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `${type} deleted successfully` });
      }
    });
  }

  // Export selected node to XML
  exportSelectedNode(node: any) {
    if (!node) return;

    switch (node.type) {
      case 'root':
        this.store.dispatch(exportRoot({ id: node.key }));
        this.exportDialogVisible = true;
        break;
      // Add other entity type exports when implemented
    }
  }
}