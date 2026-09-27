import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerEnrichment } from './customer-enrichment';
import type { Country } from '../../../../shared/models/models';

const countries = [
  { name: 'South Africa', alpha2Code: 'ZA', flag: '🇿🇦' },
  { name: 'United Kingdom', alpha2Code: 'GB', flag: '🇬🇧' },
  { name: 'United States of America', alpha2Code: 'US', flag: '🇺🇸' },
];
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('CustomerEnrichment', () => {
  let fixture: ComponentFixture<CustomerEnrichment>;
  let component: CustomerEnrichment;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomerEnrichment],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CustomerEnrichment);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne((request) => request.url === 'https://countries.dev/countries').flush(countries);
    fixture.detectChanges();
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('debounces surname predictions and cancels obsolete requests', async () => {
    fixture.componentRef.setInput('surname', 'Smi');
    fixture.detectChanges();
    await pause(100);
    http.expectNone((request) => request.url === 'https://api.nationalize.io/');
    fixture.componentRef.setInput('surname', 'Smith');
    fixture.detectChanges();
    await pause(430);
    const old = http.expectOne(
      (request) =>
        request.url === 'https://api.nationalize.io/' && request.params.get('name') === 'Smith',
    );
    fixture.componentRef.setInput('surname', 'Thomson');
    fixture.detectChanges();
    expect(old.cancelled).toBe(true);
    await pause(430);
    http
      .expectOne((request) => request.params.get('name') === 'Thomson')
      .flush({
        country: [
          { country_id: 'ZA', probability: 0.6 },
          { country_id: 'GB', probability: 0.3 },
        ],
      });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('🇿🇦 South Africa');
    expect(fixture.nativeElement.textContent).toContain('60.0%');
    expect(component.country()).toBeUndefined();
    let selected: Country | undefined;
    component.countryChange.subscribe((country) => (selected = country));
    fixture.nativeElement.querySelector('.predictions button').click();
    expect(selected?.code).toBe('ZA');
    fixture.componentRef.setInput('surname', '');
    fixture.detectChanges();
    expect(component.predictions()).toEqual([]);
  });

  it('allows a searchable country override and searches universities only in the confirmed country', async () => {
    component.countrySearch.setValue('united');
    fixture.detectChanges();
    expect(component.filteredCountries()).toHaveLength(2);
    const country = component.countries().find((item) => item.code === 'ZA')!;
    component.countryChange.subscribe((value) => fixture.componentRef.setInput('country', value));
    component.universityChange.subscribe((value) =>
      fixture.componentRef.setInput('university', value),
    );
    component.universitySearch.setValue('Cape');
    await pause(380);
    http.expectNone((request) => request.url === '/api/universities/search');
    component.chooseCountry(country);
    fixture.detectChanges();
    component.universitySearch.setValue('Ca');
    await pause(100);
    http.expectNone((request) => request.url === '/api/universities/search');
    component.universitySearch.setValue('Cape');
    await pause(380);
    const request = http.expectOne((request) => request.url === '/api/universities/search');
    expect(request.request.params.get('country')).toBe('South Africa');
    expect(request.request.params.get('name')).toBe('Cape');
    request.flush([
      {
        name: 'University of Cape Town',
        alpha_two_code: 'ZA',
        web_pages: ['https://www.uct.ac.za/'],
      },
    ]);
    fixture.detectChanges();
    component.chooseUniversity(component.universities()[0]);
    fixture.detectChanges();
    expect(component.university()?.website).toBe('https://www.uct.ac.za/');
    component.chooseCountry(component.countries().find((item) => item.code === 'GB')!);
    fixture.detectChanges();
    expect(component.university()).toBeUndefined();
    expect(component.universities()).toEqual([]);
  });

  it('keeps manual country selection available after a prediction failure', async () => {
    fixture.componentRef.setInput('surname', 'Smith');
    fixture.detectChanges();
    await pause(430);
    http
      .expectOne((request) => request.url === 'https://api.nationalize.io/')
      .flush({}, { status: 429, statusText: 'Too Many Requests' });
    fixture.detectChanges();
    expect(component.predictionError()).toContain('choose a country manually');
    expect(component.filteredCountries()).toHaveLength(3);
  });
});
