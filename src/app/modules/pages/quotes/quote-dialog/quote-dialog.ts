import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { QuoteStatus, type Customer, type Quote } from '../../../../shared/models/models';
import { customersFeature } from '../../../../shared/store/customers.store';
import { quotesActions, quotesFeature } from '../../../../shared/store/quotes.store';

export interface QuoteDialogData {
  mode: 'view' | 'create' | 'edit';
  quote?: Quote;
}

@Component({
  selector: 'app-quote-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './quote-dialog.html',
  styleUrls: ['./quote-dialog.css', '../quote-status.css'],
})
export class QuoteDialog {
  readonly data = inject<QuoteDialogData>(MAT_DIALOG_DATA);
  private store = inject(Store);
  private ref = inject(MatDialogRef<QuoteDialog>);
  private builder = inject(FormBuilder);
  private actions = inject(Actions);
  private pendingID: string | null = null;
  readonly customers = this.store.selectSignal(customersFeature.selectCustomers);
  readonly error = this.store.selectSignal(quotesFeature.selectError);
  readonly saving = this.store.selectSignal(quotesFeature.selectSaving);
  readonly statuses = Object.values(QuoteStatus);
  readonly form = this.builder.group({
    customer: [
      this.customers().find(
        (customer) => customer.customerID === this.data.quote?.customer.customerID,
      ) ?? (null as Customer | null),
      Validators.required,
    ],
    amount: [
      this.data.quote?.amount ?? (null as number | null),
      [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
    ],
    status: [this.data.quote?.status ?? QuoteStatus.Draft, Validators.required],
  });

  get availableCustomers() {
    return this.customers();
  }

  customerDeleted(customerID: string) {
    return !this.customers().some((customer) => customer.customerID === customerID);
  }

  constructor() {
    this.actions
      .pipe(ofType(quotesActions.mutationSuccess), takeUntilDestroyed())
      .subscribe(({ quoteID }) => {
        if (quoteID === this.pendingID) this.ref.close(true);
      });
  }

  save() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const { customer, amount, status } = this.form.getRawValue();
    if (!customer || amount == null || !status) return;
    const activeCustomer = this.customers().find(
      (item) => item.customerID === customer.customerID,
    );
    if (!activeCustomer) {
      this.form.controls.customer.setErrors({ required: true });
      return;
    }
    const quote: Quote = {
      quoteID: this.data.quote?.quoteID ?? `Q-${crypto.randomUUID()}`,
      customer: activeCustomer,
      amount,
      status,
      createdDate: this.data.quote?.createdDate ?? new Date(),
    };
    this.pendingID = quote.quoteID;
    this.store.dispatch(
      this.data.mode === 'edit' ? quotesActions.update({ quote }) : quotesActions.create({ quote }),
    );
  }
}
