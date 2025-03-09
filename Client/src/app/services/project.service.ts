import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../components/project/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;
  

  constructor(private http: HttpClient) { }

  // In ProjectService
getProjects(): Observable<Project[]> {
  console.log(`ProjectService: Making HTTP request to ${this.apiUrl}`);
  return this.http.get<Project[]>(this.apiUrl).pipe(
    tap(data => console.log('ProjectService: Received response', data)),
    catchError(error => {
      console.error('ProjectService: HTTP error', error);
      throw error;
    })
  );
}

  // getProjects(): Observable<Project[]> {
  //   return this.http.get<Project[]>(this.apiUrl);
  // }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(project: Project): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${project.id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchProjects(term: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search?term=${term}`);
  }
}