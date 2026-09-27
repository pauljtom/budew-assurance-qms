import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, of } from 'rxjs';
import { QuotesService } from '../services/quotes.service';
import { quotesActions } from './quotes.store';

@Injectable()
export class QuotesEffects {
  private actions = inject(Actions);
  private service = inject(QuotesService);

  load = createEffect(() =>
    this.actions.pipe(
      ofType(quotesActions.load),
      concatMap(() =>
        this.service.load().pipe(
          map((quotes) => quotesActions.loadSuccess({ quotes })),
          catchError((error: Error) => of(quotesActions.failure({ error: error.message }))),
        ),
      ),
    ),
  );

  mutate = createEffect(() =>
    this.actions.pipe(
      ofType(quotesActions.create, quotesActions.update, quotesActions.delete),
      concatMap((action) => {
        const request =
          action.type === quotesActions.create.type
            ? this.service.create(action.quote)
            : action.type === quotesActions.update.type
              ? this.service.update(action.quote)
              : this.service.delete(action.quoteID);
        const quoteID = 'quote' in action ? action.quote.quoteID : action.quoteID;
        return request.pipe(
          map((quotes) => quotesActions.mutationSuccess({ quotes, quoteID })),
          catchError((error: Error) => of(quotesActions.failure({ error: error.message }))),
        );
      }),
    ),
  );
}
