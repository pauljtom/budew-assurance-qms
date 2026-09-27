import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CustomerEnrichment } from '../customer-enrichment/customer-enrichment';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Customer, Country, University } from '../../../../shared/models/models';
import {
  updateCustomer,
  updateCustomerSuccess,
  addCustomer,
  addCustomerSuccess,
  customersFailure,
  customersFeature,
} from '../../../../shared/store/customers.store';

@Component({
  selector: 'app-create-customer',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSidenavModule,
    CustomerEnrichment,
  ],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.css',
})
export class CreateCustomer {
  readonly dialogRef = inject(MatDialogRef<CreateCustomer>, { optional: true });
  readonly original = inject<{ customer?: Customer }>(MAT_DIALOG_DATA, { optional: true })
    ?.customer;
  readonly nationality = signal<Country | undefined>(this.original?.nationality);
  readonly university = signal<University | undefined>(this.original?.university);
  readonly smallScreen = toSignal(inject(BreakpointObserver).observe('(max-width: 800px)'), {
    initialValue: { matches: false, breakpoints: {} },
  });
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly builder = inject(FormBuilder);
  private readonly actions = inject(Actions);
  private pendingCustomer: Customer | null = null;
  readonly saving = this.store.selectSignal(customersFeature.selectSaving);
  readonly error = this.store.selectSignal(customersFeature.selectError);
  private readonly requiredText = [Validators.required, Validators.pattern(/\S/)];

  readonly form = this.builder.nonNullable.group({
    firstName: [this.original?.firstName ?? '', this.requiredText],
    lastName: [this.original?.lastName ?? '', this.requiredText],
    street: [this.original?.addresses[0]?.street ?? '', this.requiredText],
    suburb: [this.original?.addresses[0]?.suburb ?? '', this.requiredText],
    city: [this.original?.addresses[0]?.city ?? '', this.requiredText],
    postalCode: [
      this.original?.addresses[0]?.postalCode ?? '',
      [Validators.required, Validators.pattern(/^\d{4}$/)],
    ],
  });

  readonly surname = toSignal(this.form.controls.lastName.valueChanges, {
    initialValue: this.form.controls.lastName.value,
  });

  constructor() {
    this.actions
      .pipe(ofType(addCustomerSuccess, updateCustomerSuccess), takeUntilDestroyed())
      .subscribe(({ customer }) => {
        if (customer.customerID === this.pendingCustomer?.customerID) {
          this.pendingCustomer = null;
          if (this.dialogRef) this.dialogRef.close(true);
          else void this.router.navigate(['/customers']);
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
      customerID: this.original?.customerID ?? `C-${crypto.randomUUID()}`,
      nationality: this.nationality(),
      university: this.university(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      addresses: [
        {
          street: values.street.trim(),
          suburb: values.suburb.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode,
        },
        ...(this.original?.addresses.slice(1) ?? []),
      ],
    };
    this.pendingCustomer = customer;
    this.store.dispatch(this.original ? updateCustomer({ customer }) : addCustomer({ customer }));
  }
}
