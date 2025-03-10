// src/app/components/field/field-detail.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { TagModule } from 'primeng/tag';

import { AppState } from '../../store/app.state';
import { selectFieldById } from '../../store/field/field.selectors';
import { Field, FieldType } from '../../models/field.model';
import { EnumValue } from '../../models/enum-value.model';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';
import { SearchBoxComponent } from '../shared/search-box/search-box.component';
import { FieldFormComponent } from '../field/field-components';
import { SignalRService } from '../../services/signalr.service';
import { loadField, updateField, createField, deleteField, exportField } from '../../store/field/field.actions';
import { updateEnumValue, deleteEnumValue } from '../../store/enum-value/enum-value.actions';

@Component({
  selector: 'app-field-detail',
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
    TagModule,
    BreadcrumbComponent,
    FieldFormComponent,
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
          <h1 class="text-2xl font-bold m-0" *ngIf="field">{{ field.name }}</h1>
        </div>
        <div class="p-toolbar-group-end">
          <button 
            pButton 
            type="button" 
            label="New Child Field" 
            icon="pi pi-plus" 
            class="ml-2" 
            (click)="showCreateChildFieldDialog()"
            *ngIf="field?.type === 'Complex'"
          ></button>
          <button 
            pButton 
            type="button" 
            label="Export" 
            icon="pi pi-download" 
            class="p-button-success ml-2" 
            (click)="exportField()"
          ></button>
        </div>
      </p-toolbar>
      
      <div class="grid mt-4">
        <div class="col-5">
          <p-card header="Field Information" styleClass="h-full">
            <div class="grid">
              <div class="col-4 font-bold">Name:</div>
              <div class="col-8">{{ field?.name }}</div>
              
              <div class="col-4 font-bold">Description:</div>
              <div class="col-8">{{ field?.description }}</div>
              
              <div class="col-4 font-bold">Type:</div>
              <div class="col-8">
                <p-tag 
                  [value]="field?.type" 
                  [severity]="getFieldTypeSeverity(field?.type)"
                ></p-tag>
              </div>
              
              <div class="col-4 font-bold">Default Value:</div>
              <div class="col-8">{{ field?.defaultValue || 'None' }}</div>
              
              <div class="col-4 font-bold">Required:</div>
              <div class="col-8">
                <i 
                  class="pi" 
                  [ngClass]="{'pi-check-circle text-green-500': field?.isRequired, 'pi-times-circle text-red-500': !field?.isRequired}"
                ></i>
                {{ field?.isRequired ? 'Yes' : 'No' }}
              </div>
              
              <div class="col-4 font-bold">Created:</div>
              <div class="col-8">{{ field?.createdDate | date }}</div>
              
              <div class="col-4 font-bold">Last Modified:</div>
              <div class="col-8">{{ field?.lastModifiedDate | date }}</div>
              
              <div class="col-4 font-bold">Child Fields:</div>
              <div class="col-8">{{ field?.childFields?.length || 0 }}</div>
            </div>
            
            <div class="flex justify-content-end gap-2 mt-4">
              <button 
                pButton 
                type="button" 
                icon="pi pi-arrow-left" 
                label="Back to Message" 
                class="p-button-outlined"
                [routerLink]="['/messages', field?.messageId]"
                *ngIf="field?.messageId"
              ></button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-arrow-left" 
                label="Back to Parent" 
                class="p-button-outlined"
                [routerLink]="['/fields', field?.parentFieldId]"
                *ngIf="field?.parentFieldId"
              ></button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-pencil" 
                label="Edit" 
                class="p-button-success" 
                (click)="showEditFieldDialog()"
              ></button>
            </div>
          </p-card>
        </div>
        
        <div class="col-7">
          <p-tabView>
            <p-tabPanel *ngIf="field?.type === 'Enum'" header="Enum Values">
              <p-table 
                [value]="field?.enumValues || []" 
                styleClass="p-datatable-sm p-datatable-gridlines"
                [paginator]="true" 
                [rows]="10" 
                [rowsPerPageOptions]="[10, 25, 50]" 
                [showCurrentPageReport]="true"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th style="width: 100px">Actions</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-enumValue>
                  <tr>
                    <td>{{ enumValue.name }}</td>
                    <td>{{ enumValue.value }}</td>
                    <td>{{ enumValue.description }}</td>
                    <td>
                      <div class="flex gap-2">
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-pencil" 
                          class="p-button-sm p-button-success" 
                          (click)="editEnumValue(enumValue)"
                          pTooltip="Edit"
                        ></button>
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-trash" 
                          class="p-button-sm p-button-danger" 
                          (click)="confirmDeleteEnumValue(enumValue)"
                          pTooltip="Delete"
                        ></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="text-center p-4">
                      No enum values found.
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-tabPanel>
            
            <p-tabPanel *ngIf="field?.type === 'Complex'" header="Child Fields">
              <p-table 
                [value]="field?.childFields || []" 
                styleClass="p-datatable-sm p-datatable-gridlines"
                [paginator]="true" 
                [rows]="10" 
                [rowsPerPageOptions]="[10, 25, 50]" 
                [showCurrentPageReport]="true"
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
                <ng-template pTemplate="body" let-childField>
                  <tr>
                    <td>{{ childField.name }}</td>
                    <td>
                      <p-tag 
                        [value]="childField.type" 
                        [severity]="getFieldTypeSeverity(childField.type)"
                      ></p-tag>
                    </td>
                    <td>
                      <i 
                        class="pi" 
                        [ngClass]="{'pi-check-circle text-green-500': childField.isRequired, 'pi-times-circle text-red-500': !childField.isRequired}"
                      ></i>
                    </td>
                    <td>{{ childField.description }}</td>
                    <td>
                      <div class="flex gap-2">
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-eye" 
                          class="p-button-sm p-button-info" 
                          [routerLink]="['/fields', childField.id]"
                          pTooltip="View"
                        ></button>
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-pencil" 
                          class="p-button-sm p-button-success" 
                          (click)="showEditChildFieldDialog(childField)"
                          pTooltip="Edit"
                        ></button>
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-trash" 
                          class="p-button-sm p-button-danger" 
                          (click)="confirmDeleteChildField(childField)"
                          pTooltip="Delete"
                        ></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="5" class="text-center p-4">
                      No child fields found.
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-tabPanel>
          </p-tabView>
        </div>
      </div>
    </div>
    
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
        [messageId]="field?.messageId ?? null"
        [parentFieldId]="field?.parentFieldId ?? null"
        (formSubmit)="onFieldFormSubmit($event)"
        (formCancel)="fieldDialogVisible = false"
      ></app-field-form>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="childFieldDialogVisible" 
      [header]="childFieldDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '600px'}"
    >
      <app-field-form 
        [field]="selectedChildField"
        [messageId]="null"
        [parentFieldId]="fieldId"
        (formSubmit)="onChildFieldFormSubmit($event)"
        (formCancel)="childFieldDialogVisible = false"
      ></app-field-form>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="enumValueDialogVisible"
      [header]="enumValueDialogHeader"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '500px'}"
    >
      <!-- Simple form to edit enum value -->
      <!-- This would be better as a separate component in a real application -->
      <form (ngSubmit)="saveEnumValue()" *ngIf="selectedEnumValue" class="p-fluid">
        <div class="field">
          <label for="enumName" class="font-bold">Name</label>
          <input 
            id="enumName" 
            type="text" 
            pInputText 
            [(ngModel)]="selectedEnumValue.name" 
            name="name"
            required
          />
        </div>
        
        <div class="field">
          <label for="enumValue" class="font-bold">Value</label>
          <input 
            id="enumValue" 
            type="text" 
            pInputText 
            [(ngModel)]="selectedEnumValue.value" 
            name="value"
            required
          />
        </div>
        
        <div class="field">
          <label for="enumDescription" class="font-bold">Description</label>
          <input 
            id="enumDescription" 
            type="text" 
            pInputText 
            [(ngModel)]="selectedEnumValue.description" 
            name="description"
          />
        </div>
        
        <div class="flex justify-content-end gap-2 mt-4">
          <button 
            pButton 
            type="button" 
            label="Cancel" 
            class="p-button-outlined" 
            (click)="enumValueDialogVisible = false"
          ></button>
          <button 
            pButton 
            type="submit" 
            label="Save" 
          ></button>
        </div>
      </form>
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
export class FieldDetailComponent implements OnInit, OnDestroy {
  fieldId: string = '';
  field: Field | null = null;
  breadcrumbs: Breadcrumb[] = [];
  
  fieldDialogVisible = false;
  fieldDialogHeader = '';
  selectedField: Field | null = null;
  
  childFieldDialogVisible = false;
  childFieldDialogHeader = '';
  selectedChildField: Field | null = null;
  
  enumValueDialogVisible = false;
  enumValueDialogHeader = '';
  selectedEnumValue: EnumValue | null = null;
  
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
      this.fieldId = params['id'];
      
      // Load field details
      this.store.dispatch(loadField({ id: this.fieldId }));
      
      // Subscribe to field data
      this.store.select(selectFieldById(this.fieldId)).pipe(
        takeUntil(this.destroy$)
      ).subscribe(field => {
        if (field) {
          this.field = field;
          
          // Update breadcrumbs
          this.updateBreadcrumbs();
          
          // Join SignalR group for this project (if applicable)
          if (field.messageId) {
            // Get the project ID through message -> root -> project
            this.store.select(state => {
              const message = state.messages.messages.find(m => m.id === field.messageId);
              if (message) {
                const root = state.roots.roots.find(r => r.id === message.rootId);
                return root ? root.projectId : null;
              }
              return null;
            }).pipe(
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
    // Leave SignalR group - handled in parent components
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateBreadcrumbs() {
    this.breadcrumbs = [
      { label: 'Projects', routerLink: ['/projects'] }
    ];
    
    if (this.field?.messageId) {
      // Field belongs directly to a message
      this.store.select(state => {
        const message = state.messages.messages.find(m => m.id === this.field?.messageId);
        if (message) {
          const root = state.roots.roots.find(r => r.id === message.rootId);
          return { message, root };
        }
        return null;
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe(result => {
        if (result) {
          this.breadcrumbs = [
            { label: 'Projects', routerLink: ['/projects'] },
            { label: 'Root', routerLink: ['/roots', result.root?.id || ''] },
            { label: 'Message', routerLink: ['/messages', result.message.id] },
            { label: this.field?.name || 'Field' }
          ];
        }
      });
    } else if (this.field?.parentFieldId) {
      // Field belongs to a parent field (complex field)
      this.store.select(state => {
        const parentField = state.fields.fields.find(f => f.id === this.field?.parentFieldId);
        return parentField || null;
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe(parentField => {
        if (parentField) {
          this.breadcrumbs = [
            { label: 'Projects', routerLink: ['/projects'] },
            { label: 'Parent Field', routerLink: ['/fields', parentField.id] },
            { label: this.field?.name || 'Field' }
          ];
        }
      });
    }
  }

  getFieldTypeSeverity(type: FieldType | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    if (!type) return 'info';
    
    switch (type) {
      case FieldType.String:
        return 'info';
      case FieldType.Integer:
      case FieldType.Decimal:
        return 'success';
      case FieldType.Boolean:
        return 'warn';
      case FieldType.DateTime:
        return 'info';
      case FieldType.Enum:
        return 'danger';
      case FieldType.Complex:
        return 'secondary';
      default:
        return 'info';
    }
  }

  showEditFieldDialog() {
    this.selectedField = { ...this.field! };
    this.fieldDialogHeader = 'Edit Field';
    this.fieldDialogVisible = true;
  }

  onFieldFormSubmit(field: Field) {
    this.store.dispatch(updateField({ field }));
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field updated successfully' });
    this.fieldDialogVisible = false;
  }

  showCreateChildFieldDialog() {
    this.selectedChildField = null;
    this.childFieldDialogHeader = 'Create Child Field';
    this.childFieldDialogVisible = true;
  }

  showEditChildFieldDialog(childField: Field) {
    this.selectedChildField = { ...childField };
    this.childFieldDialogHeader = 'Edit Child Field';
    this.childFieldDialogVisible = true;
  }

  onChildFieldFormSubmit(field: Field) {
    if (this.selectedChildField) {
      // Update
      this.store.dispatch(updateField({ field: { ...field, id: this.selectedChildField.id } }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Child field updated successfully' });
    } else {
      // Create
      this.store.dispatch(createField({ 
        field: { 
          ...field, 
          parentFieldId: this.fieldId,
          messageId: null
        } 
      }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Child field created successfully' });
    }
    this.childFieldDialogVisible = false;
  }

  confirmDeleteChildField(childField: Field) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the field "${childField.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteField({ id: childField.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field deleted successfully' });
      }
    });
  }

  editEnumValue(enumValue: EnumValue) {
    this.selectedEnumValue = { ...enumValue };
    this.enumValueDialogHeader = 'Edit Enum Value';
    this.enumValueDialogVisible = true;
  }

  saveEnumValue() {
    if (this.selectedEnumValue) {
      this.store.dispatch(updateEnumValue({ enumValue: this.selectedEnumValue }));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Enum value updated successfully' });
      this.enumValueDialogVisible = false;
    }
  }

  confirmDeleteEnumValue(enumValue: EnumValue) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the enum value "${enumValue.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(deleteEnumValue({ id: enumValue.id }));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Enum value deleted successfully' });
      }
    });
  }

  exportField() {
    if (!this.fieldId) return;
    
    this.store.dispatch(exportField({ id: this.fieldId }));
    
    // Subscribe to the exported XML
    this.store.select(state => state.fields.exportedXml).pipe(
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
}
