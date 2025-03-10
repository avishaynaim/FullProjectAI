// src/app/components/field/field-form.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
// import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Store } from '@ngrx/store';
import { Field, FieldType } from '../../models/field.model';
import { EnumValue } from '../../models/enum-value.model';
import { AppState } from '../../store/app.state';
import { deleteEnumValue } from '../../store/enum-value/enum-value.actions';

@Component({
  selector: 'app-field-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    // InputTextareaModule,
    DropdownModule,
    CheckboxModule,
    ButtonModule,
    TableModule
  ],
  template: `
    <form [formGroup]="fieldForm" (ngSubmit)="onSubmit()" class="p-fluid">
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="name" class="font-bold">Name</label>
            <input 
              id="name" 
              type="text" 
              pInputText 
              formControlName="name"
              [ngClass]="{'ng-invalid ng-dirty': submitted && f['name'].errors}"
            />
            <small *ngIf="submitted && f['name'].errors?.['required']" class="p-error">
              Name is required
            </small>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="type" class="font-bold">Type</label>
            <p-dropdown 
              id="type" 
              formControlName="type" 
              [options]="fieldTypes" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Select a type"
              [ngClass]="{'ng-invalid ng-dirty': submitted && f['type'].errors}"
            ></p-dropdown>
            <small *ngIf="submitted && f['type'].errors?.['required']" class="p-error">
              Type is required
            </small>
          </div>
        </div>
        
        <div class="col-12">
          <div class="field">
            <label for="description" class="font-bold">Description</label>
            <textarea 
              id="description" 
              pInputTextarea 
              formControlName="description" 
              rows="2"
            ></textarea>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="defaultValue" class="font-bold">Default Value</label>
            <input 
              id="defaultValue" 
              type="text" 
              pInputText 
              formControlName="defaultValue"
            />
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="field-checkbox mt-4">
            <p-checkbox 
              formControlName="isRequired" 
              [binary]="true" 
              inputId="isRequired"
            ></p-checkbox>
            <label for="isRequired" class="ml-2">Required Field</label>
          </div>
        </div>
      </div>
      
      <!-- Enum Values Section (only visible for Enum type) -->
      <div class="field" *ngIf="f['type'].value === 'Enum'">
        <div class="flex justify-content-between align-items-center mb-2">
          <label class="font-bold">Enum Values</label>
          <button 
            pButton 
            type="button" 
            icon="pi pi-plus" 
            label="Add Value" 
            class="p-button-sm" 
            (click)="addEnumValue()"
          ></button>
        </div>
        
        <div formArrayName="enumValues">
          <p-table [value]="enumValuesControls.controls" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Description</th>
                <th style="width: 80px"></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-control let-i="rowIndex">
              <tr [formGroupName]="i">
                <td>
                  <input 
                    type="text" 
                    pInputText 
                    formControlName="name" 
                    placeholder="Name"
                    class="w-full"
                    [ngClass]="{'ng-invalid ng-dirty': submitted && control.get('name')?.errors}"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    pInputText 
                    formControlName="value" 
                    placeholder="Value"
                    class="w-full"
                    [ngClass]="{'ng-invalid ng-dirty': submitted && control.get('value')?.errors}"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    pInputText 
                    formControlName="description" 
                    placeholder="Description"
                    class="w-full"
                  />
                </td>
                <td>
                  <button 
                    pButton 
                    type="button" 
                    icon="pi pi-trash" 
                    class="p-button-danger p-button-sm" 
                    (click)="removeEnumValue(i)"
                  ></button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center p-4">
                  No enum values defined. Click "Add Value" to add one.
                </td>
              </tr>
            </ng-template>
          </p-table>
          
          <small *ngIf="submitted && (!enumValuesControls.controls.length && f['type'].value === 'Enum')" class="p-error block mt-2">
            At least one enum value is required
          </small>
        </div>
      </div>
      
      <div class="flex justify-content-end gap-2 mt-4">
        <button 
          pButton 
          type="button" 
          label="Cancel" 
          class="p-button-outlined" 
          (click)="onCancel()"
        ></button>
        <button 
          pButton 
          type="submit" 
          label="Save" 
          [disabled]="fieldForm.invalid"
        ></button>
      </div>
    </form>
  `
})
export class FieldFormComponent implements OnInit, OnChanges {
  @Input() field: Field | null = null;
  @Input() messageId: string | null = null;
  @Input() parentFieldId: string | null = null;
  @Output() formSubmit = new EventEmitter<Field>();
  @Output() formCancel = new EventEmitter<void>();

