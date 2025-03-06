import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from '../../../models/breadcrumb.model';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbModule],
  template: `
    <p-breadcrumb 
      [model]="items" 
      [home]="home" 
      styleClass="border-0 p-0 bg-transparent"
    ></p-breadcrumb>
  `,
  styles: [`
    :host ::ng-deep .p-breadcrumb {
      background-color: transparent;
      border: none;
      padding: 0;
      margin-bottom: 1rem;
    }
    
    :host ::ng-deep .p-breadcrumb .p-menuitem-link {
      font-weight: 500;
    }
    
    :host ::ng-deep .p-breadcrumb .p-menuitem-link:hover {
      text-decoration: underline;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() set breadcrumbs(value: Breadcrumb[]) {
    this.items = value.map(breadcrumb => ({
      label: breadcrumb.label,
      routerLink: breadcrumb.routerLink,
      queryParams: breadcrumb.queryParams
    }));
  }

  items: MenuItem[] = [];
  
  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/projects'
  };
}