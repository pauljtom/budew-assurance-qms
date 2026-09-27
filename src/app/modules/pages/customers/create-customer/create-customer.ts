import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Customer } from '../../../../shared/models/models';
import {
  addCustomer,
  addCustomerSuccess,
  customersFailure,
  customersFeature,
} from '../../../../shared/store/customers.store';

@Component({
  selector: 'app-create-customer',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.css',
})
export class CreateCustomer {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder);
  private readonly actions = inject(Actions);
  private pendingCustomer: Customer | null = null;
  readonly saving = this.store.selectSignal(customersFeature.selectSaving);
  readonly error = this.store.selectSignal(customersFeature.selectError);
  private readonly requiredText = [Validators.required, Validators.pattern(/\S/)];

  readonly form = this.builder.nonNullable.group({
    firstName: ['', this.requiredText],
    lastName: ['', this.requiredText],
    street: ['', this.requiredText],
    suburb: ['', this.requiredText],
    city: ['', this.requiredText],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  constructor() {
    this.actions
      .pipe(ofType(addCustomerSuccess), takeUntilDestroyed())
      .subscribe(({ customer }) => {
        if (customer.customerID === this.pendingCustomer?.customerID) {
          this.pendingCustomer = null;
          void this.router.navigate(['/customers']);
        }
      });
    this.actions.pipe(ofType(customersFailure), takeUntilDestroyed()).subscribe(() => {
      this.pendingCustomer = null;
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const customer: Customer = {
      customerID: `C-${crypto.randomUUID()}`,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      addresses: [
        {
          street: values.street.trim(),
          suburb: values.suburb.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode,
        },
      ],
    };
    this.pendingCustomer = customer;
    this.store.dispatch(addCustomer({ customer }));
  }
}