  fieldForm: FormGroup;
  submitted = false;
  
  fieldTypes = [
    { label: 'String', value: FieldType.String },
    { label: 'Integer', value: FieldType.Integer },
    { label: 'Decimal', value: FieldType.Decimal },
    { label: 'Boolean', value: FieldType.Boolean },
    { label: 'DateTime', value: FieldType.DateTime },
    { label: 'Enum', value: FieldType.Enum },
    { label: 'Complex', value: FieldType.Complex }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.fieldForm = this.createFieldForm();
  }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['field']) {
      this.initForm();
    }
  }

  get f() {
    return this.fieldForm.controls;
  }

  get enumValuesControls() {
    return this.fieldForm.get('enumValues') as FormArray;
  }

  createFieldForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: [FieldType.String, Validators.required],
      defaultValue: [''],
      isRequired: [false],
      enumValues: this.fb.array([])
    });
  }

  initForm() {
    if (this.field) {
      this.fieldForm.patchValue({
        name: this.field.name,
        description: this.field.description,
        type: this.field.type,
        defaultValue: this.field.defaultValue || '',
        isRequired: this.field.isRequired
      });
      
      // Clear existing enum values
      while (this.enumValuesControls.length) {
        this.enumValuesControls.removeAt(0);
      }
      
      // Add enum values if field is of type Enum
      if (this.field.type === FieldType.Enum && this.field.enumValues?.length) {
        this.field.enumValues.forEach(enumValue => {
          this.enumValuesControls.push(this.createEnumValueFormGroup(enumValue));
        });
      }
    } else {
      this.fieldForm.reset({
        type: FieldType.String,
        isRequired: false
      });
      
      // Clear enum values
      while (this.enumValuesControls.length) {
        this.enumValuesControls.removeAt(0);
      }
    }
    
    this.submitted = false;
  }

  createEnumValueFormGroup(enumValue: EnumValue | null = null): FormGroup {
    return this.fb.group({
      id: [enumValue?.id || ''],
      name: [enumValue?.name || '', Validators.required],
      value: [enumValue?.value || '', Validators.required],
      description: [enumValue?.description || ''],
      fieldId: [enumValue?.fieldId || '']
    });
  }

  addEnumValue() {
    this.enumValuesControls.push(this.createEnumValueFormGroup());
  }

  removeEnumValue(index: number) {
    const enumValue = this.enumValuesControls.at(index).value;
    
    // If the enum value has an ID, it exists in the database and should be deleted
    if (enumValue.id) {
      this.store.dispatch(deleteEnumValue({ id: enumValue.id }));
    }
    
    this.enumValuesControls.removeAt(index);
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.fieldForm.valid) {
      // If field type is Enum, make sure there's at least one enum value
      if (this.fieldForm.value.type === FieldType.Enum && this.enumValuesControls.length === 0) {
        return;
      }
      
      const formData = this.fieldForm.value;
      
      const field: Field = {
        id: this.field?.id || '',
        name: formData.name,
        description: formData.description,
        type: formData.type,
        defaultValue: formData.defaultValue,
        isRequired: formData.isRequired,
        messageId: this.field?.messageId || this.messageId || null,
        parentFieldId: this.field?.parentFieldId || this.parentFieldId || null,
        createdDate: this.field?.createdDate || new Date(),
        lastModifiedDate: new Date(),
        childFields: this.field?.childFields || [],
        enumValues: formData.enumValues.map((ev: any) => ({
          ...ev,
          fieldId: this.field?.id || ''
        }))
      };
      
      this.formSubmit.emit(field);
      this.submitted = false;
    }
  }

  onCancel() {
    this.formCancel.emit();
    this.submitted = false;
  }
}

