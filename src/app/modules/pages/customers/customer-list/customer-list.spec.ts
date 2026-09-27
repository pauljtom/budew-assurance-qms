import { provideEffects } from '@ngrx/effects';
import { CustomersEffects } from '../../../../shared/store/customers.effects';
import { firstValueFrom } from 'rxjs';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { addCustomer, customersFeature } from '../../../../shared/store/customers.store';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog } from '@angular/material/dialog';
import { CustomerList } from './customer-list';

describe('CustomerList', () => {
  let component: CustomerList;
  let fixture: ComponentFixture<CustomerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerList],
      providers: [
        provideStore({ customers: customersFeature.reducer }),
        provideEffects(CustomersEffects),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render customer names in the table', () => {
    fixture.detectChanges();

    const table: HTMLTableElement = fixture.nativeElement.querySelector('table');
    const headers = Array.from(table.querySelectorAll('th')).map((cell) =>
      cell.textContent?.trim(),
    );
    const rows = Array.from(table.querySelectorAll('tr[mat-row]'));

    expect(headers).toEqual([
      'First Name',
      'Last Name',
      'Street',
      'City',
      'Suburb',
      'Postal Code',
      'Actions',
    ]);
    expect(rows).toHaveLength(5);
    expect(rows[0].textContent).toContain('John');
    expect(rows[0].textContent).toContain('Smith');
    expect(rows[0].textContent).toContain('2 Frigate Crescent');
    expect(rows[0].textContent).toContain('Cape Town');
    expect(rows[0].textContent).toContain('Fish Hoek');
    expect(rows[0].textContent).toContain('7896');
    expect(rows[4].textContent).toContain('David');
    expect(rows[4].textContent).toContain('Botha');
  });
  it('filters by names and addresses and restores rows when cleared', () => {
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '  JOHN fish HOEK  ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('John');
    input.value = 'no match';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No customers found.');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]')).toHaveLength(5);
  });

  it('sorts names and postal codes through column headers', () => {
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('th');
    headers[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('David');
    headers[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('Thabo');
    headers[5].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('0083');
  });

  it('shows and searches every address when the store adds a customer', () => {
    TestBed.inject(Store).dispatch(
      addCustomer({
        customer: {
          customerID: 'C-test-alex',
          firstName: 'Alex',
          lastName: 'Jones',
          addresses: [
            { street: '1 First Road', city: 'Cape Town', suburb: 'Central', postalCode: '0001' },
            { street: '2 Second Road', city: 'Durban', suburb: 'North', postalCode: '0002' },
          ],
        },
      }),
    );
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(6);
    expect(rows[5].textContent).toContain('1 First Road');
    expect(rows[5].textContent).toContain('2 Second Road');
    expect(rows[5].textContent).toContain('North');
    expect(rows[5].textContent).toContain('0002');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'second 0002';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('tr[mat-row]').textContent).toContain('Alex');
  });
  it('deletes only after dialog confirmation and preserves a cancelled customer', async () => {
    fixture.detectChanges();
    const dialog = TestBed.inject(MatDialog);
    const customer = component.dataSource.data[0];
    component.delete(customer);
    await fixture.whenStable();
    expect(dialog.openDialogs).toHaveLength(1);
    expect(document.querySelector('mat-dialog-container')?.textContent).toContain('John Smith');
    const cancelled = firstValueFrom(dialog.openDialogs[0].afterClosed());
    dialog.openDialogs[0].close(false);
    await cancelled;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.dataSource.data).toHaveLength(5);
    component.delete(customer);
    const confirmed = firstValueFrom(dialog.openDialogs[0].afterClosed());
    dialog.openDialogs[0].close(true);
    await confirmed;
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.dataSource.data).toHaveLength(4);
    expect(fixture.nativeElement.querySelector('table').textContent).not.toContain('John');
  });
});
