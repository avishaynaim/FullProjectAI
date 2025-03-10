import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Root } from '../models/root.model';
import { Message } from '../models/message.model';
import { Field } from '../models/field.model';
import { EnumValue } from '../models/enum-value.model';
import { Project } from '../models/project.model';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: HubConnection;
  private connectionEstablished = new BehaviorSubject<boolean>(false);
  public connectionEstablished$ = this.connectionEstablished.asObservable();

  private projectUpdated = new BehaviorSubject<Project | null>(null);
  private rootUpdated = new BehaviorSubject<Root | null>(null);
  private messageUpdated = new BehaviorSubject<Message | null>(null);
  private fieldUpdated = new BehaviorSubject<Field | null>(null);
  private enumValueUpdated = new BehaviorSubject<EnumValue | null>(null);

  private projectDeleted = new BehaviorSubject<string | null>(null);
  private rootDeleted = new BehaviorSubject<string | null>(null);
  private messageDeleted = new BehaviorSubject<string | null>(null);
  private fieldDeleted = new BehaviorSubject<string | null>(null);
  private enumValueDeleted = new BehaviorSubject<string | null>(null);

  public projectUpdated$ = this.projectUpdated.asObservable();
  public rootUpdated$ = this.rootUpdated.asObservable();
  public messageUpdated$ = this.messageUpdated.asObservable();
  public fieldUpdated$ = this.fieldUpdated.asObservable();
  public enumValueUpdated$ = this.enumValueUpdated.asObservable();

  public projectDeleted$ = this.projectDeleted.asObservable();
  public rootDeleted$ = this.rootDeleted.asObservable();
  public messageDeleted$ = this.messageDeleted.asObservable();
  public fieldDeleted$ = this.fieldDeleted.asObservable();
  public enumValueDeleted$ = this.enumValueDeleted.asObservable();

  constructor() {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/treeview`)
      .withAutomaticReconnect()
      .build();
  }

  private startConnection() {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      return;
    }

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection established');
        this.connectionEstablished.next(true);
      })
      .catch(err => {
        console.error('Error while establishing SignalR connection:', err);
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  private registerOnServerEvents() {
    this.hubConnection.on('ProjectUpdated', (project: Project) => {
      this.projectUpdated.next(project);
    });

    this.hubConnection.on('RootUpdated', (root: Root) => {
      this.rootUpdated.next(root);
    });

    this.hubConnection.on('MessageUpdated', (message: Message) => {
      this.messageUpdated.next(message);
    });

    this.hubConnection.on('FieldUpdated', (field: Field) => {
      this.fieldUpdated.next(field);
    });

    this.hubConnection.on('EnumValueUpdated', (enumValue: EnumValue) => {
      this.enumValueUpdated.next(enumValue);
    });

    this.hubConnection.on('ProjectDeleted', (id: string) => {
      this.projectDeleted.next(id);
    });

    this.hubConnection.on('RootDeleted', (id: string) => {
      this.rootDeleted.next(id);
    });

    this.hubConnection.on('MessageDeleted', (id: string) => {
      this.messageDeleted.next(id);
    });

    this.hubConnection.on('FieldDeleted', (id: string) => {
      this.fieldDeleted.next(id);
    });

    this.hubConnection.on('EnumValueDeleted', (id: string) => {
      this.enumValueDeleted.next(id);
    });
  }

  public joinProject(projectId: string) {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinProject', projectId);
    }
  }

  public leaveProject(projectId: string) {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.invoke('LeaveProject', projectId);
    }
  }
}