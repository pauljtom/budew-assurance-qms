import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  catchError,
  combineLatest,
  finalize,
  of,
  startWith,
  Subject,
  switchMap,
  timer,
} from 'rxjs';
import type { Country, University } from '../../../../shared/models/models';
import {
  CustomerEnrichmentService,
  type NationalityPrediction,
} from '../../../../shared/services/customer-enrichment.service';

@Component({
  selector: 'app-customer-enrichment',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PercentPipe,
  ],
  templateUrl: './customer-enrichment.html',
  styleUrl: './customer-enrichment.css',
})
export class CustomerEnrichment {
  readonly surname = input('');
  readonly country = input<Country>();
  readonly university = input<University>();
  readonly countryChange = output<Country | undefined>();
  readonly universityChange = output<University | undefined>();
  private api = inject(CustomerEnrichmentService);
  private retryCountries = new Subject<void>();
  readonly countries = signal<Country[]>([]);
  readonly predictions = signal<NationalityPrediction[]>([]);
  readonly universities = signal<University[]>([]);
  readonly countryError = signal('');
  readonly predictionError = signal('');
  readonly universityError = signal('');
  readonly countriesLoading = signal(false);
  readonly predictionsLoading = signal(false);
  readonly universitiesLoading = signal(false);
  readonly universitySearchAttempted = signal(false);
  readonly countrySearch = new FormControl<string | Country>('', { nonNullable: true });
  readonly universitySearch = new FormControl<string | University>('', { nonNullable: true });
  private countryQuery = toSignal(this.countrySearch.valueChanges, { initialValue: '' });
  readonly filteredCountries = computed(() => {
    const value = this.countryQuery();
    const query = typeof value === 'string' ? value.toLowerCase().trim() : '';
    return this.countries().filter((country) => country.name.toLowerCase().includes(query));
  });
  readonly resolvedPredictions = computed(() =>
    this.predictions().map((prediction) => ({
      ...prediction,
      country: this.countries().find((country) => country.code === prediction.country_id),
    })),
  );
  readonly displayCountry = (value: string | Country) =>
    typeof value === 'string' ? value : value.name;
  readonly displayUniversity = (value: string | University) =>
    typeof value === 'string' ? value : value.name;

  constructor() {
    effect(() => this.countrySearch.setValue(this.country() ?? '', { emitEvent: false }));
    effect(() => {
      const university = this.university();
      if (university || typeof this.universitySearch.value !== 'string') {
        this.universitySearch.setValue(university ?? '', { emitEvent: false });
      }
    });
    this.retryCountries
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.countryError.set('');
          this.countriesLoading.set(true);
          return this.api.countries.pipe(
            catchError(() => {
              this.countryError.set(
                'Could not retrieve the country list. Retry to choose a country, or save the customer without one.',
              );
              return of([] as Country[]);
            }),
            finalize(() => this.countriesLoading.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((countries) => this.countries.set(countries));

    toObservable(this.surname)
      .pipe(
        switchMap((value) => {
          const surname = value.trim();
          this.predictions.set([]);
          this.predictionError.set('');
          if (!surname) return of([] as NationalityPrediction[]);
          return timer(400).pipe(
            switchMap(() => {
              this.predictionsLoading.set(true);
              return this.api.predict(surname).pipe(
                catchError(() => {
                  this.predictionError.set(
                    'Could not retrieve nationality predictions. You can choose a country from the list if available, or save the customer without one.',
                  );
                  return of([] as NationalityPrediction[]);
                }),
                finalize(() => this.predictionsLoading.set(false)),
              );
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((predictions) => this.predictions.set(predictions));

    this.universitySearch.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (typeof value === 'string' && this.university()) this.universityChange.emit(undefined);
    });

    combineLatest([
      toObservable(this.country),
      this.universitySearch.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        switchMap(([country, value]) => {
          this.universities.set([]);
          this.universityError.set('');
          const query = typeof value === 'string' ? value.trim() : '';
          if (!country || query.length < 2) return of([] as University[]);
          return timer(350).pipe(
            switchMap(() => {
              this.universitiesLoading.set(true);
              return this.api.universities(country, query).pipe(
                catchError(() => {
                  this.universityError.set('Could not retrieve universities. You can still save the customer without one.');
                  return of([] as University[]);
                }),
                finalize(() => this.universitiesLoading.set(false)),
              );
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((universities) => this.universities.set(universities));
  }

  get universityQuery() {
    const value = this.universitySearch.value;
    return typeof value === 'string' ? value.trim() : '';
  }

  retry() {
    this.retryCountries.next();
  }

  chooseCountry(country: Country) {
    this.universitySearchAttempted.set(false);
    if (country.code !== this.country()?.code) {
      this.universityChange.emit(undefined);
      this.universitySearch.setValue('');
    }
    this.countryChange.emit(country);
    this.countrySearch.setValue(country);
  }

  chooseUniversity(university: University) {
    this.universityChange.emit(university);
  }

  clearCountry() {
    this.universitySearchAttempted.set(false);
    this.countryChange.emit(undefined);
    this.universityChange.emit(undefined);
    this.universitySearch.setValue('');
  }

  onUniversitySearchFocus() {
    if (!this.country()) this.universitySearchAttempted.set(true);
  }
}
