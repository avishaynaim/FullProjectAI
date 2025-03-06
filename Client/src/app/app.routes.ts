import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./components/project/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./components/project/project-detail.component').then(m => m.ProjectDetailComponent)
  },
  {
    path: 'roots/:id',
    loadComponent: () => import('./components/root/root-detail.component').then(m => m.RootDetailComponent)
  },
  {
    path: 'messages/:id',
    loadComponent: () => import('./components/message/message-detail.component').then(m => m.MessageDetailComponent)
  },
  {
    path: 'fields/:id',
    loadComponent: () => import('./components/field/field-detail.component').then(m => m.FieldDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'projects'
  }
];