// src/app/components/message/message-detail.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

import { AppState } from '../../store/app.state';
import * as MessageActions from '../../store/message/message.actions';
import * as FieldActions from '../../store/field/field.actions';
import { selectMessageById } from '../../store/message/message.selectors';
import { Message } from '../../models/message.model';
import { Field, FieldType } from '../../models/field.model';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';
import { SearchBoxComponent } from '../shared/search-box/search-box.component';

import { SignalRService } from '../../services/signalr.service';
import { MessageFormComponent } from '../message/message-components';
import { FieldFormComponent } from '../field/field-components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    ToastModule,
    TreeTableModule,
    BreadcrumbComponent,
    SearchBoxComponent,
    FieldFormComponent,
    MessageFormComponent,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="mb-4">
        <app-breadcrumb [breadcrumbs]="breadcrumbs"></app-breadcrumb>
      </div>
      
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-bold m-0" *ngIf="message">{{ message.name }}</h1>
        </div>
        <div class="p-toolbar-group-end">
          <app-search-box 
            (search)="onSearch($event)" 
            (clear)="onClearSearch()"
          ></app-search-box>
          <button 
            pButton 
            type="button" 
            label="New Field" 
            icon="pi pi-plus" 
            class="ml-2" 
            (click)="showCreateFieldDialog()"
          ></button>
          <button 
            pButton 
            type="button" 
            label="Export" 
            icon="pi pi-download" 
            class="p-button-success ml-2" 
            (click)="exportMessage()"
          ></button>
        </div>
      </p-toolbar>
      
      <div class="grid mt-4">
        <div class="col-4">
          <p-card header="Message Information" styleClass="h-full">
            <div class="grid">
              <div class="col-4 font-bold">Name:</div>
              <div class="col-8">{{ message?.name }}</div>
              
              <div class="col-4 font-bold">Description:</div>
              <div class="col-8">{{ message?.description }}</div>
              
              <div class="col-4 font-bold">Created:</div>
              <div class="col-8">{{ message?.createdDate | date }}</div>
              
              <div class="col-4 font-bold">Last Modified:</div>
              <div class="col-8">{{ message?.lastModifiedDate | date }}</div>
              
              <div class="col-4 font-bold">Fields:</div>
              <div class="col-8">{{ message?.fields?.length || 0 }}</div>
            </div>
            
            <div class="flex justify-content-end gap-2 mt-4">
              <button 
                pButton 
                type="button" 
                icon="pi pi-arrow-left" 
                label="Back to Root" 
                class="p-button-outlined"
                [routerLink]="['/roots', message?.rootId]"
              ></button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-pencil" 
                label="Edit" 
                class="p-button-success" 
                (click)="showEditMessageDialog()"
              ></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-8">
          <p-card header="Fields" styleClass="h-full">
            <p-treeTable 
              [value]="fieldTreeNodes"
              [paginator]="true"
              [rows]="10"
              [rowsPerPageOptions]="[10, 25, 50]"
              [showCurrentPageReport]="true"
              styleClass="p-treetable-sm p-treetable-gridlines"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th style="width: 150px">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-node>
                <tr>
                  <td>
                    <p-treeTableToggler [rowNode]="node"></p-treeTableToggler>
                    {{ node.data.name }}
                  </td>
                  <td>{{ node.data.type }}</td>
                  <td>
                    <i 
                      class="pi" 
                      [ngClass]="{'pi-check-circle text-green-500': node.data.isRequired, 'pi-times-circle text-red-500': !node.data.isRequired}"
                    ></i>
                  </td>
                  <td>{{ node.data.description }}</td>
                  <td>
                    <div class="flex gap-2">
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-eye" 
                        class="p-button-sm p-button-info" 
                        [routerLink]="['/fields', node.data.id]"
                        pTooltip="View"
                      ></button>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-pencil" 
                        class="p-button-sm p-button-success" 
                        (click)="showEditFieldDialog(node.data)"
                        pTooltip="Edit"
                      ></button>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-trash" 
                        class="p-button-sm p-button-danger" 
                        (click)="confirmDeleteField(node.data)"
                        pTooltip="Delete"
                      ></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center p-4">
                    No fields found.
                  </td>
                </tr>
              </ng-template>
            </p-treeTable>
          </p-card>
        </div>
      </div>
    </div>
    
    <p-dialog 
      [(visible)]="messageDialogVisible" 
      [header]="'Edit Message'"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
    >
      <app-message-form 
        [message]="message"
        [rootId]="message?.rootId || ''"
        (formSubmit)="onMessageFormSubmit($event)"
        (formCancel)="messageDialogVisible = false"
      ></app-message-form>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="fieldDialogVisible" 
      [header]="fieldDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '600px'}"
    >
      <app-field-form 
        [field]="selectedField"
        [messageId]="messageId"
        [parentFieldId]="null"
        (formSubmit)="onFieldFormSubmit($event)"
        (formCancel)="fieldDialogVisible = false"
      ></app-field-form>
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
export class MessageDetailComponent implements OnInit, OnDestroy {
  messageId: string = '';
  message: Message | null = null;
  breadcrumbs: Breadcrumb[] = [];
  fieldTreeNodes: TreeNode[] = [];
  
