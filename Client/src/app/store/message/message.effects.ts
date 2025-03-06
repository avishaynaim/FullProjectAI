import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { MessageService } from '../../services/message.service';
import * as MessageActions from './message.actions';

@Injectable()
export class MessageEffects {
  loadMessages$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.loadMessages),
    switchMap(() => this.messageService.getMessages().pipe(
      map(messages => MessageActions.loadMessagesSuccess({ messages })),
      catchError(error => of(MessageActions.loadMessagesFailure({ error })))
    ))
  ));

  loadMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.loadMessage),
    switchMap(({ id }) => this.messageService.getMessage(id).pipe(
      map(message => MessageActions.loadMessageSuccess({ message })),
      catchError(error => of(MessageActions.loadMessageFailure({ error })))
    ))
  ));

  loadMessagesByRoot$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.loadMessagesByRoot),
    switchMap(({ rootId }) => this.messageService.getMessagesByRoot(rootId).pipe(
      map(messages => MessageActions.loadMessagesByRootSuccess({ messages })),
      catchError(error => of(MessageActions.loadMessagesByRootFailure({ error })))
    ))
  ));

  createMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.createMessage),
    mergeMap(({ message }) => this.messageService.createMessage(message).pipe(
      map(createdMessage => MessageActions.createMessageSuccess({ message: createdMessage })),
      catchError(error => of(MessageActions.createMessageFailure({ error })))
    ))
  ));

  updateMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.updateMessage),
    mergeMap(({ message }) => this.messageService.updateMessage(message).pipe(
      map(() => MessageActions.updateMessageSuccess({ message })),
      catchError(error => of(MessageActions.updateMessageFailure({ error })))
    ))
  ));

  deleteMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.deleteMessage),
    mergeMap(({ id }) => this.messageService.deleteMessage(id).pipe(
      map(() => MessageActions.deleteMessageSuccess({ id })),
      catchError(error => of(MessageActions.deleteMessageFailure({ error })))
    ))
  ));

  searchMessages$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.searchMessages),
    switchMap(({ term }) => this.messageService.searchMessages(term).pipe(
      map(messages => MessageActions.searchMessagesSuccess({ messages })),
      catchError(error => of(MessageActions.searchMessagesFailure({ error })))
    ))
  ));

  exportMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(MessageActions.exportMessage),
    switchMap(({ id }) => this.messageService.exportMessage(id).pipe(
      map(xml => MessageActions.exportMessageSuccess({ xml })),
      catchError(error => of(MessageActions.exportMessageFailure({ error })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private messageService: MessageService
  ) {}
}