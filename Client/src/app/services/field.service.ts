import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Field } from '../models/field.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private apiUrl = `${environment.apiUrl}/api/fields`;

  constructor(private http: HttpClient) { }

  getFields(): Observable<Field[]> {
    return this.http.get<Field[]>(this.apiUrl);
  }

  getField(id: string): Observable<Field> {
    return this.http.get<Field>(`${this.apiUrl}/${id}`);
  }

  getFieldsByMessage(messageId: string): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.apiUrl}/message/${messageId}`);
  }

  getFieldsByParent(parentFieldId: string): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.apiUrl}/parent/${parentFieldId}`);
  }

  createField(field: Field): Observable<Field> {
    return this.http.post<Field>(this.apiUrl, field);
  }

  updateField(field: Field): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${field.id}`, field);
  }

  deleteField(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchFields(term: string): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.apiUrl}/search?term=${term}`);
  }

  exportField(id: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/export`);
  }
}