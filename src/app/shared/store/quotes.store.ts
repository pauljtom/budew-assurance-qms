import { deleteCustomerSuccess, updateCustomerSuccess } from './customers.store';
import {
  createActionGroup,
  createFeature,
  createReducer,
  on,
  props,
  emptyProps,
} from '@ngrx/store';
import type { Quote } from '../models/models';

export const quotesActions = createActionGroup({
  source: 'Quotes',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ quotes: Quote[] }>(),
    Create: props<{ quote: Quote }>(),
    Update: props<{ quote: Quote }>(),
    Delete: props<{ quoteID: string }>(),
    'Mutation Success': props<{ quotes: Quote[]; quoteID: string }>(),
    Failure: props<{ error: string }>(),
  },
});

export const quotesFeature = createFeature({
  name: 'quotes',
  reducer: createReducer(
    { quotes: [] as Quote[], loading: false, saving: false, error: null as string | null },
    on(updateCustomerSuccess, (state, { customer }) => ({
      ...state,
      quotes: state.quotes.map((quote) =>
        quote.customer.customerID === customer.customerID ? { ...quote, customer } : quote,
      ),
    })),
    on(deleteCustomerSuccess, (state, { customerID, deleteRelatedQuotes }) =>
      deleteRelatedQuotes
        ? {
            ...state,
            quotes: state.quotes.filter((quote) => quote.customer.customerID !== customerID),
          }
        : state,
    ),
    on(quotesActions.load, (state) => ({ ...state, loading: true, error: null })),
    on(quotesActions.create, quotesActions.update, quotesActions.delete, (state) => ({
      ...state,
      saving: true,
      error: null,
    })),
    on(quotesActions.loadSuccess, (state, { quotes }) => ({ ...state, quotes, loading: false })),
    on(quotesActions.mutationSuccess, (state, { quotes }) => ({ ...state, quotes, saving: false })),
    on(quotesActions.failure, (state, { error }) => ({
      ...state,
      loading: false,
      saving: false,
      error,
    })),
  ),
});
