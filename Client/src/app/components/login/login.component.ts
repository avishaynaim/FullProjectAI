import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectAllProjects } from '../../store/project/project.selectors';
import { Project } from '../../models/project.model';
import { loadProjects } from '../../store/project/project.actions';
import { trigger, transition, style, animate } from '@angular/animations';

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
    DropdownModule,
    ButtonModule,
    RippleModule,
    CheckboxModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-out', style({ opacity: 1 }))
      ])
    ])
  ],
  template: `
    <div class="login-container">
      <!-- Animated dots background -->
      <div class="animated-background">
        <div class="dot dot1"></div>
        <div class="dot dot2"></div>
        <div class="dot dot3"></div>
        <div class="dot dot4"></div>
        <div class="dot dot5"></div>
      </div>
      
      <div class="login-card-container" @fadeIn>
        <div class="login-header">
          <h1 class="login-title">Login to Dashboard</h1>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form-container">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="p-input-icon-left">
              <i class="pi pi-user"></i>
              <input 
                id="username" 
                type="text" 
                pInputText 
                formControlName="username"
                class="w-full" 
                placeholder="Enter your username"
              />
            </div>
            <small 
              *ngIf="f['username'].invalid && f['username'].touched"
              class="error-message"
            >
              Username is required
            </small>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="p-input-icon-left w-full">
              <i class="pi pi-lock"></i>
              <p-password 
                id="password" 
                formControlName="password"
                [feedback]="false" 
                [toggleMask]="true"
                styleClass="w-full" 
                inputStyleClass="w-full"
                placeholder="Enter your password"
              ></p-password>
            </div>
            <small 
              *ngIf="f['password'].invalid && f['password'].touched"
              class="error-message"
            >
              Password is required
            </small>
          </div>
          
          <div class="form-group">
            <label for="project">Select Project</label>
            <p-dropdown 
              id="project" 
              formControlName="project" 
              [options]="projects" 
              optionLabel="name" 
              placeholder="Choose a project" 
              [showClear]="true"
              styleClass="w-full dropdown-style"
              [filter]="true"
              filterBy="name"
            ></p-dropdown>
            <small 
              *ngIf="f['project'].invalid && f['project'].touched"
              class="error-message"
            >
              Project selection is required
            </small>
          </div>
          
          <div class="remember-forgot">
            <div class="remember-me">
              <p-checkbox 
                [binary]="true" 
                formControlName="rememberMe"
                inputId="rememberMe"
              ></p-checkbox>
              <label for="rememberMe">Remember me</label>
            </div>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            pButton 
            pRipple 
            type="submit" 
            label="Login" 
            icon="pi pi-sign-in" 
            class="login-button p-button-raised"
          ></button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #151c2c;
      position: relative;
      overflow: hidden;
    }

    /* Animated background dots */
    .animated-background {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
    }

    .dot {
      position: absolute;
      border-radius: 50%;
      opacity: 0.4;
      filter: blur(4px);
      animation: float 15s infinite ease-in-out;
    }

    .dot1 {
      width: 12px;
      height: 12px;
      background-color: #ff7849;
      left: 10%;
      top: 30%;
      animation-delay: 0s;
    }

    .dot2 {
      width: 16px;
      height: 16px;
      background-color: #4c9aff;
      left: 20%;
      top: 80%;
      animation-delay: 2s;
    }

    .dot3 {
      width: 10px;
      height: 10px;
      background-color: #8c5cff;
      right: 15%;
      top: 20%;
      animation-delay: 4s;
    }

    .dot4 {
      width: 14px;
      height: 14px;
      background-color: #19b8ff;
      right: 25%;
      top: 70%;
      animation-delay: 1s;
    }

    .dot5 {
      width: 8px;
      height: 8px;
      background-color: #ff5db1;
      left: 50%;
      top: 15%;
      animation-delay: 3s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) translateX(0);
      }
      25% {
        transform: translateY(-30px) translateX(15px);
      }
      50% {
        transform: translateY(-15px) translateX(-15px);
      }
      75% {
        transform: translateY(30px) translateX(10px);
      }
    }

    /* Login card */
    .login-card-container {
      background-color: #1a2035;
      border-radius: 12px;
      width: 100%;
      max-width: 400px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10;
      position: relative;
    }

    .login-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .login-title {
      color: #61a9ff;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .login-form-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      color: #b9c1d9;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    :host ::ng-deep .p-inputtext {
      background-color: #252e47;
      color: #e0e6ed;
      border: 1px solid #323c52;
      border-radius: 6px;
      padding: 12px 12px 12px 36px;
      transition: all 0.3s ease;
    }

    :host ::ng-deep .p-inputtext:focus,
    :host ::ng-deep .p-inputtext:hover {
      border-color: #6199ff;
      box-shadow: 0 0 0 1px #6199ff33;
    }

    :host ::ng-deep .p-inputtext::placeholder {
      color: #5d6a87;
    }

    :host ::ng-deep .p-password-input {
      width: 100%;
    }

    :host ::ng-deep .p-dropdown {
      background-color: #252e47;
      border: 1px solid #323c52;
      border-radius: 6px;
    }

    :host ::ng-deep .p-dropdown:hover,
    :host ::ng-deep .p-dropdown:focus {
      border-color: #6199ff;
      box-shadow: 0 0 0 1px #6199ff33;
    }

    :host ::ng-deep .p-dropdown .p-dropdown-label {
      color: #e0e6ed;
      padding: 12px;
    }

    :host ::ng-deep .p-dropdown-panel {
      background-color: #252e47;
      border: 1px solid #323c52;
    }

    :host ::ng-deep .p-dropdown-items {
      padding: 0;
    }

    :host ::ng-deep .p-dropdown-item {
      color: #e0e6ed;
      padding: 10px 12px;
    }

    :host ::ng-deep .p-dropdown-item:hover {
      background-color: #2d3754;
    }

    .remember-forgot {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #b9c1d9;
      font-size: 14px;
    }

    .forgot-password {
      color: #61a9ff;
      font-size: 14px;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .forgot-password:hover {
      color: #8bc1ff;
      text-decoration: underline;
    }

    .login-button {
      background: linear-gradient(to right, #3d6def, #6878ff);
      border: none;
      border-radius: 6px;
      height: 44px;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .login-button:hover {
      background: linear-gradient(to right, #345fd8, #5868e6);
      box-shadow: 0 6px 15px rgba(61, 109, 239, 0.3);
      transform: translateY(-2px);
    }

    .error-message {
      color: #ff5f5f;
      font-size: 12px;
      margin-top: 4px;
    }

    .p-input-icon-left {
      width: 100%;
    }

    .p-input-icon-left i {
      left: 12px;
      color: #5d6a87;
    }

    :host ::ng-deep .p-checkbox .p-checkbox-box {
      background-color: #252e47;
      border-color: #323c52;
    }

    :host ::ng-deep .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
      border-color: #6199ff;
    }

    :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight {
      background-color: #6199ff;
      border-color: #6199ff;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .login-card-container {
        padding: 20px;
        max-width: 320px;
      }

      .login-form-container {
        gap: 18px;
      }

      .remember-forgot {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  projects: Project[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      project: [null, Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Load projects for dropdown
    this.store.dispatch(loadProjects());

    this.store.select(selectAllProjects).subscribe(projects => {
      this.projects = projects;
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    if (this.loginForm.valid) {
      const selectedProject = this.loginForm.get('project')?.value;

      if (selectedProject) {
        // Navigate to the selected project
        this.router.navigate(['/projects', selectedProject.id]);
      }
    }
  }
}