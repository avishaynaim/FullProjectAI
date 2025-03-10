// Replace your src/app/services/project.service.ts with this
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;
  

  constructor(private http: HttpClient) { 
    console.log('ProjectService initialized with apiUrl:', this.apiUrl);
  }

  getProjects(): Observable<Project[]> {
    console.log(`ProjectService: Making GET request to ${this.apiUrl}`);
    return this.http.get<Project[]>(this.apiUrl).pipe(
      tap(data => console.log('ProjectService: Received response', data)),
      catchError(this.handleError)
    );
  }

  getProject(id: string): Observable<Project> {
    console.log(`ProjectService: Making GET request to ${this.apiUrl}/${id}`);
    return this.http.get<Project>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.log(`ProjectService: Received project ${id}`, data)),
      catchError(this.handleError)
    );
  }

  createProject(project: Project): Observable<Project> {
    console.log(`ProjectService: Making POST request to ${this.apiUrl}`, project);
    return this.http.post<Project>(this.apiUrl, project).pipe(
      tap(data => console.log('ProjectService: Project created', data)),
      catchError(this.handleError)
    );
  }

  updateProject(project: Project): Observable<void> {
    console.log(`ProjectService: Making PUT request to ${this.apiUrl}/${project.id}`, project);
    return this.http.put<void>(`${this.apiUrl}/${project.id}`, project).pipe(
      tap(() => console.log(`ProjectService: Project ${project.id} updated`)),
      catchError(this.handleError)
    );
  }

  deleteProject(id: string): Observable<void> {
    console.log(`ProjectService: Making DELETE request to ${this.apiUrl}/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`ProjectService: Project ${id} deleted`)),
      catchError(this.handleError)
    );
  }

  searchProjects(term: string): Observable<Project[]> {
    console.log(`ProjectService: Making GET request to ${this.apiUrl}/search?term=${term}`);
    return this.http.get<Project[]>(`${this.apiUrl}/search?term=${term}`).pipe(
      tap(data => console.log('ProjectService: Search results', data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server error: ${error.status}, message: ${error.message}`;
      if (error.error) {
        errorMessage += `, details: ${JSON.stringify(error.error)}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}