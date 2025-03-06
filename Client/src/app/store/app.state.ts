import { RouterReducerState } from '@ngrx/router-store';
import { ProjectState } from './project/project.reducer';
import { RootState } from './root/root.reducer';
import { EnumValueState } from './enum-value/enum-value.reducer';
import { FieldState } from './field/field.reducer';
import { MessageState } from './message/message.reducer';

export interface AppState {
  projects: ProjectState;
  roots: RootState;
  messages: MessageState;
  fields: FieldState;
  enumValues: EnumValueState;
  router: RouterReducerState;
}