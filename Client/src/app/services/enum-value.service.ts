import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnumValue } from '../models/enum-value.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnumValueService {
  private apiUrl = `${environment.apiUrl}/api/enumvalues`;

  constructor(private http: HttpClient) { }

  getEnumValues(): Observable<EnumValue[]> {
    return this.http.get<EnumValue[]>(this.apiUrl);
  }

  getEnumValue(id: string): Observable<EnumValue> {
    return this.http.get<EnumValue>(`${this.apiUrl}/${id}`);
  }

  getEnumValuesByField(fieldId: string): Observable<EnumValue[]> {
    return this.http.get<EnumValue[]>(`${this.apiUrl}/field/${fieldId}`);
  }

  createEnumValue(enumValue: EnumValue): Observable<EnumValue> {
    return this.http.post<EnumValue>(this.apiUrl, enumValue);
  }

  updateEnumValue(enumValue: EnumValue): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${enumValue.id}`, enumValue);
  }

  deleteEnumValue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchEnumValues(term: string): Observable<EnumValue[]> {
    return this.http.get<EnumValue[]>(`${this.apiUrl}/search?term=${term}`);
  }
}