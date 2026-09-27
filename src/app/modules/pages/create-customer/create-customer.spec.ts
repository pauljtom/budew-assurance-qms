import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideStore, Store } from '@ngrx/store';
import { routes } from '../../../app.routes';
import { customersFeature } from '../../../shared/store/customers.store';
import { CreateCustomer } from './create-customer';
import { CustomerManagementComponent } from '../customer-management-component/customer-management-component';

describe('CreateCustomer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideStore({ customers: customersFeature.reducer })],
    });
  });

  it('creates a customer through the form and displays it in the table', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/customers/new', CreateCustomer);
    const values: Record<string, string> = {
      firstName: '  Amy  ',
      lastName: 'Williams',
      street: '12 Main Road',
      suburb: 'Claremont',
      city: 'Cape Town',
      postalCode: '7708',
    };
    for (const [name, value] of Object.entries(values)) {
      const input = harness.routeNativeElement!.querySelector<HTMLInputElement>(
        `[formControlName="${name}"]`,
      )!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    harness
      .routeNativeElement!.querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();
    harness.detectChanges();

    const customers = TestBed.inject(Store).selectSignal(customersFeature.selectCustomers)();
    expect(customers).toHaveLength(6);
    expect(customers[5]).toEqual({
      firstName: 'Amy',
      lastName: 'Williams',
      addresses: [
        { street: '12 Main Road', suburb: 'Claremont', city: 'Cape Town', postalCode: '7708' },
      ],
    });
    expect(harness.routeNativeElement!.querySelectorAll('tr[mat-row]')).toHaveLength(6);
    expect(harness.routeNativeElement!.textContent).toContain('Amy');

    await harness.navigateByUrl('/', (await import('../home/home')).Home);
    await harness.navigateByUrl('/customers', CustomerManagementComponent);
    expect(harness.routeNativeElement!.textContent).toContain('Amy');
  });

  it('rejects missing fields, whitespace names and invalid postal codes', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/customers/new', CreateCustomer);
    component.save();
    expect(component.form.controls.firstName.touched).toBe(true);
    component.form.setValue({
      firstName: '   ',
      lastName: 'Williams',
      street: '12 Main Road',
      suburb: 'Claremont',
      city: 'Cape Town',
      postalCode: 'abcd',
    });
    component.save();
    expect(component.form.invalid).toBe(true);
    expect(TestBed.inject(Store).selectSignal(customersFeature.selectCustomers)()).toHaveLength(5);
    expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toBe('New Customer');
  });

  it('cancels without adding a customer', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/customers/new', CreateCustomer);
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a')!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Store).selectSignal(customersFeature.selectCustomers)()).toHaveLength(5);
    expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toBe(
      'Customer Management',
    );
  });
});
