import { provideHttpClient } from '@angular/common/http';
import { CustomersEffects } from './shared/store/customers.effects';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { QuotesEffects } from './shared/store/quotes.effects';
import { quotesFeature } from './shared/store/quotes.store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { customersFeature } from './shared/store/customers.store';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      [customersFeature.name]: customersFeature.reducer,
      [quotesFeature.name]: quotesFeature.reducer,
    }),
    provideStoreDevtools({ maxAge: 25 }),
    provideEffects(CustomersEffects, QuotesEffects),
  ],
};
