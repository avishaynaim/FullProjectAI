import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/api/messages`;

  constructor(private http: HttpClient) { }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }

  getMessage(id: string): Observable<Message> {
    return this.http.get<Message>(`${this.apiUrl}/${id}`);
  }

  getMessagesByRoot(rootId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/root/${rootId}`);
  }

  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  updateMessage(message: Message): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${message.id}`, message);
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchMessages(term: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/search?term=${term}`);
  }

  exportMessage(id: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/${id}/export`);
  }
}