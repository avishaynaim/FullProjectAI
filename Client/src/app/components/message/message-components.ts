// src/app/components/message/message-form.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <form [formGroup]="messageForm()" (ngSubmit)="onSubmit()" class="p-fluid">
      <div class="field">
        <label for="name" class="font-bold">Name</label>
        <input 
          id="name" 
          type="text" 
          pInputText 
          formControlName="name"
          [ngClass]="{'ng-invalid ng-dirty': submitted() && f()['name'].errors}"
        />
        <small *ngIf="submitted() && f()['name'].errors?.['required']" class="p-error">
          Name is required
        </small>
      </div>
      
      <div class="field">
        <label for="description" class="font-bold">Description</label>
        <textarea 
          id="description" 
          pInputTextarea 
          formControlName="description" 
          rows="3"
        ></textarea>
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
          [disabled]="messageForm().invalid"
        ></button>
      </div>
    </form>
  `
})
export class MessageFormComponent implements OnInit, OnChanges {
  @Input() message: Message | null = null;
  @Input() rootId: string = '';
  @Output() formSubmit = new EventEmitter<Message>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  // Convert to signals
  messageForm = signal<FormGroup>(this.createForm());
  submitted = signal<boolean>(false);

  // Computed property for form controls
  f = computed(() => this.messageForm().controls);

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && changes['message'].currentValue) {
      this.initForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  initForm() {
    const form = this.createForm();
    
    if (this.message) {
      form.patchValue({
        name: this.message.name,
        description: this.message.description
      });
    }
    
    this.messageForm.set(form);
    this.submitted.set(false);
  }

  onSubmit() {
    this.submitted.set(true);
    
    if (this.messageForm().valid) {
      const formData = this.messageForm().value;
      
      const message: Message = {
        id: this.message?.id || '',
        name: formData.name,
        description: formData.description,
        rootId: this.message?.rootId || this.rootId,
        createdDate: this.message?.createdDate || new Date(),
        lastModifiedDate: new Date(),
        fields: this.message?.fields || []
      };
      
      this.formSubmit.emit(message);
      this.submitted.set(false);
    }
  }

  onCancel() {
    this.formCancel.emit();
    this.submitted.set(false);
  }
}