import { CustomersEffects } from './shared/store/customers.effects';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { QuotesEffects } from './shared/store/quotes.effects';
import { quotesFeature } from './shared/store/quotes.store';
import { provideStore } from '@ngrx/store';
import { customersFeature } from './shared/store/customers.store';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      [customersFeature.name]: customersFeature.reducer,
      [quotesFeature.name]: quotesFeature.reducer,
    }),
    provideEffects(CustomersEffects, QuotesEffects),
  ],
};
