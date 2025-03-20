import { Component, OnDestroy, OnInit, signal, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, Observable, map, switchMap, filter, tap } from 'rxjs';
import { AppState } from '../../store/app.state';
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
import { updateMessage, createMessage, deleteMessage } from '../../store/message/message.actions';
import { exportRoot, loadRoot, updateRoot } from '../../store/root/root.actions';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule,
    BreadcrumbComponent,
    SearchBoxComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="mb-4">
        <app-breadcrumb [breadcrumbs]="breadcrumbs()"></app-breadcrumb>
      </div>
      
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-bold m-0" *ngIf="root() as root">{{ root.name }}</h1>
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
            (click)="handleExportRoot()"
          ></button>
        </div>
      </p-toolbar>
      
      <div class="grid mt-4">
        <div class="col-4">
          <p-card header="Root Information" styleClass="h-full">
            <ng-container *ngIf="root() as root">
              <div class="grid">
                <div class="col-4 font-bold">Name:</div>
                <div class="col-8">{{ root.name }}</div>
                
                <div class="col-4 font-bold">Description:</div>
                <div class="col-8">{{ root.description }}</div>
                
                <div class="col-4 font-bold">Created:</div>
                <div class="col-8">{{ root.createdDate | date }}</div>
                
                <div class="col-4 font-bold">Last Modified:</div>
                <div class="col-8">{{ root.lastModifiedDate | date }}</div>
                
                <div class="col-4 font-bold">Messages:</div>
                <div class="col-8">{{ root.messages?.length || 0 }}</div>
              </div>
              
              <div class="flex justify-content-end gap-2 mt-4">
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-arrow-left" 
                  label="Back to Project" 
                  class="p-button-outlined"
                  [routerLink]="['/projects', root.projectId]"
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
            </ng-container>
          </p-card>
        </div>
        
        <div class="col-8">
          <p-card header="Messages" styleClass="h-full">
            <p-table 
              [value]="messages()" 
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
    [visible]="rootDialogVisible()" (visibleChange)="rootDialogVisible.set($event)"
      [header]="'Edit Root'"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
      (onHide)="resetDialogs()"
    >
      <ng-container *ngIf="rootDialogVisible() && rootForm">
        <form [formGroup]="rootForm" (ngSubmit)="saveRoot()">
          <div class="p-fluid">
            <div class="field">
              <label for="rootName" class="font-bold">Name</label>
              <input 
                id="rootName" 
                type="text" 
                pInputText 
                formControlName="name"
                class="w-full" 
              />
            </div>
            
            <div class="field">
              <label for="rootDescription" class="font-bold">Description</label>
              <textarea 
                id="rootDescription"
                pInputTextarea
                formControlName="description"
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
                (click)="setRootDialogVisible(false)"
              ></button>
              <button 
                pButton 
                type="submit" 
                label="Save" 
                [disabled]="rootForm.invalid"
              ></button>
            </div>
          </div>
        </form>
      </ng-container>
    </p-dialog>
    
    <p-dialog 
      [visible]="messageDialogVisible()" (visibleChange)="messageDialogVisible.set($event)"
      [header]="messageDialogHeader()"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
      (onHide)="resetDialogs()"
    >
      <ng-container *ngIf="messageDialogVisible() && messageForm">
        <form [formGroup]="messageForm" (ngSubmit)="saveMessage()">
          <div class="p-fluid">
            <div class="field">
              <label for="messageName" class="font-bold">Name</label>
              <input 
                id="messageName" 
                type="text" 
                pInputText 
                formControlName="name"
                class="w-full" 
              />
            </div>
            
            <div class="field">
              <label for="messageDescription" class="font-bold">Description</label>
              <textarea 
                id="messageDescription"
                pInputTextarea
                formControlName="description"
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
                (click)="setMessageDialogVisible(false)"
              ></button>
              <button 
                pButton 
                type="submit" 
                label="Save" 
                [disabled]="messageForm.invalid"
              ></button>
            </div>
          </div>
        </form>
      </ng-container>
    </p-dialog>
    
    <p-dialog 
      [visible]="exportDialogVisible()" (visibleChange)="exportDialogVisible.set($event)"
      header="Exported XML"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '80vw'}"
      (onHide)="resetDialogs()"
    >
      <div class="p-3 border rounded bg-gray-100 overflow-auto" style="max-height: 70vh">
        <pre>{{ exportedXml() }}</pre>
      </div>
      <div class="flex justify-content-end mt-4">
        <button 
          pButton 
          type="button" 
          label="Copy" 
          icon="pi pi-copy" 
          (click)="copyToClipboard(exportedXml())"
        ></button>
        <button 
          pButton 
          type="button" 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-outlined ml-2" 
          (click)="setExportDialogVisible(false)"
        ></button>
      </div>
    </p-dialog>
    
    <p-confirmDialog></p-confirmDialog>
  `
})
export class RootDetailComponent implements OnInit, OnDestroy {
  // Signals
  rootId = signal<string>('');
  root = signal<Root | null>(null);
  messages = computed(() => this.root()?.messages || []);
  breadcrumbs = signal<Breadcrumb[]>([]);
  
  // Dialog controls
  rootDialogVisible = signal<boolean>(false);
  messageDialogVisible = signal<boolean>(false);
  messageDialogHeader = signal<string>('');
  exportDialogVisible = signal<boolean>(false);
  exportedXml = signal<string>('');
  isEditingMessage = signal<boolean>(false);
  
  // Forms
  rootForm!: FormGroup;
  messageForm!: FormGroup;
  
  // Services
  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private signalRService = inject(SignalRService);
  private fb = inject(FormBuilder);
  
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Initialize forms
    this.initForms();
    
    this.route.params.pipe(
      takeUntil(this.destroy$),
      map(params => params['id']),
      tap(id => {
        this.rootId.set(id);
        this.store.dispatch(loadRoot({ id }));
      }),
      switchMap(id => this.store.select(selectRootById(id)).pipe(
        filter(root => !!root)
      ))
    ).subscribe(root => {
      if (root) {
        this.root.set(root);
        
        // Update breadcrumbs
        this.breadcrumbs.set([
          { label: 'Projects', routerLink: ['/projects'] },
          { label: 'Project', routerLink: ['/projects', root.projectId] },
          { label: root.name }
        ]);
        
        // Join SignalR group for this project
        this.signalRService.joinProject(root.projectId);
      }
    });
    
    // Listen for exported XML
    this.store.select(state => state.roots.exportedXml)
      .pipe(
        takeUntil(this.destroy$),
        filter(xml => !!xml)
      )
      .subscribe(xml => {
        if (xml) {
          this.exportedXml.set(xml);
          this.setExportDialogVisible(true);
        }
      });
  }

  ngOnDestroy() {
    // Leave SignalR group
    const currentRoot = this.root();
    if (currentRoot) {
      this.signalRService.leaveProject(currentRoot.projectId);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initForms() {
    this.rootForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
    
    this.messageForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  // Dialog control methods
  setRootDialogVisible(visible: boolean) {
    this.rootDialogVisible.set(visible);
  }
  
  setMessageDialogVisible(visible: boolean) {
    this.messageDialogVisible.set(visible);
  }
  
  setExportDialogVisible(visible: boolean) {
    this.exportDialogVisible.set(visible);
  }
  
  resetDialogs() {
    if (this.rootForm) {
      this.rootForm.reset();
    }
    if (this.messageForm) {
      this.messageForm.reset();
    }
  }

  showEditRootDialog() {
    const currentRoot = this.root();
    if (!currentRoot) return;
    
    this.rootForm.patchValue({
      name: currentRoot.name,
      description: currentRoot.description
    });
    
    this.setRootDialogVisible(true);
  }

  saveRoot() {
    if (!this.rootForm.valid || !this.root()) return;
    
    const currentRoot = this.root()!;
    const formValues = this.rootForm.value;
    
    const updatedRoot: Root = {
      ...currentRoot,
      name: formValues.name,
      description: formValues.description,
      lastModifiedDate: new Date()
    };
    
    this.store.dispatch(updateRoot({ root: updatedRoot }));
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Root updated successfully' });
    this.setRootDialogVisible(false);
  }

  showCreateMessageDialog() {
    this.messageForm.reset();
    this.messageDialogHeader.set('Create New Message');
    this.isEditingMessage.set(false);
    this.setMessageDialogVisible(true);
  }

  showEditMessageDialog(message: Message) {
    this.messageForm.patchValue({
      id: message.id,
      name: message.name,
      description: message.description
    });
    
    this.messageDialogHeader.set('Edit Message');
    this.isEditingMessage.set(true);
    this.setMessageDialogVisible(true);
  }

  saveMessage() {
    if (!this.messageForm.valid || !this.root()) return;
    
    const formValues = this.messageForm.value;
    const currentRootId = this.rootId();
    
    if (this.isEditingMessage() && formValues.id) {
      // Update existing message
      const existingMessage = this.messages().find(m => m.id === formValues.id);
      if (!existingMessage) return;
      
      const updatedMessage: Message = {
        ...existingMessage,
        name: formValues.name,
        description: formValues.description,
        lastModifiedDate: new Date()
      };
      
      this.store.dispatch(updateMessage({ message: updatedMessage }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message updated successfully' });
    } else {
      // Create new message
      const newMessage: Message = {
        id: '',  // Will be generated by the API/backend
        name: formValues.name,
        description: formValues.description,
        rootId: currentRootId,
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        fields: []
      };
      
      this.store.dispatch(createMessage({ message: newMessage }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message created successfully' });
    }
    
    this.setMessageDialogVisible(false);
  }

  confirmDeleteMessage(message: Message) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the message "${message.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteMessage({ id: message.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message deleted successfully' });
      }
    });
  }

  handleExportRoot() {
    const currentRootId = this.rootId();
    if (!currentRootId) return;
    
    this.store.dispatch(exportRoot({ id: currentRootId }));
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
    console.log('Searching for:', term);
  }

  onClearSearch() {
    // Reset search results
    console.log('Search cleared');
  }
}