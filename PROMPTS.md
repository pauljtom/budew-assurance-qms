# Project Prompts

This document records prompts used during AI-assisted development of this
project, in approximate chronological order.


## Customer table filtering, sorting, and addresses

> src/app/modules/pages/customer-management-component Adjust the table to allow filtering and sorting. Also show all Address information on the Customer management table

## Navigation and home layout

> Adjust the home screen. Have the homepage heading, along with the Buttons be in the nav. With Nav click affecting the main view. Use this as design reference: [Image #1]

Attached a design reference showing a blue top navigation bar, a left sidebar,
and a main content area containing a table.

## Page folder organization

> correctly organize the folders in the pages directory

## Quote management and deletion confirmation

> Use src/app/modules/pages/customers as reference. Implement a quote management page, that uses the Quote interface in src/app/shared/models/models.ts. Display quotes in a table that should be filterables and sortable by customer and status.
> Create a list of dummy quotes.
>
> On the quotes page, the user should be able to view, create and update quotes - this should be implemented using NgRx store.
> For state, ensure we are using actions, reducers and effects.
> Updates done to the NgRx store should automatically reflect in the UI.
> For record deletion (for Customer and Quote pages) ensure we prompt the user using a mat dialog before deletion

## Customer NgRx clarification

> and Customer page also is utilizing NgRX store with actions, reducers and effects?

## Customer effects

> Do the same for Customers

## Quote status colors

> Give the quote status enum colors matching its status

## Customer-specific quotes

> From the Customer page, add a button to a users row called "View Customer Quotes" that navigates to the Quotes page, where we only show the quotes for that specific customer

## Customer editing and API enrichment

> add a button on the Customer row, on the Customers page, called "Edit" to edit that customer. Use a mat dialog for editing modal, same as for the add customer modal.
>
> In the add/edit form, add an enrichment panel to the modal using mat-sidenav that has the following functionality:
> - Predict nationality from surname:
> hen the surname field has a value (and on a debounced
> change), call the Nationalize API and show the top country predictions with their probabilities.
>
> Let the user confirm or override. Render the predicted countries as selectable options, each
> showing the country name and flag. The user can either:
> • select one of the predictions as the match, or
> • pick a different country entirely from the full country list (searchable dropdown of all
> countries, with flags optional)
>
> Search universities in the chosen country. Once a country is confirmed, use it to drive a search-
> as-you-type university lookup. The user types part of a university name and picks one from the
> results. The selected university (name + website) is stored on the customer record.
>
> Use the attached postman collection for the api endpoints
> /home/paul/Downloads/api-documentation.html

## Larger customer modal

> Enlarge this modal
> [Image #1]

Attached a screenshot of the Edit Customer dialog with customer fields on the
left and nationality predictions, country selection, and university lookup in
the enrichment sidenav on the right.


## Additional session prompts

The following prompts are reproduced in their order within this session.

### Additional customers

> add a few more example customers here

### Customer table fix

> fix the errors in the customer table

### Customer creation with NgRx

> Implememnt a creating new Customer screen, it should create and add a user using Ngrx store


### Navigation logo

> [Image #1] add this logo to the nav.

The attached image is the Budew logo from `/home/paul/Downloads/406 Budew.png`.

### Optional lookup failures and Material errors

> If there are network errors, or the api requests fail, this should not block user requests. We should also inform the user via mat-error that that we could not retreive X information

### Optional deletion of related quotes

> Customer deletion leaves related quotes behind. Those quotes can still appear with a deleted customer, and that customer can remain selectable when editing a quote.
> In the user deletion modal, add a checkbox to confirm if related user quotes should also be deleted - form field optional, should not be required for customer deletion
