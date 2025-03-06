import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as ProjectActions from '../../store/project/project.actions';
import { selectAllProjects } from '../../store/project/project.selectors';
import { Project } from '../project/project.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ButtonModule
  ],
  template: `
    <div class="flex justify-content-center align-items-center min-h-screen bg-blue-50">
      <p-card header="Login to System" styleClass="w-full max-w-md shadow-lg">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <div class="field">
            <label for="username" class="block font-medium mb-2">Username</label>
            <input 
              id="username" 
              type="text" 
              pInputText 
              formControlName="username" 
              class="w-full" 
              placeholder="Enter your username"
            />
            <small 
              *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
              class="p-error"
            >
              Username is required
            </small>
          </div>
          
          <div class="field">
            <label for="password" class="block font-medium mb-2">Password</label>
            <p-password 
              id="password" 
              formControlName="password"
              [feedback]="false" 
              [toggleMask]="true"
              styleClass="w-full" 
              placeholder="Enter your password"
            ></p-password>
            <small 
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              class="p-error"
            >
              Password is required
            </small>
          </div>
          
          <div class="field">
            <label for="project" class="block font-medium mb-2">Select Project</label>
            <p-select 
              id="project" 
              formControlName="project" 
              [options]="projects" 
              optionLabel="name" 
              placeholder="Select a project" 
              [showClear]="true"
              styleClass="w-full"
            ></p-select>
            <small 
              *ngIf="loginForm.get('project')?.invalid && loginForm.get('project')?.touched"
              class="p-error"
            >
              Project is required
            </small>
          </div>
          
          <div class="flex justify-content-end">
            <button 
              pButton 
              type="submit" 
              label="Login" 
              icon="pi pi-sign-in" 
              [disabled]="loginForm.invalid"
              class="w-auto"
            ></button>
          </div>
        </form>
      </p-card>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  projects: Project[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.loginForm = this.fb.group({ username: ['', Validators.required], password: ['', Validators.required], project: [null, Validators.required] });
  }

  ngOnInit() {
    // Load projects for dropdown
    this.store.dispatch(ProjectActions.loadProjects());

    this.store.select(selectAllProjects).subscribe(projects => {
      this.projects = projects;
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const selectedProject = this.loginForm.get('project')?.value;

      if (selectedProject) {
        // In a real app, you would authenticate the user here
        // For this demo, we'll just navigate to the selected project
        this.router.navigate(['/projects', selectedProject.id]);
      }
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}