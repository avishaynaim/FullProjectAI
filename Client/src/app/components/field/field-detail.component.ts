// src/app/components/field/field-detail.component.ts
import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, map, filter, switchMap, of, BehaviorSubject, take } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

import { AppState } from '../../store/app.state';
import { selectFieldById } from '../../store/field/field.selectors';
import { Field, FieldType } from '../../models/field.model';
import { EnumValue } from '../../models/enum-value.model';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { BreadcrumbComponent } from '../shared/breadcrumb/breadcrumb.component';
import { FieldFormComponent } from '../field/field-components';
import { SignalRService } from '../../services/signalr.service';
import { loadField, updateField, createField, deleteField, exportField } from '../../store/field/field.actions';
import { updateEnumValue, deleteEnumValue } from '../../store/enum-value/enum-value.actions';

type DialogAction = 
  | { type: 'openFieldEdit', field: Field }
  | { type: 'openChildFieldCreate' }
  | { type: 'openChildFieldEdit', field: Field }
  | { type: 'openEnumValueEdit', enumValue: EnumValue }
  | { type: 'closeDialog' };

type FieldAction = 
  | { type: 'updateField', field: Field }
  | { type: 'createChildField', field: Field }
  | { type: 'deleteField', id: string }
  | { type: 'updateEnumValue', enumValue: EnumValue }
  | { type: 'deleteEnumValue', id: string }
  | { type: 'exportField', id: string };

