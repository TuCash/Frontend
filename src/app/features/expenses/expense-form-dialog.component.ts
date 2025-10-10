import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

export interface ExpenseFormData {
  categories: Array<{ value: string; label: string; icon: string }>;
}

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'expenses.form.title' | translate }}</h2>
    <form [formGroup]="expenseForm" (ngSubmit)="submit()" mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'expenses.form.description' | translate }}</mat-label>
        <input matInput formControlName="description" />
        <mat-error *ngIf="expenseForm.get('description')?.hasError('required')">
          {{ 'expenses.form.errors.description' | translate }}
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'expenses.form.amount' | translate }}</mat-label>
        <input matInput type="number" step="0.01" min="0" formControlName="amount" />
        <mat-error *ngIf="expenseForm.get('amount')?.hasError('min') || expenseForm.get('amount')?.hasError('required')">
          {{ 'expenses.form.errors.amount' | translate }}
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'expenses.form.category' | translate }}</mat-label>
        <mat-select formControlName="category">
          <mat-option *ngFor="let category of data.categories" [value]="category.value">
            {{ category.icon }} {{ category.label | translate }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'expenses.form.date' | translate }}</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="date" />
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'expenses.form.notes' | translate }}</mat-label>
        <textarea matInput rows="3" formControlName="notes"></textarea>
      </mat-form-field>

      <mat-checkbox formControlName="recurring">
        {{ 'expenses.form.recurring' | translate }}
      </mat-checkbox>
    </form>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()">
        {{ 'expenses.form.cancel' | translate }}
      </button>
      <button mat-flat-button color="primary" type="submit" (click)="submit()" [disabled]="expenseForm.invalid">
        {{ 'expenses.form.submit' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .full-width {
        width: 100%;
      }
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    `,
  ],
})
export class ExpenseFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ExpenseFormDialogComponent>);
  readonly data: ExpenseFormData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly expenseForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    category: [this.data.categories[0]?.value ?? 'other', Validators.required],
    date: [new Date(), Validators.required],
    notes: [''],
    recurring: [false],
  });

  submit(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.expenseForm.value);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
