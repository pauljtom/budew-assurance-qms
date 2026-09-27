# BudewAssuranceQms

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Customer enrichment

Customers can be added or edited in the same Material dialog. The enrichment
sidenav predicts countries from a surname through Nationalize, lets the user
confirm a prediction or search the countries.dev country list, and searches
Hipolabs universities in the confirmed country. Only explicitly selected country
and university values are saved. Customer and quote changes are in memory and
reset when the browser is refreshed.

The Nationalize endpoint is `https://api.nationalize.io/?name=<surname>`; the
collection's `/name=` path is corrected to the supported query parameter.
Nationality requests wait 400 ms after surname changes, and university searches
wait 350 ms and require at least two characters. New input cancels obsolete
requests. Lookup errors do not prevent saving the customer's core fields.

`ng serve` uses `src/proxy.conf.json` to forward `/api/universities/search` to
`http://universities.hipolabs.com/search`. Restart the dev server after changing
proxy configuration. Production hosting needs an equivalent server-side proxy
for `/api/universities/`; the Angular development proxy is not included in a
static production build.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
