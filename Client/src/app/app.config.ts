import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEffects } from '@ngrx/effects';
import { routerReducer, provideRouterStore } from '@ngrx/router-store';
import { provideStore, provideState } from '@ngrx/store';
import { EnumValueEffects } from './store/enum-value/enum-value.effects';
import { enumValueReducer } from './store/enum-value/enum-value.reducer';
import { FieldEffects } from './store/field/field.effects';
import { fieldReducer } from './store/field/field.reducer';
import { MessageEffects } from './store/message/message.effects';
import { messageReducer } from './store/message/message.reducer';
import { ProjectEffects } from './store/project/project.effects';
import { projectReducer } from './store/project/project.reducer';
import { RootEffects } from './store/root/root.effects';
import { rootReducer } from './store/root/root.reducer';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { RootService } from './services/root.service';
import { EnumValueService } from './services/enum-value.service';
import { FieldService } from './services/field.service';
import { ProjectService } from './services/project.service';
import { ManualEffectsService } from './services/ManualEffectsService';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';



export const appConfig: ApplicationConfig = {
  providers: [
    // Services
    RootService,
    EnumValueService,
    FieldService,
    MessageService,
    ProjectService,
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideStore(),
    provideEffects([ProjectEffects, RootEffects,  MessageEffects, FieldEffects, EnumValueEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true
    }),
    providePrimeNG({ ripple: true })
    // provideStore({ router: routerReducer }),
    // provideRouterStore(),
    ,provideState('projects', projectReducer),
    provideState('roots', rootReducer),
    provideState('messages', messageReducer),
    provideState('fields', fieldReducer),
    provideState('enumValues', enumValueReducer),
  ]
};
