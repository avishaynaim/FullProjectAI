import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
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
  projectId: string = '';
  project: Project | null = null;
  roots: Root[] = [];
  treeNodes: TreeNode[] = [];
  selectedNode: any = null;
  selectedNodeDetails: any = null;
  activeTab: 'tree' | 'list' = 'tree';

  breadcrumbs: any[] = [
    { label: 'Projects', routerLink: ['/projects'] },
    { label: 'Project Details' }
  ];

  searchTerm: string = '';

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
  ) { }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.projectId = params['id'];
      
      // Load project details
      this.store.dispatch(loadProject({ id: this.projectId }));
      
      // Load roots for this project
      this.store.dispatch(loadRootsByProject({ projectId: this.projectId }));
      
      // Join SignalR group for this project
      this.signalRService.joinProject(this.projectId);
      
      // Subscribe to project data
      this.store.select(selectProjectById(this.projectId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(project => {
        if (project) {
          this.project = project;
          this.breadcrumbs[1].label = project.name;
          // Don't update tree nodes yet - we need roots data too
        }
      });
      
      // Subscribe to roots data
      this.store.select(selectRootsByProjectId(this.projectId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(roots => {
        if (roots && roots.length > 0) {
          console.log('Loaded roots:', roots);
          this.roots = roots;
          
          // Only update tree nodes when we have both project and roots data
          if (this.project) {
            this.updateTreeNodes();
            
            // Auto expand first level of nodes for visibility
            setTimeout(() => {
              this.expandFirstLevel();
            }, 100);
          }
        }
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

  // Find and select a node by key in the tree
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

  // Expand a node's parent path for better visibility
  expandParentPath(node: TreeNode) {
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
    
    if (node && this.treeNodes) {
      findAndExpandParent(this.treeNodes, node.key);
    }
  }

  // Add this method to expand the first level of nodes
  expandFirstLevel() {
    if (this.treeNodes && this.treeNodes.length > 0) {
      // Expand the project node
      this.treeNodes[0].expanded = true;
      
      // Expand the first 2-3 root nodes (if they exist)
      if (this.treeNodes[0].children) {
        const rootsToExpand = Math.min(3, this.treeNodes[0].children.length);
        for (let i = 0; i < rootsToExpand; i++) {
          this.treeNodes[0].children[i].expanded = true;
          
          // Also expand the first message of each expanded root
          if (this.treeNodes[0]?.children?.[i]?.children?.length) {
            this.treeNodes[0].children![i].children![0].expanded = true;
          }
        }
        
        // Force tree to update
        this.treeNodes = [...this.treeNodes];
      }
    }
  }
  
  // Also add a method to expand a node and its path when selected
  onNodeSelect(event: any) {
    // Expand the selected node
    if (this.selectedNode) {
      this.selectedNode.expanded = true;
    }
    
    // Also expand the parent path
    this.expandParentPath(this.selectedNode);
    
    // Update details
    this.updateSelectedNodeDetails();
  }

  setActiveTab(tab: 'tree' | 'list') {
    this.activeTab = tab;
  }
  
  updateTreeNodes() {
    if (!this.project) return;

    const projectNode: TreeNode = {
      key: this.project.id,
      label: this.project.name,
      type: 'project',
      data: this.project,
      icon: 'pi pi-folder-open',
      children: [],
      expanded: true // Always expand the project node
    };

    if (this.roots && this.roots.length > 0) {
      projectNode.children = this.roots.map(root => this.createRootNode(root));

      // Expand at least the first root node for visibility
      if (projectNode.children.length > 0) {
        projectNode.children[0].expanded = true;
      }
    }

    this.treeNodes = [projectNode];

    // If a node was selected, try to find it again after the tree updates
    if (this.selectedNode) {
      this.findAndSelectNode(this.selectedNode.key);
    } else {
      // Auto-select the project node if nothing is selected
      this.selectedNode = projectNode;
      this.updateSelectedNodeDetails();
    }
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
  
  updateSelectedNodeDetails() {
    if (!this.selectedNode) {
      this.selectedNodeDetails = null;
      return;
    }

    this.selectedNodeDetails = this.selectedNode.data;
  }

  // Get the header text for the selected node
  getSelectedNodeHeader(): string {
    if (!this.selectedNode) return '';

    const type = this.selectedNode.type.charAt(0).toUpperCase() + this.selectedNode.type.slice(1);
    return `${type} Details: ${this.selectedNode.label || ''}`;
  }

  // Get the properties to display for the selected node
  getVisibleProperties(): { label: string, field: string, type: string }[] {
    if (!this.selectedNodeDetails || !this.selectedNode) return [];

    // Common properties
    const properties = [
      { label: 'Name', field: 'name', type: 'string' },
      { label: 'Description', field: 'description', type: 'string' },
      { label: 'Created Date', field: 'createdDate', type: 'date' },
      { label: 'Last Modified Date', field: 'lastModifiedDate', type: 'date' }
    ];

    // Type-specific properties
    switch (this.selectedNode.type) {
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
        if (this.selectedNodeDetails.type === 'Complex') {
          properties.push({ label: 'Child Fields', field: 'childFields', type: 'count' });
        }
        if (this.selectedNodeDetails.type === 'Enum') {
          properties.push({ label: 'Enum Values', field: 'enumValues', type: 'count' });
        }
        if (this.selectedNodeDetails.defaultValue) {
          properties.push({ label: 'Default Value', field: 'defaultValue', type: 'string' });
        }
        break;
    }

    return properties;
  }

  // Navigate to the details view for the selected node
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

  // Edit the selected node
  editSelectedNode() {
    if (!this.selectedNode) return;

    switch (this.selectedNode.type) {
      case 'project':
        // Edit project logic
        break;
      case 'root':
        this.showEditRootDialog(this.selectedNode.data as Root);
        break;
      case 'message':
        // Navigate to message edit page
        this.router.navigate(['/messages', this.selectedNode.key], { queryParams: { edit: true } });
        break;
      case 'field':
        // Navigate to field edit page
        this.router.navigate(['/fields', this.selectedNode.key], { queryParams: { edit: true } });
        break;
    }
  }

  // Delete the selected node
  deleteSelectedNode() {
    if (!this.selectedNode) return;

    const name = this.selectedNode.label || '';
    const type = this.selectedNode.type;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the ${type} "${name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        switch (type) {
          case 'root':
            this.store.dispatch(deleteRoot({ id: this.selectedNode!.key }));
            break;
          // Add other entity type deletions when implemented
        }

        this.selectedNode = null;
        this.selectedNodeDetails = null;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `${type} deleted successfully` });
      }
    });
  }

  // Export the selected node to XML
  exportSelectedNode() {
    if (!this.selectedNode) return;

    switch (this.selectedNode.type) {
      case 'root':
        this.store.dispatch(exportRoot({ id: this.selectedNode.key }));

        // Subscribe to the exported XML
        this.store.select(state => state.roots.exportedXml).pipe(
          takeUntil(this.destroy$)
        ).subscribe(xml => {
          if (xml) {
            this.exportedXml = xml;
            this.exportDialogVisible = true;
          }
        });
        break;
      // Add other entity type exports when implemented
    }
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

  exportAllRoots() {
    if (!this.projectId) return;

    this.store.dispatch(exportAllRoots({ projectId: this.projectId }));

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

  onSearch(event: any) {
    const term = event.target.value;
    if (term && term.length > 0) {
      // Filter the tree nodes based on the search term
      this.filterTreeNodes(term);
    } else {
      // Reset the tree
      this.updateTreeNodes();
    }
  }

  onClearSearch() {
    this.searchTerm = '';
    this.updateTreeNodes();
  }

  // Filter tree nodes based on search term
  filterTreeNodes(term: string) {
    // Reset tree with all nodes
    this.updateTreeNodes();

    if (!term || !this.treeNodes.length) return;

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
    this.treeNodes = this.treeNodes.filter(filterNode);
  }
}