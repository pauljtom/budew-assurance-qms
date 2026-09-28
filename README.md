# Budew Assurance QMS

An Angular 21 frontend for managing customers and insurance quotes. It uses Angular Material for the interface and NgRx Store and Effects for application state.

## Run locally

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. The customer enrichment features require an internet connection. Customer and quote changes are held in memory and reset when the page is refreshed.

## Features

- Customer table with filtering, sorting, add, edit, and delete actions.
- Quote table with customer and status filters, sorting, view, add, edit, and delete actions. A customer's **View Quotes** link opens only their quotes.
- Confirmation dialogs for deletion. When deleting a customer, you can choose whether to delete their quotes or retain them for reassignment.
- Customer enrichment with debounced nationality predictions, a searchable country list, and university search in the selected country. Lookup failures are shown in the form and do not block saving the customer's core details.

## Inspect NgRx state in Firefox

Install the [Redux DevTools Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/), start the app, and open Firefox Developer Tools with **F12**. Select the **Redux** tab and reload the page. Select an action to inspect its payload and the resulting `customers` or `quotes` state. Visiting the Quotes page dispatches its load action.

NgRx Store DevTools is configured in `src/app/app.config.ts` to retain the latest 25 actions.

## Customer enrichment APIs

- Nationalize predicts countries from the surname after a 400 ms pause.
- countries.dev supplies the country list, which is cached after loading.
- Hipolabs searches universities after a 350 ms pause and at least two typed characters. The selected university's name and website are saved on the customer.

The Angular development server uses `src/proxy.conf.json` to forward `/api/universities/search` to Hipolabs. Restart the server after changing the proxy configuration. The API collection is in [docs/api-documentation.html](docs/api-documentation.html).

## Verify

```bash
npm run build
npm test -- --watch=false
```

The [AI usage disclosure](AI_USAGE.md) and [prompt record](PROMPTS.md) document how AI was used during development.
