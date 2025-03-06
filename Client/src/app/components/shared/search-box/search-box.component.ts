import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  template: `
    <div class="p-inputgroup">
      <input 
        type="text" 
        pInputText 
        [(ngModel)]="searchTerm" 
        (ngModelChange)="onSearchTermChange($event)"
        placeholder="Search by name, description, etc."
        class="w-full"
      />
      <button 
        type="button" 
        pButton 
        icon="pi pi-search" 
        (click)="onSearch()"
      ></button>
      <button 
        *ngIf="searchTerm" 
        type="button" 
        pButton 
        icon="pi pi-times" 
        class="p-button-danger" 
        (click)="onClear()"
      ></button>
    </div>
  `
})
export class SearchBoxComponent {
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  
  searchTerm: string = '';
  private searchTerms = new Subject<string>();
  
  constructor() {
    this.searchTerms.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.search.emit(term);
    });
  }
  
  onSearchTermChange(term: string) {
    this.searchTerms.next(term);
  }
  
  onSearch() {
    this.search.emit(this.searchTerm);
  }
  
  onClear() {
    this.searchTerm = '';
    this.clear.emit();
  }
}