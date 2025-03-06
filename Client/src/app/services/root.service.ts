import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Root } from '../models/root.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RootService {
  private apiUrl = `${environment.apiUrl}/api/roots`;

  constructor(private http: HttpClient) { }

  getRoots(): Observable<Root[]> {
    return this.http.get<Root[]>(this.apiUrl);
  }

  getRoot(id: string): Observable<Root> {
    return this.http.get<Root>(`${this.apiUrl}/${id}`);
  }

  getRootsByProject(projectId: string): Observable<Root[]> {
    return this.http.get<Root[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createRoot(root: Root): Observable<Root> {
    return this.http.post<Root>(this.apiUrl, root);
  }

  updateRoot(root: Root): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${root.id}`, root);
  }

  deleteRoot(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchRoots(term: string): Observable<Root[]> {
    return this.http.get<Root[]>(`${this.apiUrl}/search?term=${term}`);
  }

  exportRoot(id: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/export`);
  }

  exportAllRoots(projectId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/export-all/${projectId}`);
  }
}