import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { addCustomer } from '../../../../shared/store/customers.store';

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
  private readonly requiredText = [Validators.required, Validators.pattern(/\S/)];

  readonly form = this.builder.nonNullable.group({
    firstName: ['', this.requiredText],
    lastName: ['', this.requiredText],
    street: ['', this.requiredText],
    suburb: ['', this.requiredText],
    city: ['', this.requiredText],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.store.dispatch(
      addCustomer({
        customer: {
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
        },
      }),
    );
    void this.router.navigate(['/customers']);
  }
}
