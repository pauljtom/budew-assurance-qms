import { QuoteStatus } from './shared/models/models';
import { CustomersEffects } from './shared/store/customers.effects';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { quotesActions, quotesFeature } from './shared/store/quotes.store';
import { QuotesEffects } from './shared/store/quotes.effects';
import { App } from './app';
import { routes } from './app.routes';
import { addCustomer, customersFeature } from './shared/store/customers.store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideStore({ customers: customersFeature.reducer, quotes: quotesFeature.reducer }),
        provideEffects(CustomersEffects, QuotesEffects),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps navigation visible while clicks change the main view', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('header h1')?.textContent).toContain('Budew Assurance');
    expect(element.querySelector('main')?.textContent).toContain('Welcome to Budew Assurance');
    const customers = element.querySelector<HTMLAnchorElement>('nav a[href="/customers"]')!;
    customers.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/customers');
    expect(element.querySelector('main')?.textContent).toContain('Customer Management');
    expect(customers.getAttribute('aria-current')).toBe('page');
    element.querySelector<HTMLAnchorElement>('nav a[href="/quotes"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/quotes');
    expect(element.querySelector('main app-quote-list')).toBeTruthy();
    expect(element.querySelector('header h1')?.textContent).toContain('Budew Assurance');
    await router.navigateByUrl('/customers/new');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(customers.classList.contains('active')).toBe(true);
  });
  it('opens only the selected customer quotes, excludes same-name customers, and clears the scope', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const store = TestBed.inject(Store);
    fixture.detectChanges();
    const john = store.selectSignal(customersFeature.selectCustomers)()[0];
    const otherJohn = { ...john, customerID: 'C-other-john' };
    store.dispatch(addCustomer({ customer: otherJohn }));
    store.dispatch(
      quotesActions.create({
        quote: {
          quoteID: 'Q-other-john',
          customer: otherJohn,
          amount: 100,
          status: QuoteStatus.Draft,
          createdDate: new Date(),
        },
      }),
    );
    await router.navigateByUrl('/customers');
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const link = element.querySelector<HTMLAnchorElement>('tr[mat-row] a')!;
    expect(link.textContent).toContain('View Quotes');
    link.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/quotes?customerID=C-1001');
    expect(element.querySelector('.customer-scope')?.textContent).toContain('John Smith');
    let rows = element.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(2);
    expect(element.querySelector('table')?.textContent).toContain('Q-1001');
    expect(element.querySelector('table')?.textContent).toContain('Q-1006');
    expect(element.querySelector('table')?.textContent).not.toContain('Q-other-john');
    await router.navigateByUrl('/quotes?customerID=C-1002');
    await fixture.whenStable();
    fixture.detectChanges();
    rows = element.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Sarah Jacobs');
    await router.navigateByUrl('/quotes?customerID=unknown');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelectorAll('tr[mat-row]')).toHaveLength(0);
    expect(element.querySelector('main')?.textContent).toContain('No quotes found.');
    element.querySelector<HTMLAnchorElement>('.customer-scope a')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/quotes');
    expect(element.querySelectorAll('tr[mat-row]')).toHaveLength(7);
  });
});
