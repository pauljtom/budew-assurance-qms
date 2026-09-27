import { Component, effect, inject, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../../../shared/components/confirm-delete-dialog/confirm-delete-dialog';
import { deleteCustomer, customersFeature } from '../../../../shared/store/customers.store';
import type { Address, Customer } from '../../../../shared/models/models';

@Component({
  selector: 'app-customer-list',
  imports: [
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList {
  public displayedColumns = [
    'firstName',
    'lastName',
    'street',
    'city',
    'suburb',
    'postalCode',
    'actions',
  ];
  public dataSource = new MatTableDataSource<Customer>();
  private store = inject(Store);
  private dialog = inject(MatDialog);
  readonly error = this.store.selectSignal(customersFeature.selectError);
  readonly loading = this.store.selectSignal(customersFeature.selectLoading);
  readonly saving = this.store.selectSignal(customersFeature.selectSaving);
  private customers = this.store.selectSignal(customersFeature.selectCustomers);

  @ViewChild(MatSort)
  set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor() {
    this.dataSource.sortingDataAccessor = (customer, column) => {
      if (column === 'firstName' || column === 'lastName') {
        return customer[column].toLowerCase();
      }
      return customer.addresses
        .map((address) => address[column as keyof Address])
        .join(' ')
        .toLowerCase();
    };
    this.dataSource.filterPredicate = (customer, filter) => {
      const searchableText = [
        customer.firstName,
        customer.lastName,
        ...customer.addresses.flatMap((address) => [
          address.street,
          address.city,
          address.suburb,
          address.postalCode,
        ]),
      ]
        .join(' ')
        .toLowerCase();
      return filter.split(/\s+/).every((term) => searchableText.includes(term));
    };
    effect(() => {
      this.dataSource.data = this.customers();
    });
  }

  delete(customer: Customer) {
    this.dialog
      .open(ConfirmDeleteDialog, {
        data: { kind: 'customer', name: `${customer.firstName} ${customer.lastName}` },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true) this.store.dispatch(deleteCustomer({ customer }));
      });
  }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }
}
