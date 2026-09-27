import { Component, effect, inject, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { customersFeature } from '../../../shared/store/customers.store';
import type { Address, Customer } from '../../../shared/models/models';

@Component({
  selector: 'app-customer-management-component',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './customer-management-component.html',
  styleUrl: './customer-management-component.css',
})
export class CustomerManagementComponent {
  public displayedColumns = ['firstName', 'lastName', 'street', 'city', 'suburb', 'postalCode'];
  public dataSource = new MatTableDataSource<Customer>();
  private customers = inject(Store).selectSignal(customersFeature.selectCustomers);

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

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }
}
