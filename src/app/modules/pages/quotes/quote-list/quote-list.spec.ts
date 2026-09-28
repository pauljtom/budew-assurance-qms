import { provideRouter } from '@angular/router';
import { CustomersEffects } from '../../../../shared/store/customers.effects';
import { firstValueFrom } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { customersFeature, deleteCustomer } from '../../../../shared/store/customers.store';
import { quotesActions, quotesFeature } from '../../../../shared/store/quotes.store';
import { QuotesEffects } from '../../../../shared/store/quotes.effects';
import { QuoteStatus } from '../../../../shared/models/models';
import { QuoteDialog } from '../quote-dialog/quote-dialog';
import { QuoteList } from './quote-list';

describe('QuoteList', () => {
  let component: QuoteList;
  let fixture: ComponentFixture<QuoteList>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteList],
      providers: [
        provideRouter([]),
        provideStore({ customers: customersFeature.reducer, quotes: quotesFeature.reducer }),
        provideEffects(CustomersEffects, QuotesEffects),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(QuoteList);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => dialog.closeAll());

  it('loads dummy quotes through effects and filters by customer and status together', () => {
    expect(component.dataSource.data).toHaveLength(6);
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '  JOHN SMITH  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.dataSource.filteredData).toHaveLength(2);
    component.filterStatus(QuoteStatus.Accepted);
    fixture.detectChanges();
    expect(component.dataSource.filteredData).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('Q-1006');
    component.filterStatus(QuoteStatus.Pending);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No quotes found.');
  });

  it('sorts by customer and status from the table headers', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    headers[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('David Botha');
    headers[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain(
      'Thabo Mokoena',
    );
    headers[3].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('Accepted');
  });

  it('opens a read-only view with the complete quote and customer address', async () => {
    component.open('view', component.dataSource.data[0]);
    await fixture.whenStable();
    const content = document.querySelector('mat-dialog-container')!;
    expect(content.textContent).toContain('Q-1001');
    expect(content.textContent).toContain('John Smith');
    expect(content.textContent).toContain('2 Frigate Crescent');
    expect(content.textContent).toContain('7896');
    expect(content.querySelector('form')).toBeNull();
  });

  it('validates, creates and updates through dialogs, effects and reducers without reloading', async () => {
    component.open('create');
    await fixture.whenStable();
    let editor = dialog.openDialogs[0].componentInstance as QuoteDialog;
    const submit = () =>
      document.querySelector<HTMLButtonElement>('mat-dialog-container button[type="submit"]')!;
    expect(submit().disabled).toBe(true);
    editor.save();
    expect(editor.form.invalid).toBe(true);
    expect(component.dataSource.data).toHaveLength(6);
    editor.form.setValue({
      customer: editor.availableCustomers[1],
      amount: -1,
      status: QuoteStatus.Draft,
    });
    editor.save();
    expect(component.dataSource.data).toHaveLength(6);
    editor.form.controls.amount.setValue(123.45);
    fixture.detectChanges();
    expect(submit().disabled).toBe(false);
    const created = firstValueFrom(dialog.openDialogs[0].afterClosed());
    editor.save();
    await created;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.dataSource.data).toHaveLength(7);
    const quote = component.dataSource.data[6];
    expect(quote.customer.firstName).toBe('Sarah');
    component.open('edit', quote);
    await fixture.whenStable();
    editor = dialog.openDialogs[0].componentInstance as QuoteDialog;
    expect(submit().disabled).toBe(false);
    editor.form.patchValue({
      customer: editor.availableCustomers[2],
      amount: 987.65,
      status: QuoteStatus.Approved,
    });
    const saved = firstValueFrom(dialog.openDialogs[0].afterClosed());
    editor.save();
    await saved;
    await fixture.whenStable();
    fixture.detectChanges();
    const updated = component.dataSource.data.find((item) => item.quoteID === quote.quoteID)!;
    expect(updated.customer.firstName).toBe('Thabo');
    expect(updated.amount).toBe(987.65);
    expect(updated.status).toBe(QuoteStatus.Approved);
    expect(updated.createdDate).toEqual(quote.createdDate);
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('987.65');
  });

  it('requires confirmation before deleting a quote', async () => {
    const quote = component.dataSource.data[0];
    component.delete(quote);
    await fixture.whenStable();
    expect(document.querySelector('mat-dialog-container')?.textContent).toContain('Delete quote?');
    const cancelled = firstValueFrom(dialog.openDialogs[0].afterClosed());
    dialog.openDialogs[0].close(false);
    await cancelled;
    await fixture.whenStable();
    expect(component.dataSource.data).toHaveLength(6);
    component.delete(quote);
    const confirmed = firstValueFrom(dialog.openDialogs[0].afterClosed());
    dialog.openDialogs[0].close(true);
    await confirmed;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.dataSource.data).toHaveLength(5);
    expect(fixture.nativeElement.querySelector('table').textContent).not.toContain(quote.quoteID);
  });

  it('marks retained quotes from deleted customers and requires reassignment when editing', async () => {
    const store = TestBed.inject(Store);
    const quote = component.dataSource.data[0];
    const customer = store
      .selectSignal(customersFeature.selectCustomers)()
      .find((item) => item.customerID === quote.customer.customerID)!;
    store.dispatch(deleteCustomer({ customer, deleteRelatedQuotes: false }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.dataSource.data.find((item) => item.quoteID === quote.quoteID)).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('(deleted customer)');

    component.open('edit', quote);
    await fixture.whenStable();
    const editor = dialog.openDialogs[0].componentInstance as QuoteDialog;
    expect(editor.availableCustomers.some((item) => item.customerID === customer.customerID)).toBe(
      false,
    );
    expect(editor.form.controls.customer.value).toBeNull();
    expect(
      document.querySelector<HTMLButtonElement>('mat-dialog-container button[type="submit"]')!
        .disabled,
    ).toBe(true);
    editor.form.controls.customer.setValue(editor.availableCustomers[0]);
    const saved = firstValueFrom(dialog.openDialogs[0].afterClosed());
    editor.save();
    await saved;
    await fixture.whenStable();
    expect(
      component.dataSource.data.find((item) => item.quoteID === quote.quoteID)?.customer.customerID,
    ).toBe(editor.availableCustomers[0].customerID);
  });

  it('reports a service error and can process a later update', async () => {
    const store = TestBed.inject(Store);
    const quote = component.dataSource.data[0];
    store.dispatch(quotesActions.create({ quote }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'already exists',
    );
    expect(component.dataSource.data).toHaveLength(6);
    store.dispatch(quotesActions.update({ quote: { ...quote, status: QuoteStatus.Accepted } }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.dataSource.data[0].status).toBe(QuoteStatus.Accepted);
    expect(component.error()).toBeNull();
  });
});
