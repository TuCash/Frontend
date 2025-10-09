import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-goal-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'goals.form.title' | translate }}</h2>
    <form [formGroup]="goalForm" (ngSubmit)="submit()" mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'goals.form.titleLabel' | translate }}</mat-label>
        <input matInput formControlName="title" />
        <mat-error *ngIf="goalForm.get('title')?.hasError('required')">
          {{ 'goals.form.errors.title' | translate }}
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'goals.form.targetAmount' | translate }}</mat-label>
        <input matInput type="number" step="0.01" min="0" formControlName="targetAmount" />
        <mat-error *ngIf="goalForm.get('targetAmount')?.invalid">
          {{ 'goals.form.errors.targetAmount' | translate }}
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'goals.form.savedAmount' | translate }}</mat-label>
        <input matInput type="number" step="0.01" min="0" formControlName="savedAmount" />
        <mat-error *ngIf="goalForm.get('savedAmount')?.invalid">
          {{ 'goals.form.errors.savedAmount' | translate }}
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'goals.form.deadline' | translate }}</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="deadline" />
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'goals.form.notes' | translate }}</mat-label>
        <textarea matInput rows="3" formControlName="notes"></textarea>
      </mat-form-field>
    </form>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()">
        {{ 'goals.form.cancel' | translate }}
      </button>
      <button mat-flat-button color="primary" type="submit" (click)="submit()" [disabled]="goalForm.invalid">
        {{ 'goals.form.submit' | translate }}
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
export class GoalFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<GoalFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly goalForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    targetAmount: [null, [Validators.required, Validators.min(0.01)]],
    savedAmount: [0, [Validators.required, Validators.min(0)]],
    deadline: [null],
    notes: [''],
  });

  submit(): void {
    if (this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.goalForm.value);
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
