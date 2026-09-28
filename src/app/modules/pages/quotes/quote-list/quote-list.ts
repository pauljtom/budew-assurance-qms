import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { customersFeature } from '../../../../shared/store/customers.store';
import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { QuoteStatus, type Quote } from '../../../../shared/models/models';
import { quotesActions, quotesFeature } from '../../../../shared/store/quotes.store';
import { ConfirmDeleteDialog } from '../../../../shared/components/confirm-delete-dialog/confirm-delete-dialog';
import { QuoteDialog, type QuoteDialogData } from '../quote-dialog/quote-dialog';

@Component({
  selector: 'app-quote-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './quote-list.html',
  styleUrls: ['./quote-list.css', '../quote-status.css'],
})
export class QuoteList {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly selectedCustomerID = computed(() => this.queryParams().get('customerID'));
  private customers = this.store.selectSignal(customersFeature.selectCustomers);
  readonly selectedCustomer = computed(
    () =>
      this.customers().find((customer) => customer.customerID === this.selectedCustomerID()) ??
      this.quotes().find((quote) => quote.customer.customerID === this.selectedCustomerID())
        ?.customer,
  );
  private quotes = this.store.selectSignal(quotesFeature.selectQuotes);
  readonly error = this.store.selectSignal(quotesFeature.selectError);
  readonly loading = this.store.selectSignal(quotesFeature.selectLoading);
  readonly saving = this.store.selectSignal(quotesFeature.selectSaving);
  readonly statuses = Object.values(QuoteStatus);
  readonly displayedColumns = ['quoteID', 'customer', 'amount', 'status', 'createdDate', 'actions'];
  readonly dataSource = new MatTableDataSource<Quote>();
  customerFilter = '';
  statusFilter = signal('');

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor() {
    this.dataSource.sortingDataAccessor = (quote, column) => {
      switch (column) {
        case 'customer':
          return `${quote.customer.firstName} ${quote.customer.lastName}`.toLowerCase();
        case 'amount':
          return quote.amount;
        case 'createdDate':
          return quote.createdDate.getTime();
        case 'status':
          return quote.status.toLowerCase();
        default:
          return quote.quoteID.toLowerCase();
      }
    };
    this.dataSource.filterPredicate = (quote, filter) => {
      const { customer, status } = JSON.parse(filter) as { customer: string; status: string };
      const name = `${quote.customer.firstName} ${quote.customer.lastName}`.toLowerCase();
      return (
        customer.split(/\s+/).every((term) => name.includes(term)) &&
        (!status || quote.status === status)
      );
    };
    effect(() => {
      const customerID = this.selectedCustomerID();
      this.dataSource.data = this.quotes().filter(
        (quote) => customerID === null || quote.customer.customerID === customerID,
      );
    });
    this.store.dispatch(quotesActions.load());
  }

  customerDeleted(customerID: string) {
    return !this.customers().some((customer) => customer.customerID === customerID);
  }

  filterCustomer(event: Event) {
    this.customerFilter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  filterStatus(status: string) {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  private applyFilters() {
    this.dataSource.filter = JSON.stringify({
      customer: this.customerFilter,
      status: this.statusFilter(),
    });
  }

  open(mode: QuoteDialogData['mode'], quote?: Quote) {
    this.dialog.open(QuoteDialog, { data: { mode, quote }, width: '560px', maxWidth: '95vw' });
  }

  delete(quote: Quote) {
    this.dialog
      .open(ConfirmDeleteDialog, { data: { kind: 'quote', name: quote.quoteID } })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed === true)
          this.store.dispatch(quotesActions.delete({ quoteID: quote.quoteID }));
      });
  }
}
