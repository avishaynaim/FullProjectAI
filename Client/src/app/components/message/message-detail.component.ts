// src/app/components/message/message-detail.component.ts
import { Component, OnInit, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
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
import { updateField, createField, deleteField } from '../../store/field/field.actions';
import { exportMessage, loadMessage, updateMessage } from '../../store/message/message.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
        <app-breadcrumb [breadcrumbs]="breadcrumbs()"></app-breadcrumb>
      </div>
      
      <p-toolbar>
        <div class="p-toolbar-group-start">
          <h1 class="text-2xl font-bold m-0" *ngIf="message()">{{ message()?.name }}</h1>
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
              <div class="col-8">{{ message()?.name }}</div>
              
              <div class="col-4 font-bold">Description:</div>
              <div class="col-8">{{ message()?.description }}</div>
              
              <div class="col-4 font-bold">Created:</div>
              <div class="col-8">{{ message()?.createdDate | date }}</div>
              
              <div class="col-4 font-bold">Last Modified:</div>
              <div class="col-8">{{ message()?.lastModifiedDate | date }}</div>
              
              <div class="col-4 font-bold">Fields:</div>
              <div class="col-8">{{ message()?.fields?.length || 0 }}</div>
            </div>
            
            <div class="flex justify-content-end gap-2 mt-4">
              <button 
                pButton 
                type="button" 
                icon="pi pi-arrow-left" 
                label="Back to Root" 
                class="p-button-outlined"
                [routerLink]="['/roots', message()?.rootId]"
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
              [value]="fieldTreeNodes()"
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
      [visible]="messageDialogVisible()" (visibleChange)="messageDialogVisible.set($event)"
      [header]="'Edit Message'"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '500px'}"
      (visibleChange)="setMessageDialogVisible($event)"
    >
      <app-message-form 
        [message]="message()"
        [rootId]="message()?.rootId || ''"
        (formSubmit)="onMessageFormSubmit($event)"
        (formCancel)="setMessageDialogVisible(false)"
      ></app-message-form>
    </p-dialog>
    
    <p-dialog 
      [visible]="fieldDialogVisible()" (visibleChange)="fieldDialogVisible.set($event)"
      [header]="fieldDialogHeader()"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '600px'}"
      (visibleChange)="setFieldDialogVisible($event)"
    >
      <app-field-form 
        [field]="selectedField()"
        [messageId]="messageId()"
        [parentFieldId]="null"
        (formSubmit)="onFieldFormSubmit($event)"
        (formCancel)="setFieldDialogVisible(false)"
      ></app-field-form>
    </p-dialog>
    
    <p-dialog 
    [visible]="exportDialogVisible()" (visibleChange)="exportDialogVisible.set($event)"

      header="Exported XML"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '80vw'}"
      (visibleChange)="setExportDialogVisible($event)"
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
  `
})
export class MessageDetailComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store<AppState>);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private signalRService = inject(SignalRService);

  // Signal state
  messageId = signal<string>('');
  message = signal<Message | null>(null);
  breadcrumbs = signal<Breadcrumb[]>([]);
  fieldTreeNodes = signal<TreeNode[]>([]);

  messageDialogVisible = signal<boolean>(false);

  fieldDialogVisible = signal<boolean>(false);
  fieldDialogHeader = signal<string>('');
  selectedField = signal<Field | null>(null);

  exportDialogVisible = signal<boolean>(false);
  exportedXml = signal<string>('');

  // Get the exported XML as a signal
  private exportedXmlFromStore = toSignal(
    this.store.select(state => state.messages.exportedXml),
    { initialValue: '' }
  );

  ngOnInit() {
    // Get message ID from route params
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const id = params['id'];
      this.messageId.set(id);

      // Load message details
      this.store.dispatch(loadMessage({ id }));
    });

    // Create an effect to listen for message changes
    effect(() => {
      const messageId = this.messageId();
      if (!messageId) return;

      // Setup message observer
      this.store.select(selectMessageById(messageId))
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          filter(message => !!message)
        )
        .subscribe(message => {
          if (message) {
            this.message.set(message);
            this.buildFieldTreeNodes();
            this.updateBreadcrumbs(message);
            this.setupSignalR(message);
          }
        });
    });

    // Effect for handling exported XML
    effect(() => {
      const xml = this.exportedXmlFromStore();
      if (xml) {
        this.exportedXml.set(xml);
        this.exportDialogVisible.set(true);
      }
    });
  }

  private updateBreadcrumbs(message: Message) {
    this.breadcrumbs.set([
      { label: 'Projects', routerLink: ['/projects'] },
      { label: 'Root', routerLink: ['/roots', message.rootId] },
      { label: message.name }
    ]);
  }

  private setupSignalR(message: Message) {
    if (message.rootId) {
      // Get project ID from the root
      this.store.select(state =>
        state.roots.roots.find((r: { id: string }) => r.id === message.rootId)?.projectId || ''
      )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          filter(projectId => !!projectId)
        )
        .subscribe(projectId => {
          if (projectId) {
            this.signalRService.joinProject(projectId);
          }
        });
    }
  }

  buildFieldTreeNodes() {
    const currentMessage = this.message();

    if (!currentMessage || !currentMessage.fields) {
      this.fieldTreeNodes.set([]);
      return;
    }

    // Get top-level fields (those without a parent)
    const topLevelFields = currentMessage.fields.filter(f => !f.parentFieldId);

    // Build tree nodes
    const nodes = topLevelFields.map(field =>
      this.createFieldTreeNode(field, currentMessage.fields)
    );

    this.fieldTreeNodes.set(nodes);
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
    this.messageDialogVisible.set(true);
  }

  setMessageDialogVisible(value: boolean) {
    this.messageDialogVisible.set(value);
  }

  onMessageFormSubmit(message: Message) {
    this.store.dispatch(updateMessage({ message }));
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message updated successfully' });
    this.messageDialogVisible.set(false);
  }

  showCreateFieldDialog() {
    this.selectedField.set(null);
    this.fieldDialogHeader.set('Create New Field');
    this.fieldDialogVisible.set(true);
  }

  showEditFieldDialog(field: Field) {
    this.selectedField.set({ ...field });
    this.fieldDialogHeader.set('Edit Field');
    this.fieldDialogVisible.set(true);
  }

  setFieldDialogVisible(value: boolean) {
    this.fieldDialogVisible.set(value);
  }

  onFieldFormSubmit(field: Field) {
    const currentSelectedField = this.selectedField();

    if (currentSelectedField) {
      // Update
      this.store.dispatch(updateField({
        field: { ...field, id: currentSelectedField.id }
      }));
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Field updated successfully'
      });
    } else {
      // Create
      this.store.dispatch(createField({
        field: {
          ...field,
          messageId: this.messageId(),
          parentFieldId: null
        }
      }));
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Field created successfully'
      });
    }
    this.fieldDialogVisible.set(false);
  }

  confirmDeleteField(field: Field) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the field "${field.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteField({ id: field.id }));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Field deleted successfully'
        });
      }
    });
  }

  exportMessage() {
    const id = this.messageId();
    if (!id) return;

    this.store.dispatch(exportMessage({ id }));
  }

  setExportDialogVisible(value: boolean) {
    this.exportDialogVisible.set(value);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'XML copied to clipboard'
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy to clipboard'
        });
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