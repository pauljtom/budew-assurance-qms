import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { App } from './app';
import { routes } from './app.routes';
import { customersFeature } from './shared/store/customers.store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideStore({ customers: customersFeature.reducer })],
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
    expect(element.querySelector('main app-quote-management-component')).toBeTruthy();
    expect(element.querySelector('header h1')?.textContent).toContain('Budew Assurance');
    await router.navigateByUrl('/customers/new');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(customers.classList.contains('active')).toBe(true);
  });
});