@Component({
  selector: 'app-field-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    ToastModule,
    TagModule,
    InputTextModule,
    // BreadcrumbComponent,
    FieldFormComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="mb-4">
        <!-- <app-breadcrumb [breadcrumbs]="breadcrumbs$ | async"></app-breadcrumb> -->
      </div>
      
      <ng-container *ngIf="field$ | async as field">
        <p-toolbar>
          <div class="p-toolbar-group-start">
            <h1 class="text-2xl font-bold m-0">{{ field.name }}</h1>
          </div>
          <div class="p-toolbar-group-end">
            <button 
              pButton 
              type="button" 
              label="New Child Field" 
              icon="pi pi-plus" 
              class="ml-2" 
              (click)="dialogAction$.next({ type: 'openChildFieldCreate' })"
              *ngIf="field.type === 'Complex'"
            ></button>
            <button 
              pButton 
              type="button" 
              label="Export" 
              icon="pi pi-download" 
              class="p-button-success ml-2" 
              (click)="fieldAction$.next({ type: 'exportField', id: field.id })"
            ></button>
          </div>
        </p-toolbar>
        
        <div class="grid mt-4">
          <div class="col-5">
            <p-card header="Field Information" styleClass="h-full">
              <div class="grid">
                <div class="col-4 font-bold">Name:</div>
                <div class="col-8">{{ field.name }}</div>
                
                <div class="col-4 font-bold">Description:</div>
                <div class="col-8">{{ field.description }}</div>
                
                <div class="col-4 font-bold">Type:</div>
                <div class="col-8">
                  <p-tag 
                    [value]="field.type" 
                    [severity]="getFieldTypeSeverity(field.type)"
                  ></p-tag>
                </div>
                
                <div class="col-4 font-bold">Default Value:</div>
                <div class="col-8">{{ field.defaultValue || 'None' }}</div>
                
                <div class="col-4 font-bold">Required:</div>
                <div class="col-8">
                  <i 
                    class="pi" 
                    [ngClass]="{'pi-check-circle text-green-500': field.isRequired, 'pi-times-circle text-red-500': !field.isRequired}"
                  ></i>
                  {{ field.isRequired ? 'Yes' : 'No' }}
                </div>
                
                <div class="col-4 font-bold">Created:</div>
                <div class="col-8">{{ field.createdDate | date }}</div>
                
                <div class="col-4 font-bold">Last Modified:</div>
                <div class="col-8">{{ field.lastModifiedDate | date }}</div>
                
                <div class="col-4 font-bold">Child Fields:</div>
                <div class="col-8">{{ field.childFields.length || 0 }}</div>
              </div>
              
              <div class="flex justify-content-end gap-2 mt-4">
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-arrow-left" 
                  label="Back to Message" 
                  class="p-button-outlined"
                  [routerLink]="['/messages', field.messageId]"
                  *ngIf="field.messageId"
                ></button>
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-arrow-left" 
                  label="Back to Parent" 
                  class="p-button-outlined"
                  [routerLink]="['/fields', field.parentFieldId]"
                  *ngIf="field.parentFieldId"
                ></button>
                <button 
                  pButton 
                  type="button" 
                  icon="pi pi-pencil" 
                  label="Edit" 
                  class="p-button-success" 
                  (click)="dialogAction$.next({ type: 'openFieldEdit', field: field })"
                ></button>
              </div>
            </p-card>
          </div>
          
          <div class="col-7">
            <p-tabView>
              <p-tabPanel *ngIf="field.type === 'Enum'" header="Enum Values">
                <p-table 
                  [value]="field.enumValues || []" 
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
                            (click)="dialogAction$.next({ type: 'openEnumValueEdit', enumValue: enumValue })"
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
              
              <p-tabPanel *ngIf="field.type === 'Complex'" header="Child Fields">
                <p-table 
                  [value]="field.childFields || []" 
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
                            (click)="dialogAction$.next({ type: 'openChildFieldEdit', field: childField })"
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
      </ng-container>
    </div>
    
    <p-dialog 
      [(visible)]="dialogState().fieldDialogVisible" 
      [header]="dialogState().fieldDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '600px'}"
      (visibleChange)="handleDialogVisibilityChange('field', $event)"
    >
      <app-field-form 
        [field]="dialogState().selectedField"
        [messageId]="(field$ | async)?.messageId ?? null"
        [parentFieldId]="(field$ | async)?.parentFieldId ?? null"
        (formSubmit)="fieldAction$.next({ type: 'updateField', field: $event })"
        (formCancel)="dialogAction$.next({ type: 'closeDialog' })"
      ></app-field-form>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="dialogState().childFieldDialogVisible" 
      [header]="dialogState().childFieldDialogHeader"
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{width: '600px'}"
      (visibleChange)="handleDialogVisibilityChange('childField', $event)"
    >
      <app-field-form 
        [field]="dialogState().selectedChildField"
        [messageId]="null"
        [parentFieldId]="fieldId$ | async"
        (formSubmit)="fieldAction$.next({ type: 'createChildField', field: $event })"
        (formCancel)="dialogAction$.next({ type: 'closeDialog' })"
      ></app-field-form>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="dialogState().enumValueDialogVisible" 
      [header]="dialogState().enumValueDialogHeader"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '500px'}"
      (visibleChange)="handleDialogVisibilityChange('enumValue', $event)"
    >
      <form [formGroup]="enumValueForm" (ngSubmit)="saveEnumValue()" class="p-fluid">
        <div class="field">
          <label for="enumName" class="font-bold">Name</label>
          <input 
            id="enumName" 
            type="text" 
            pInputText 
            formControlName="name"
            required
            [ngClass]="{'ng-invalid ng-dirty': dialogState().enumFormSubmitted && enumValueForm.get('name')?.errors}"
          />
          <small *ngIf="dialogState().enumFormSubmitted && enumValueForm.get('name')?.errors?.['required']" class="p-error">
            Name is required
          </small>
        </div>
        
        <div class="field">
          <label for="enumValue" class="font-bold">Value</label>
          <input 
            id="enumValue" 
            type="text" 
            pInputText 
            formControlName="value"
            required
            [ngClass]="{'ng-invalid ng-dirty': dialogState().enumFormSubmitted && enumValueForm.get('value')?.errors}"
          />
          <small *ngIf="dialogState().enumFormSubmitted && enumValueForm.get('value')?.errors?.['required']" class="p-error">
            Value is required
          </small>
        </div>
        
        <div class="field">
          <label for="enumDescription" class="font-bold">Description</label>
          <input 
            id="enumDescription" 
            type="text" 
            pInputText 
            formControlName="description"
          />
        </div>
        
        <div class="flex justify-content-end gap-2 mt-4">
          <button 
            pButton 
            type="button" 
            label="Cancel" 
            class="p-button-outlined" 
            (click)="dialogAction$.next({ type: 'closeDialog' })"
          ></button>
          <button 
            pButton 
            type="submit" 
            label="Save" 
            [disabled]="enumValueForm.invalid && dialogState().enumFormSubmitted"
          ></button>
        </div>
      </form>
    </p-dialog>
    
    <p-dialog 
      [(visible)]="dialogState().exportDialogVisible"
      header="Exported XML"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '80vw'}"
      (visibleChange)="handleDialogVisibilityChange('export', $event)"
    >
      <div class="p-3 border rounded bg-gray-100 overflow-auto" style="max-height: 70vh">
        <pre>{{ dialogState().exportedXml }}</pre>
      </div>
      <div class="flex justify-content-end mt-4">
        <button 
          pButton 
          type="button" 
          label="Copy" 
          icon="pi pi-copy" 
          (click)="copyToClipboard(dialogState().exportedXml)"
        ></button>
        <button 
          pButton 
          type="button" 
          label="Close" 
          icon="pi pi-times" 
          class="p-button-outlined ml-2" 
          (click)="dialogAction$.next({ type: 'closeDialog' })"
        ></button>
      </div>
    </p-dialog>
  `
})
export class FieldDetailComponent implements OnInit {
  // Stream of field ID from route params
  fieldId$: Observable<string>;
  
  // Main data streams
  field$: Observable<Field | null>;
  breadcrumbs$: Observable<Breadcrumb[]>;
  
  // Dialog state as a signal
  private dialogStateSignal = signal({
    fieldDialogVisible: false,
    fieldDialogHeader: '',
    selectedField: null as Field | null,
    
    childFieldDialogVisible: false,
    childFieldDialogHeader: '',
    selectedChildField: null as Field | null,
    
    enumValueDialogVisible: false,
    enumValueDialogHeader: '',
    enumFormSubmitted: false,
    
    exportDialogVisible: false,
    exportedXml: ''
  });
  
  // Action streams for UI events
  dialogAction$ = new BehaviorSubject<DialogAction>({ type: 'closeDialog' });
  fieldAction$ = new BehaviorSubject<FieldAction>({ type: 'updateField', field: {} as Field });
  
  // Computed value from the dialog state signal
  dialogState = computed(() => this.dialogStateSignal());
  
  // Reactive form for enum values
  enumValueForm: FormGroup;
  
  // Inject services
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store<AppState>);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private signalRService = inject(SignalRService);
  private fb = inject(FormBuilder);

  constructor() {
    // Initialize form
    this.enumValueForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      value: ['', Validators.required],
      description: [''],
      fieldId: ['']
    });
    
    // Setup route param stream
    this.fieldId$ = this.route.params.pipe(
      map(params => params['id'])
    );
    
    // Setup field data stream
    this.field$ = this.setupFieldStream();
    
    // Setup breadcrumbs stream
    this.breadcrumbs$ = this.createBreadcrumbsStream().pipe(
      map(breadcrumbs => breadcrumbs ?? []) // Ensure breadcrumbs is never null
    );
    
    // Setup effects for dialog and field actions
    this.setupDialogActionEffects();
    this.setupFieldActionEffects();
    this.setupSignalREffect();
  }

  ngOnInit() {
    // Nothing needed here - all initialization is done declaratively in constructor
  }

  setupFieldStream(): Observable<Field | null> {
    return this.fieldId$.pipe(
      switchMap(id => {
        // Dispatch action to load field
        this.store.dispatch(loadField({ id }));
        
        // Return selector for the field
        return this.store.select(selectFieldById(id));
      })
    );
  }

  createBreadcrumbsStream(): Observable<Breadcrumb[]> {
    return this.field$.pipe(
      filter(field => !!field),
      switchMap(field => {
        if (!field) return of([{ label: 'Projects', routerLink: ['/projects'] }]);
        
        if (field.messageId) {
          // Field belongs directly to a message
          return this.store.select(state => {
            const message = state.messages.messages.find((m: { id: string }) => m.id === field.messageId);
            if (!message) return null;
            
            const root = state.roots.roots.find((r: { id: string }) => r.id === message.rootId);
            return { message, root };
          }).pipe(
            filter(result => !!result),
            map(result => [
              { label: 'Projects', routerLink: ['/projects'] },
              { label: 'Root', routerLink: ['/roots', result?.root?.id || ''] },
              { label: 'Message', routerLink: ['/messages', result?.message.id || ''] },
              { label: field.name || 'Field' }
            ])
          );
        } else if (field.parentFieldId) {
          // Field belongs to a parent field (complex field)
          return this.store.select(state => {
            const parentField = state.fields.fields.find((f: Field) => f.id === field.parentFieldId);
            return parentField || null;
          }).pipe(
            filter(parentField => !!parentField),
            map(parentField => [
              { label: 'Projects', routerLink: ['/projects'] },
              { label: 'Parent Field', routerLink: ['/fields', parentField?.id || ''] },
              { label: field.name || 'Field' }
            ])
          );
        } else {
          return of([{ label: 'Projects', routerLink: ['/projects'] }]);
        }
      })
    );
  }

  setupDialogActionEffects() {
    this.dialogAction$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(action => {
      switch (action.type) {
        case 'openFieldEdit':
          this.dialogStateSignal.update(state => ({
            ...state,
            selectedField: { ...action.field },
            fieldDialogHeader: 'Edit Field',
            fieldDialogVisible: true
          }));
          break;
          
        case 'openChildFieldCreate':
          this.dialogStateSignal.update(state => ({
            ...state,
            selectedChildField: null,
            childFieldDialogHeader: 'Create Child Field',
            childFieldDialogVisible: true
          }));
          break;
          
        case 'openChildFieldEdit':
          this.dialogStateSignal.update(state => ({
            ...state,
            selectedChildField: { ...action.field },
            childFieldDialogHeader: 'Edit Child Field',
            childFieldDialogVisible: true
          }));
          break;
          
        case 'openEnumValueEdit':
          this.enumValueForm.reset({
            id: action.enumValue.id,
            name: action.enumValue.name,
            value: action.enumValue.value,
            description: action.enumValue.description,
            fieldId: action.enumValue.fieldId
          });
          
          this.dialogStateSignal.update(state => ({
            ...state,
            enumValueDialogHeader: 'Edit Enum Value',
            enumValueDialogVisible: true,
            enumFormSubmitted: false
          }));
          break;
          
        case 'closeDialog':
          this.dialogStateSignal.update(state => ({
            ...state,
            fieldDialogVisible: false,
            childFieldDialogVisible: false,
            enumValueDialogVisible: false,
            exportDialogVisible: false,
            enumFormSubmitted: false
          }));
          break;
      }
    });
  }

  setupFieldActionEffects() {
    this.fieldAction$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(action => {
      switch (action.type) {
        case 'updateField':
          this.store.dispatch(updateField({ field: action.field }));
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field updated successfully' });
          this.dialogAction$.next({ type: 'closeDialog' });
          break;
          
        case 'createChildField':
          this.fieldId$.pipe(
            take(1)
          ).subscribe(id => {
            this.store.dispatch(createField({ 
              field: { 
                ...action.field, 
                parentFieldId: id,
                messageId: null
              } 
            }));
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Child field created successfully' });
            this.dialogAction$.next({ type: 'closeDialog' });
          });
          break;
          
        case 'deleteField':
          this.store.dispatch(deleteField({ id: action.id }));
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Field deleted successfully' });
          break;
          
        case 'updateEnumValue':
          this.store.dispatch(updateEnumValue({ enumValue: action.enumValue }));
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Enum value updated successfully' });
          this.dialogAction$.next({ type: 'closeDialog' });
          break;
          
        case 'deleteEnumValue':
          this.store.dispatch(deleteEnumValue({ id: action.id }));
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Enum value deleted successfully' });
          break;
          
        case 'exportField':
          this.store.dispatch(exportField({ id: action.id }));
          
          this.store.select(state => state.fields.exportedXml).pipe(
            filter(xml => !!xml),
            take(1)
          ).subscribe(xml => {
            if (xml) {
              this.dialogStateSignal.update(state => ({
                ...state,
                exportedXml: xml,
                exportDialogVisible: true
              }));
            }
          });
          break;
      }
    });
  }

  setupSignalREffect() {
    this.field$.pipe(
      filter(field => !!field && !!field.messageId),
      switchMap(field => 
        this.store.select(state => {
          const message = state.messages.messages.find((m: { id: string }) => m.id === field?.messageId);
          if (!message) return null;
          
          const root = state.roots.roots.find((r: { id: string }) => r.id === message.rootId);
          return root ? root.projectId : null;
        })
      ),
      filter(projectId => !!projectId),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(projectId => {
      if (projectId) {
        this.signalRService.joinProject(projectId);
      }
    });
  }

  // Handle dialog visibility changes from the template
  handleDialogVisibilityChange(dialogType: 'field' | 'childField' | 'enumValue' | 'export', visible: boolean) {
    if (!visible) {
      this.dialogAction$.next({ type: 'closeDialog' });
    }
    // Only handling closing dialogs, as opening is done through action streams
  }

  getFieldTypeSeverity(type: FieldType | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    if (!type) return 'info';
    
    const severityMap: Record<FieldType, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      [FieldType.String]: 'info',
      [FieldType.Integer]: 'success',
      [FieldType.Decimal]: 'success',
      [FieldType.Boolean]: 'warn',
      [FieldType.DateTime]: 'info',
      [FieldType.Enum]: 'danger',
      [FieldType.Complex]: 'secondary'
    };
    
    return severityMap[type] || 'info';
  }

  // Confirmation dialogs
  confirmDeleteChildField(childField: Field) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the field "${childField.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.fieldAction$.next({ type: 'deleteField', id: childField.id });
      }
    });
  }

  confirmDeleteEnumValue(enumValue: EnumValue) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the enum value "${enumValue.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.fieldAction$.next({ type: 'deleteEnumValue', id: enumValue.id });
      }
    });
  }

  // Form submission
  saveEnumValue() {
    this.dialogStateSignal.update(state => ({ ...state, enumFormSubmitted: true }));
    
    if (this.enumValueForm.valid) {
      const updatedEnumValue: EnumValue = this.enumValueForm.value;
      this.fieldAction$.next({ type: 'updateEnumValue', enumValue: updatedEnumValue });
    }
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