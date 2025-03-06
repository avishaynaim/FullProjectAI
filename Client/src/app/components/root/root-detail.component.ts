import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AppState } from '../../store/app.state';
import * as RootActions from '../../store/root/root.actions';
import { selectRootById } from '../../store/root/root.selectors';
import { Root } from '../../models/root.model';
import { Message } from '../../models/message.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';
import { SearchBoxComponent } from '../shared/search-box/search-box.component';
import { SignalRService } from '../../services/signalr.service';
import { Breadcrumb } from '../../models/breadcrumb.model';
import * as MessageActions from '../../store//message/message.actions'

@Component({
  selector: 'app-root-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputTextModule,
    // InputTextareaModule,
    ToolbarModule,
    BreadcrumbComponent,
    SearchBoxComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="mb-4">
        <app-breadcrumb [breadcrumbs]="breadcrumbs"></app-breadcrumb>
      </div>
      
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-bold m-0" *ngIf="root">{{ root.name }}</h1>
        </div>
        <div class="p-toolbar-group-end">
          <app-search-box 
            (search)="onSearch($event)" 
            (clear)="onClearSearch()"
          ></app-search-box>
          <button 
            pButton 
            type="button" 
            label="New Message" 
            icon="pi pi-plus" 
            class="ml-2" 
            (click)="showCreateMessageDialog()"
          ></button>
          <button 
            pButton 
            type="button" 
            label="Export" 
            icon="pi pi-download" 
            class="p-button-success ml-2" 
            (click)="exportRoot()"
          ></button>
        </div>
      </p-toolbar>
      
      <div class="grid mt-4">
        <div class="col-4">
          <p-card header="Root Information" styleClass="h-full">
            <div class="grid">
              <div class="col-4 font-bold">Name:</div>
              <div class="col-8">{{ root?.name }}</div>
              
              <div class="col-4 font-bold">Description:</div>
              <div class="col-8">{{ root?.description }}</div>
              
              <div class="col-4 font-bold">Created:</div>
              <div class="col-8">{{ root?.createdDate | date }}</div>
              
              <div class="col-4 font-bold">Last Modified:</div>
              <div class="col-8">{{ root?.lastModifiedDate | date }}</div>
              
              <div class="col-4 font-bold">Messages:</div>
              <div class="col-8">{{ root?.messages?.length || 0 }}</div>
            </div>
            
            <div class="flex justify-content-end gap-2 mt-4">
              <button 
                pButton 
                type="button" 
                icon="pi pi-arrow-left" 
                label="Back to Project" 
                class="p-button-outlined"
                [routerLink]="['/projects', root?.projectId]"
              ></button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-pencil" 
                label="Edit" 
                class="p-button-success" 
                (click)="showEditRootDialog()"
              ></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-8">
          <p-card header="Messages" styleClass="h-full">
            <p-table 
              [value]="root?.messages || []" 
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
                  <th>Fields</th>
                  <th>Created Date</th>
                  <th style="width: 150px">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-message>
                <tr>
                  <td>{{ message.name }}</td>
                  <td>{{ message.description }}</td>
                  <td>{{ message.fields?.length || 0 }}</td>
                  <td>{{ message.createdDate | date }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-eye" 
                        class="p-button-sm p-button-info" 
                        [routerLink]="['/messages', message.id]"
                        pTooltip="View"
                      ></button>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-pencil" 
                        class="p-button-sm p-button-success" 
                        (click)="showEditMessageDialog(message)"
                        pTooltip="Edit"
                      ></button>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-trash" 
                        class="p-button-sm p-button-danger" 
                        (click)="confirmDeleteMessage(message)"
                        pTooltip="Delete"
                      ></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center p-4">
                    No messages found.
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>
    </div>
    
    <p-dialog 
      [(visible)]="rootDialogVisible" 
      [header]="'Edit Root'"
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
      [(visible)]="messageDialogVisible" 
      [header]="messageDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
    >
      <ng-container *ngIf="messageDialogVisible">
        <div class="p-fluid">
          <div class="field">
            <label for="messageName" class="font-bold">Name</label>
            <input 
              id="messageName" 
              type="text" 
              pInputText 
              [(ngModel)]="editingMessage.name"
              class="w-full" 
            />
          </div>
          
          <div class="field">
            <label for="messageDescription" class="font-bold">Description</label>
            <textarea 
              id="messageDescription"
              pInputTextarea
              [(ngModel)]="editingMessage.description"
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
              (click)="messageDialogVisible = false"
            ></button>
            <button 
              pButton 
              type="button" 
              label="Save" 
              (click)="saveMessage()"
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
export class RootDetailComponent implements OnInit, OnDestroy {
  rootId: string = '';
  root: Root | null = null;
  breadcrumbs: Breadcrumb[] = [];
  
  rootDialogVisible = false;
  editingRoot: Partial<Root> = {};
  
  messageDialogVisible = false;
  messageDialogHeader = '';
  editingMessage: Partial<Message> = {};
  isEditingMessage = false;
  
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
      this.rootId = params['id'];
      
      // Load root details
      this.store.dispatch(RootActions.loadRoot({ id: this.rootId }));
      
      // Subscribe to root data
      this.store.select(selectRootById(this.rootId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(root => {
        if (root) {
          this.root = root;
          
          // Update breadcrumbs
          this.breadcrumbs = [
            { label: 'Projects', routerLink: ['/projects'] },
            { label: 'Project', routerLink: ['/projects', root.projectId] },
            { label: root.name }
          ];
          
          // Join SignalR group for this project
          this.signalRService.joinProject(root.projectId);
        }
      });
    });
  }

  ngOnDestroy() {
    // Leave SignalR group
    if (this.root) {
      this.signalRService.leaveProject(this.root.projectId);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  showEditRootDialog() {
    if (!this.root) return;
    
    this.editingRoot = { ...this.root };
    this.rootDialogVisible = true;
  }

  saveRoot() {
    if (!this.root) return;
    
    const updatedRoot: Root = {
      ...this.root,
      name: this.editingRoot.name || this.root.name,
      description: this.editingRoot.description || this.root.description,
      lastModifiedDate: new Date()
    };
    
    this.store.dispatch(RootActions.updateRoot({ root: updatedRoot }));
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root updated successfully' });
    this.rootDialogVisible = false;
  }

  showCreateMessageDialog() {
    this.editingMessage = {};
    this.messageDialogHeader = 'Create New Message';
    this.isEditingMessage = false;
    this.messageDialogVisible = true;
  }

  showEditMessageDialog(message: Message) {
    this.editingMessage = { ...message };
    this.messageDialogHeader = 'Edit Message';
    this.isEditingMessage = true;
    this.messageDialogVisible = true;
  }

  saveMessage() {
    if (!this.root) return;
    
    if (this.isEditingMessage && this.editingMessage.id) {
      // Update existing message
      const updatedMessage: Message = {
        ...(this.editingMessage as Message),
        lastModifiedDate: new Date()
      };
      
      this.store.dispatch(MessageActions.updateMessage({ message: updatedMessage }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message updated successfully' });
    } else {
      // Create new message
      const newMessage: Message = {
        id: '',
        name: this.editingMessage.name || '',
        description: this.editingMessage.description || '',
        rootId: this.rootId,
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        fields: []
      };
      
      this.store.dispatch(MessageActions.createMessage({ message: newMessage }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message created successfully' });
    }
    
    this.messageDialogVisible = false;
  }

  confirmDeleteMessage(message: Message) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the message "${message.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(MessageActions.deleteMessage({ id: message.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message deleted successfully' });
      }
    });
  }

  exportRoot() {
    if (!this.rootId) return;
    
    this.store.dispatch(RootActions.exportRoot({ id: this.rootId }));
    
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

  onSearch(term: string) {
    // Implement search functionality
  }

  onClearSearch() {
    // Reset search results
  }
}