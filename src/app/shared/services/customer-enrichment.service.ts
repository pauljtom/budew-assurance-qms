import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import type { Country, University } from '../models/models';

export interface NationalityPrediction {
  country_id: string;
  probability: number;
}
interface CountryResponse {
  name: string;
  alpha2Code: string;
  flag: string;
}
interface UniversityResponse {
  name: string;
  web_pages: string[];
  alpha_two_code: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerEnrichmentService {
  private http = inject(HttpClient);
  readonly countries = this.http
    .get<CountryResponse[]>('https://countries.dev/countries', {
      params: { fields: 'name,flag,flags,alpha2Code' },
    })
    .pipe(
      map((countries) => {
        const options = Array.isArray(countries)
          ? countries
              .filter((country) => country.alpha2Code && country.name)
              .map((country) => ({
                code: country.alpha2Code,
                name: country.name,
                flag: country.flag,
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];
        if (options.length === 0) throw new Error('The country list is empty.');
        return options;
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  predict(surname: string) {
    return this.http
      .get<{ country: NationalityPrediction[] }>('https://api.nationalize.io/', {
        params: { name: surname },
      })
      .pipe(map((response) => response.country.sort((a, b) => b.probability - a.probability)));
  }

  universities(country: Country, name: string) {
    const aliases: Record<string, string> = {
      BO: 'Bolivia, Plurinational State of',
      VG: 'Virgin Islands, British',
      CV: 'Cape Verde',
      CD: 'Congo, the Democratic Republic of the',
      VA: 'Holy See (Vatican City State)',
      CI: "Côte d'Ivoire",
      IR: 'Iran',
      MD: 'Moldova, Republic of',
      KP: "Korea, Democratic People's Republic of",
      XK: 'Kosovo',
      KR: 'Korea, Republic of',
      TW: 'Taiwan, Province of China',
      TR: 'Turkiye',
      GB: 'United Kingdom',
      US: 'United States',
      VE: 'Venezuela, Bolivarian Republic of',
    };
    return this.http
      .get<UniversityResponse[]>('/api/universities/search', {
        params: { country: aliases[country.code] ?? country.name, name },
      })
      .pipe(
        map((universities) =>
          universities
            .filter((university) => university.alpha_two_code === country.code)
            .map((university): University => ({
              name: university.name,
              website: university.web_pages.find((url) => /^https?:\/\//i.test(url)) ?? '',
            })),
        ),
      );
  }
}
