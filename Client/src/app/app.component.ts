import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SignalRService } from './services/signalr.service';
import { AppState } from './store/app.state';
import * as ProjectActions from './store/project/project.actions';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="min-h-screen bg-gray-100">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
      
      <div class="container mx-auto px-4 py-8">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  constructor(
    private signalRService: SignalRService,
    private store: Store<AppState>,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // this.primengConfig.ripple = true;
    
    // Subscribe to SignalR updates
    this.signalRService.projectUpdated$.subscribe(project => {
      if (project) {
        this.store.dispatch(ProjectActions.projectUpdatedFromSignalR({ project }));
        this.messageService.add({
          severity: 'info',
          summary: 'Project Updated',
          detail: `Project "${project.name}" has been updated by another user.`
        });
      }
    });
    
    // Add similar subscriptions for other entities
  }
}