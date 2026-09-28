import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface ConfirmDeleteData {
  kind: 'customer' | 'quote';
  name: string;
}

export interface CustomerDeleteConfirmation {
  confirmed: true;
  deleteRelatedQuotes: boolean;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>Delete {{ data.kind }}?</h2>
    <mat-dialog-content>
      <p>Delete {{ data.name }}? This cannot be undone.</p>
      @if (data.kind === 'customer') {
        <mat-checkbox [checked]="deleteRelatedQuotes" (change)="deleteRelatedQuotes = $event.checked">
          Also delete this customer's quotes
        </mat-checkbox>
        <p>Leave this unchecked to keep the quotes for reassignment.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" cdkFocusInitial>Cancel</button>
      <button
        matButton="filled"
        [mat-dialog-close]="data.kind === 'customer' ? { confirmed: true, deleteRelatedQuotes } : true"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialog {
  readonly data = inject<ConfirmDeleteData>(MAT_DIALOG_DATA);
  deleteRelatedQuotes = false;
}
