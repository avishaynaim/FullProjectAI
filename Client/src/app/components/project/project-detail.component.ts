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
  template: `
    <div class="project-container" @fadeIn>
      <!-- Breadcrumb navigation -->
      <div class="breadcrumb-container">
        <ng-container *ngFor="let crumb of breadcrumbs; let last = last; let i = index">
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
          <h1 class="project-title">{{ project?.name || 'Project Details' }}</h1>
        </div>
        <div class="header-right">
          <div class="search-container">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                [(ngModel)]="searchTerm" 
                (input)="onSearch($event)" 
                placeholder="Search by name, description, etc."
                class="search-input"
              />
            </span>
            <button 
              *ngIf="searchTerm" 
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
            [disabled]="!roots.length"
            pTooltip="Export all roots"
          ></button>
        </div>
      </div>
      
      <!-- Tab navigation -->
      <div class="tab-container" @slideIn>
        <ul class="tab-nav">
          <li 
            class="tab-item" 
            [class.active]="activeTab === 'tree'" 
            (click)="setActiveTab('tree')"
          >
            <i class="pi pi-sitemap"></i>
            <span>Tree View</span>
          </li>
          <li 
            class="tab-item" 
            [class.active]="activeTab === 'list'" 
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
        <div *ngIf="activeTab === 'tree'" class="tree-view-container">
          <div class="tree-layout">
            <div class="tree-sidebar stagger-item">
            <p-tree 
  [value]="treeNodes" 
  selectionMode="single" 
  [(selection)]="selectedNode"
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
              <ng-container *ngIf="selectedNode">
                <div class="details-card">
                  <div class="details-header">
                    <h2 class="details-title">{{ getSelectedNodeHeader() }}</h2>
                  </div>
                  
                  <div class="details-content" *ngIf="selectedNodeDetails">
                    <div class="details-property" *ngFor="let prop of getVisibleProperties()">
                      <div class="property-label">{{ prop.label }}:</div>
                      <div class="property-value">
                        <ng-container [ngSwitch]="prop.type">
                          <span *ngSwitchCase="'date'">{{ selectedNodeDetails[prop.field] | date }}</span>
                          <span *ngSwitchCase="'boolean'">{{ selectedNodeDetails[prop.field] ? 'Yes' : 'No' }}</span>
                          <span *ngSwitchCase="'count'">{{ selectedNodeDetails[prop.field]?.length || 0 }}</span>
                          <span *ngSwitchDefault>{{ selectedNodeDetails[prop.field] }}</span>
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
                      (click)="viewNodeDetails()"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-pencil" 
                      label="Edit" 
                      class="p-button-success action-btn" 
                      (click)="editSelectedNode()"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-trash" 
                      label="Delete" 
                      class="p-button-danger action-btn" 
                      (click)="deleteSelectedNode()"
                    ></button>
                    <button 
                      pButton 
                      pRipple 
                      type="button" 
                      icon="pi pi-download" 
                      label="Export" 
                      class="p-button-secondary action-btn" 
                      (click)="exportSelectedNode()"
                      *ngIf="selectedNode.type !== 'project'"
                    ></button>
                  </div>
                </div>
              </ng-container>
              
              <div *ngIf="!selectedNode" class="no-selection stagger-item">
                <div class="selection-hint">
                  <i class="pi pi-arrow-left hint-icon"></i>
                  <p class="hint-text">Select an item from the tree to view details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Roots List -->
        <div *ngIf="activeTab === 'list'" class="roots-list-container stagger-item">
          <p-table 
            [value]="roots" 
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
      [(visible)]="rootDialogVisible" 
      [header]="rootDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
      [contentStyle]="{padding: '1.5rem'}"
      [dismissableMask]="true"
      [closeOnEscape]="true"
      styleClass="custom-dialog"
    >
      <ng-container *ngIf="rootDialogVisible">
        <div class="dialog-form">
          <div class="form-field">
            <label for="rootName" class="field-label">Name</label>
            <input 
              id="rootName" 
              type="text" 
              pInputText 
              [(ngModel)]="editingRoot.name"
              class="w-full field-input" 
            />
          </div>
          
          <div class="form-field">
            <label for="rootDescription" class="field-label">Description</label>
            <textarea 
              id="rootDescription"
              pInputText
              [(ngModel)]="editingRoot.description"
              rows="4"
              class="w-full field-input textarea"
            ></textarea>
          </div>
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
          (click)="rootDialogVisible = false"
        ></button>
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Save" 
          icon="pi pi-check" 
          class="p-button-success" 
          (click)="saveRoot()"
        ></button>
      </ng-template>
    </p-dialog>
    
    <!-- Export dialog -->
    <p-dialog 
      [(visible)]="exportDialogVisible"
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
        <pre class="export-code">{{ exportedXml }}</pre>
      </div>
      
      <ng-template pTemplate="footer">
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Copy" 
          icon="pi pi-copy" 
          class="p-button-primary" 
          (click)="copyToClipboard(exportedXml)"
        ></button>
        <button 
          pButton 
          pRipple 
          type="button" 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-outlined" 
          (click)="exportDialogVisible = false"
        ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Main container */
    .project-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #121212;
      color: #e0e0e0;
      padding: 20px;
    }

    /* Breadcrumb navigation */
    .breadcrumb-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .breadcrumb-link {
      color: #a0a0a0;
      text-decoration: none;
      padding: 4px 8px;
      border-radius: 4px;
      transition: color 0.2s ease, background-color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .breadcrumb-link:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .breadcrumb-link.active {
      color: #4caf50;
      font-weight: 500;
    }

    .breadcrumb-separator {
      margin: 0 4px;
      color: #666666;
    }

    /* Project header */
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
      background-color: #1e1e1e;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .header-left {
      flex: 1;
      min-width: 250px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .project-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
    }

    /* Search box */
    .search-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      background-color: #2c2c2c;
      color: #ffffff;
      border: 1px solid #444444;
      border-radius: 4px;
      padding: 8px 12px 8px 35px;
      min-width: 250px;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      border-color: #4caf50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }

    .clear-search-btn {
      position: absolute;
      right: 8px;
      color: #a0a0a0;
    }

    .p-input-icon-left i {
      color: #a0a0a0;
      left: 12px;
    }

    /* Action buttons */
    .action-button {
      padding: 8px 16px;
      transition: all 0.2s ease;
    }

    .action-button:hover:enabled {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    /* Tab navigation */
    .tab-container {
      margin-bottom: 16px;
    }

    .tab-nav {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      border-bottom: 1px solid #444444;
    }

    .tab-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #a0a0a0;
      border-bottom: 2px solid transparent;
      position: relative;
    }

    .tab-item:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.05);
    }

    .tab-item.active {
      color: #4caf50;
      border-bottom-color: #4caf50;
    }

    .tab-item.active::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #4caf50;
      animation: tab-indicator 0.3s ease-out;
    }

    @keyframes tab-indicator {
      0% { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }

    /* Tree View */
    .tree-view-container {
      margin-top: 20px;
    }

    .tree-layout {
      display: flex;
      gap: 20px;
      height: calc(100vh - 250px);
    }

    .tree-sidebar {
      flex: 0 0 300px;
      background-color: #1e1e1e;
      border-radius: 8px;
      padding: 16px;
      overflow: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .tree-details {
      flex: 1;
      background-color: #1e1e1e;
      border-radius: 8px;
      overflow: auto;
      padding: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    /* Custom Tree Styling */
    :host ::ng-deep .custom-tree {
      border: none;
      background-color: transparent;
      color: #e0e0e0;
    }

    :host ::ng-deep .custom-tree .p-treenode {
      padding: 4px 0;
    }

    :host ::ng-deep .custom-tree .p-treenode-content {
      padding: 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    :host ::ng-deep .custom-tree .p-treenode-content:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    :host ::ng-deep .custom-tree .p-treenode-content.p-highlight {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    :host ::ng-deep .custom-tree .p-tree-toggler {
      margin-right: 8px;
    }

    :host ::ng-deep .custom-tree .p-treenode-icon {
      margin-right: 8px;
      color: #a0a0a0;
    }

    /* Details card */
    .details-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .details-header {
      padding: 20px;
      border-bottom: 1px solid #444444;
      background-color: #252525;
    }

    .details-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }

    .details-content {
      padding: 20px;
      flex: 1;
      overflow: auto;
    }

    .details-property {
      display: flex;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .property-label {
      width: 150px;
      font-weight: 500;
      color: #a0a0a0;
    }

    .property-value {
      flex: 1;
      color: #ffffff;
      min-width: 200px;
    }

    .details-actions {
      display: flex;
      gap: 10px;
      padding: 16px 20px;
      background-color: #252525;
      border-top: 1px solid #444444;
      flex-wrap: wrap;
    }

    .action-btn {
      flex: 1;
      min-width: 120px;
      padding: 8px 12px;
    }

    /* No selection state */
    .no-selection {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .selection-hint {
      text-align: center;
      color: #888888;
    }

    .hint-icon {
      font-size: 40px;
      margin-bottom: 16px;
      color: #4caf50;
      animation: pulse 2s infinite;
    }

    .hint-text {
      font-size: 16px;
      margin: 0;
    }

    @keyframes pulse {
      0% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0.6; transform: scale(1); }
    }

    /* Roots List Table */
    .roots-list-container {
      margin-top: 20px;
    }

    :host ::ng-deep .custom-table {
      background-color: #1e1e1e;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep .custom-table .p-datatable-thead > tr > th {
      background-color: #252525;
      color: #ffffff;
      border-color: #444444;
      padding: 12px 16px;
      font-weight: 600;
    }

    :host ::ng-deep .custom-table .p-datatable-tbody > tr {
      background-color: #1e1e1e;
      color: #e0e0e0;
      transition: background-color 0.2s ease;
    }

    :host ::ng-deep .custom-table .p-datatable-tbody > tr > td {
      border-color: #333333;
      padding: 12px 16px;
    }

    :host ::ng-deep .custom-table .p-datatable-tbody > tr:hover {
      background-color: #252525;
    }

    :host ::ng-deep .p-paginator {
      background-color: #252525;
      color: #e0e0e0;
      border-color: #444444;
      padding: 8px;
    }

    :host ::ng-deep .p-paginator .p-paginator-element {
      color: #e0e0e0;
    }

    :host ::ng-deep .p-paginator .p-paginator-page.p-highlight {
      background-color: #4caf50;
      color: #ffffff;
    }

    .table-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
    }

    /* Empty message */
    .empty-message {
      text-align: center;
      padding: 40px !important;
      color: #888888;
    }

    .empty-icon {
      font-size: 32px;
      margin-bottom: 16px;
      color: #666666;
    }

    /* Dialog Styling */
    :host ::ng-deep .custom-dialog .p-dialog-header {
      background-color: #252525;
      color: #ffffff;
      padding: 16px 20px;
      border-bottom: 1px solid #444444;
    }

    :host ::ng-deep .custom-dialog .p-dialog-content {
      background-color: #1e1e1e;
      color: #e0e0e0;
    }

    :host ::ng-deep .custom-dialog .p-dialog-footer {
      background-color: #252525;
      border-top: 1px solid #444444;
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-weight: 500;
      color: #e0e0e0;
    }

    .field-input {
      background-color: #252525;
      color: #ffffff;
      border: 1px solid #444444;
      border-radius: 4px;
      padding: 10px 12px;
      transition: all 0.2s ease;
    }

    .field-input:focus {
      border-color: #4caf50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }

    .textarea {
      resize: vertical;
      min-height: 100px;
    }

    /* Export Dialog */
    .export-content {
      background-color: #252525;
      overflow: auto;
      max-height: 60vh;
      border-radius: 4px;
      padding: 12px;
    }

    .export-code {
      margin: 0;
      white-space: pre-wrap;
      font-family: 'Consolas', 'Monaco', monospace;
      color: #e0e0e0;
      font-size: 14px;
      line-height: 1.5;
    }
    :host ::ng-deep .custom-tree {
  border: none;
  background-color: #1a1a1a;
  color: #e0e0e0;
  padding: 0.5rem;
  border-radius: 6px;
}

:host ::ng-deep .custom-tree .p-tree-container {
  overflow: visible;
}

:host ::ng-deep .custom-tree .p-treenode {
  padding: 2px 0;
}

:host ::ng-deep .custom-tree .p-treenode-content {
  border-radius: 4px;
  padding: 8px;
  transition: background-color 0.2s, box-shadow 0.2s;
}

:host ::ng-deep .custom-tree .p-treenode-content:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

:host ::ng-deep .custom-tree .p-treenode-content.p-highlight {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  font-weight: 500;
}

:host ::ng-deep .custom-tree .p-tree-toggler {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  transition: background-color 0.2s;
}

:host ::ng-deep .custom-tree .p-tree-toggler:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

:host ::ng-deep .custom-tree .p-treenode-icon {
  margin-right: 0.5rem;
  color: #4caf50;
}

:host ::ng-deep .custom-tree .p-tree-filter-container {
  margin-bottom: 0.5rem;
  width: 100%;
}

:host ::ng-deep .custom-tree .p-tree-filter {
  width: 100%;
  padding: 0.5rem;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}

:host ::ng-deep .custom-tree .p-treenode-children {
  padding-left: 1.5rem;
}

/* Different icon colors for different node types */
:host ::ng-deep .custom-tree .p-treenode[data-type="project"] .p-treenode-icon {
  color: #64b5f6; /* Blue */
}

:host ::ng-deep .custom-tree .p-treenode[data-type="root"] .p-treenode-icon {
  color: #4caf50; /* Green */
}

:host ::ng-deep .custom-tree .p-treenode[data-type="message"] .p-treenode-icon {
  color: #ffb74d; /* Orange */
}

:host ::ng-deep .custom-tree .p-treenode[data-type="field"] .p-treenode-icon {
  color: #ba68c8; /* Purple */
}

/* Tree header styling */
:host ::ng-deep .p-tree-header {
  padding: 0.5rem;
  background-color: #252525;
  border-bottom: 1px solid #444;
  color: #fff;
  font-size: 16px;
  border-radius: 4px 4px 0 0;
}

    /* Responsive adjustments */
    @media (max-width: 992px) {
      .tree-layout {
        flex-direction: column;
        height: auto;
      }

      .tree-sidebar {
        flex: none;
        width: 100%;
        max-height: 400px;
      }
      
      .tree-details {
        flex: none;
        min-height: 400px;
      }
      
      .action-btn {
        flex: none;
        width: calc(50% - 5px);
      }
    }

    @media (max-width: 768px) {
      .project-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .header-right {
        width: 100%;
      }
      
      .search-container {
        width: 100%;
      }
      
      .search-input {
        width: 100%;
      }
      
      .action-button {
        flex: 1;
      }
      
      .details-property {
        flex-direction: column;
      }
      
      .property-label {
        width: 100%;
        margin-bottom: 4px;
      }
      
      .property-value {
        width: 100%;
      }
    }

    @media (max-width: 576px) {
      .tab-item {
        padding: 10px 12px;
        font-size: 14px;
      }
      
      .action-btn {
        width: 100%;
      }
    }
  `]
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
          if (this.treeNodes[0].children[i].children && this.treeNodes[0].children[i].children.length > 0) {
            this.treeNodes[0].children[i].children[0].expanded = true;
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
  
  // Add method to expand parent nodes
  expandParentPath(node: TreeNode) {
    const findAndExpandParent = (nodes: TreeNode[], targetKey: string): boolean => {
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
  ngOnDestroy() {
    // Leave SignalR group
    if (this.projectId) {
      this.signalRService.leaveProject(this.projectId);
    }

    this.destroy$.next();
    this.destroy$.complete();
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
    return `${type} Details: ${this.selectedNode.label || ''}`;
  }

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

  filterTreeNodes(term: string) {
    // Reset tree with all nodes
    this.updateTreeNodes();

    if (!term || !this.treeNodes.length) return;

    const filterNode = (node: TreeNode): boolean => {
      // Check if the current node matches
      const nodeLabel = node.label || '';
      const matches = nodeLabel.toLowerCase().includes(term.toLowerCase());

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
  loadTreeData() {
    // First, load the project
    this.store.dispatch(loadProject({ id: this.projectId }));
    
    // Subscribe to the project data
    this.store.select(selectProjectById(this.projectId))
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        if (project) {
          this.project = project;
          
          // Load all roots for this project
          this.store.dispatch(loadRootsByProject({ projectId: this.projectId }));
          
          // Subscribe to roots data
          this.store.select(selectRootsByProjectId(this.projectId))
            .pipe(takeUntil(this.destroy$))
            .subscribe(roots => {
              if (roots && roots.length > 0) {
                this.roots = roots;
                
                // Trigger loading of all messages for each root
                this.roots.forEach(root => {
                  // Implement a loadMessagesForRoot action in your store
                  // For now, let's assume we already have all messages loaded with the root
                  // If messages are loaded separately, dispatch actions here
                  
                  // Also load fields for all messages
                  if (root.messages && root.messages.length > 0) {
                    root.messages.forEach(message => {
                      // If fields are loaded separately, dispatch actions here
                    });
                  }
                });
                
                // Now build the tree with all data loaded
                this.updateTreeNodes();
                this.expandFirstLevel();
              }
            });
        }
      });
  }
  
  // Add a method to handle tree node rendering with custom templates
  // If you're using custom node templates, add this to your component's template
  
  /**
   * <ng-template pTemplate="node" let-node>
   *   <div class="tree-node-content" [attr.data-type]="node.type">
   *     <span class="tree-node-icon">
   *       <i [class]="node.icon" [ngClass]="getNodeIconClass(node)"></i>
   *     </span>
   *     <span class="tree-node-label">{{ node.label }}</span>
   *     <span *ngIf="node.type === 'message'" class="node-badge">
   *       {{ (node.data?.fields?.length || 0) }} fields
   *     </span>
   *   </div>
   * </ng-template>
   */
  
  // Add this helper method to get specific styling for different node types
  getNodeIconClass(node: TreeNode) {
    if (!node?.type) return '';
    
    switch (node.type) {
      case 'project':
        return 'project-icon';
      case 'root':
        return 'root-icon';
      case 'message':
        return 'message-icon';
      case 'field':
        return 'field-icon';
      default:
        return '';
    }
  }
  
  // Add these CSS styles to enhance the tree node appearance
  
  /**
   * .tree-node-content {
   *   display: flex;
   *   align-items: center;
   *   gap: 8px;
   *   padding: 4px;
   *   border-radius: 4px;
   *   transition: background-color 0.2s;
   * }
   * 
   * .tree-node-icon {
   *   display: flex;
   *   align-items: center;
   *   justify-content: center;
   *   width: 24px;
   *   height: 24px;
   * }
   * 
   * .tree-node-icon i {
   *   font-size: 16px;
   * }
   * 
   * .tree-node-label {
   *   flex: 1;
   * }
   * 
   * .node-badge {
   *   background-color: rgba(76, 175, 80, 0.2);
   *   color: #4caf50;
   *   padding: 2px 6px;
   *   border-radius: 10px;
   *   font-size: 0.75rem;
   * }
   * 
   * [data-type="project"] .tree-node-icon i {
   *   color: #64b5f6;
   * }
   * 
   * [data-type="root"] .tree-node-icon i {
   *   color: #4caf50;
   * }
   * 
   * [data-type="message"] .tree-node-icon i {
   *   color: #ffb74d;
   * }
   * 
   * [data-type="field"] .tree-node-icon i {
   *   color: #ba68c8;
   * }
   * 
   * .project-icon {
   *   color: #64b5f6 !important;
   * }
   * 
   * .root-icon {
   *   color: #4caf50 !important;
   * }
   * 
   * .message-icon {
   *   color: #ffb74d !important;
   * }
   * 
   * .field-icon {
   *   color: #ba68c8 !important;
   * }
   */
  
  // Add a debug method to log the structure of the tree
  debugTreeStructure() {
    const printNode = (node: TreeNode, level = 0) => {
      const indent = '  '.repeat(level);
      console.log(`${indent}- ${node.label} (${node.type})`);
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => printNode(child, level + 1));
      }
    };
    
    console.log('Tree structure:');
    this.treeNodes.forEach(node => printNode(node));
  }
}