  messageDialogVisible = false;
  
  fieldDialogVisible = false;
  fieldDialogHeader = '';
  selectedField: Field | null = null;
  
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
      this.messageId = params['id'];
      
      // Load message details
      this.store.dispatch(MessageActions.loadMessage({ id: this.messageId }));
      
      // Subscribe to message data
      this.store.select(selectMessageById(this.messageId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(message => {
        if (message) {
          this.message = message;
          
          // Build field tree nodes
          this.buildFieldTreeNodes();
          
          // Update breadcrumbs
          this.breadcrumbs = [
            { label: 'Projects', routerLink: ['/projects'] },
            { label: 'Root', routerLink: ['/roots', message.rootId] },
            { label: message.name }
          ];
          
          // Join SignalR group for this project
          if (message.rootId) {
            // Since we don't have the projectId directly, we'll manage it through the root
            this.store.select(state => 
              state.roots.roots.find(r => r.id === message.rootId)?.projectId || ''
            ).pipe(
              takeUntil(this.destroy$)
            ).subscribe(projectId => {
              if (projectId) {
                this.signalRService.joinProject(projectId);
              }
            });
          }
        }
      });
    });
  }

  ngOnDestroy() {
    // Leave SignalR group - handled in parent component
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildFieldTreeNodes() {
    if (!this.message || !this.message.fields) {
      this.fieldTreeNodes = [];
      return;
    }
    
    // Get top-level fields (those without a parent)
    const topLevelFields = this.message.fields.filter(f => !f.parentFieldId);
    
    // Build tree nodes
    this.fieldTreeNodes = topLevelFields.map(field => this.createFieldTreeNode(field, this.message!.fields));
  }

  createFieldTreeNode(field: Field, allFields: Field[]): TreeNode {
    const node: TreeNode = {
      data: field,
      children: []
    };
    
    // If this is a complex field, add child fields
    if (field.type === FieldType.Complex) {
      // Find all child fields of this field
      const childFields = allFields.filter(f => f.parentFieldId === field.id);
      if (childFields.length > 0) {
        node.children = childFields.map(childField => 
          this.createFieldTreeNode(childField, allFields)
        );
      }
    }
    
    return node;
  }

  showEditMessageDialog() {
    this.messageDialogVisible = true;
  }

  onMessageFormSubmit(message: Message) {
    this.store.dispatch(MessageActions.updateMessage({ message }));
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message updated successfully' });
    this.messageDialogVisible = false;
  }

  showCreateFieldDialog() {
    this.selectedField = null;
    this.fieldDialogHeader = 'Create New Field';
    this.fieldDialogVisible = true;
  }

  showEditFieldDialog(field: Field) {
    this.selectedField = { ...field };
    this.fieldDialogHeader = 'Edit Field';
    this.fieldDialogVisible = true;
  }

  onFieldFormSubmit(field: Field) {
    if (this.selectedField) {
      // Update
      this.store.dispatch(FieldActions.updateField({ field: { ...field, id: this.selectedField.id } }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field updated successfully' });
    } else {
      // Create
      this.store.dispatch(FieldActions.createField({ 
        field: { 
          ...field, 
          messageId: this.messageId,
          parentFieldId: null
        } 
      }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field created successfully' });
    }
    this.fieldDialogVisible = false;
  }

  confirmDeleteField(field: Field) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the field "${field.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(FieldActions.deleteField({ id: field.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field deleted successfully' });
      }
    });
  }

  exportMessage() {
    if (!this.messageId) return;
    
    this.store.dispatch(MessageActions.exportMessage({ id: this.messageId }));
    
    // Subscribe to the exported XML
    this.store.select(state => state.messages.exportedXml).pipe(
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
    // TODO: Implement search functionality
  }

  onClearSearch() {
    // TODO: Reset search results
  }
}
