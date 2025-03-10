import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { MessageService } from '../../services/message.service';
import { loadMessages, loadMessagesSuccess, loadMessagesFailure, loadMessage, loadMessageSuccess, loadMessageFailure, loadMessagesByRoot, loadMessagesByRootSuccess, loadMessagesByRootFailure, createMessage, createMessageSuccess, createMessageFailure, updateMessage, updateMessageSuccess, updateMessageFailure, deleteMessage, deleteMessageSuccess, deleteMessageFailure, searchMessages, searchMessagesSuccess, searchMessagesFailure, exportMessage, exportMessageSuccess, exportMessageFailure } from './message.actions';

@Injectable()
export class MessageEffects {
  constructor(  ) {}
    private actions$ = inject(Actions);
    private messageService = inject(MessageService);
  loadMessages$ = createEffect(() => this.actions$?.pipe(
    ofType(loadMessages),
    switchMap(() => this.messageService.getMessages().pipe(
      map(messages => loadMessagesSuccess({ messages })),
      catchError(error => of(loadMessagesFailure({ error })))
    ))
  ));

  loadMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(loadMessage),
    switchMap(({ id }) => this.messageService.getMessage(id).pipe(
      map(message => loadMessageSuccess({ message })),
      catchError(error => of(loadMessageFailure({ error })))
    ))
  ));

  loadMessagesByRoot$ = createEffect(() => this.actions$?.pipe(
    ofType(loadMessagesByRoot),
    switchMap(({ rootId }) => this.messageService.getMessagesByRoot(rootId).pipe(
      map(messages => loadMessagesByRootSuccess({ messages })),
      catchError(error => of(loadMessagesByRootFailure({ error })))
    ))
  ));

  createMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(createMessage),
    mergeMap(({ message }) => this.messageService.createMessage(message).pipe(
      map(createdMessage => createMessageSuccess({ message: createdMessage })),
      catchError(error => of(createMessageFailure({ error })))
    ))
  ));

  updateMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(updateMessage),
    mergeMap(({ message }) => this.messageService.updateMessage(message).pipe(
      map(() => updateMessageSuccess({ message })),
      catchError(error => of(updateMessageFailure({ error })))
    ))
  ));

  deleteMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(deleteMessage),
    mergeMap(({ id }) => this.messageService.deleteMessage(id).pipe(
      map(() => deleteMessageSuccess({ id })),
      catchError(error => of(deleteMessageFailure({ error })))
    ))
  ));

  searchMessages$ = createEffect(() => this.actions$?.pipe(
    ofType(searchMessages),
    switchMap(({ term }) => this.messageService.searchMessages(term).pipe(
      map(messages => searchMessagesSuccess({ messages })),
      catchError(error => of(searchMessagesFailure({ error })))
    ))
  ));

  exportMessage$ = createEffect(() => this.actions$?.pipe(
    ofType(exportMessage),
    switchMap(({ id }) => this.messageService.exportMessage(id).pipe(
      map(xml => exportMessageSuccess({ xml })),
      catchError(error => of(exportMessageFailure({ error })))
    ))
  ));


}