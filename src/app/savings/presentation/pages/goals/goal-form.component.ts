/**
 * Savings Bounded Context - Presentation Layer
 * Goal Form Component
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SavingsCommandService } from '../../../application/internal/commandservices/savings-command.service';
import { SavingsQueryService } from '../../../application/internal/queryservices/savings-query.service';
import { CreateGoalCommand } from '../../../domain/model/commands/create-goal.command';
import { UpdateGoalCommand } from '../../../domain/model/commands/update-goal.command';
import { getTodayFormatted } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './goal-form.component.html',
  styleUrls: ['./goal-form.component.css'],
})
export class GoalFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly savingsCommandService = inject(SavingsCommandService);
  private readonly savingsQueryService = inject(SavingsQueryService);

  // Modal support
  isModal = false;
  goalId?: number;
  onClose?: () => void;
  onSuccess?: () => void;

  // State signals
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  readonly isEditMode = signal(false);

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  goalForm!: FormGroup;

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode (goalId provided from modal data)
    if (this.goalId) {
      this.isEditMode.set(true);
      this.setDisabledState();
      this.loadGoal(this.goalId);
    }
  }

  private initForm(): void {
    this.goalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      targetAmount: [null, [Validators.required, Validators.min(0.01)]],
      currentAmount: [0],
      deadline: [getTodayFormatted(), Validators.required],
    });
  }

  private loadGoal(id: number): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.savingsQueryService.handleGetGoalById(id).subscribe({
      next: (goal) => {
        this.goalForm.patchValue({
          name: goal.name,
          description: goal.description || '',
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline.split('T')[0], // Format date for input
        });

        // En modo edición: solo se puede modificar targetAmount y deadline
        // name y description quedan deshabilitados
        this.goalForm.get('name')?.disable();
        this.goalForm.get('description')?.disable();
        // targetAmount y deadline quedan habilitados para editar

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading goal:', error);
        this.loadError.set('goals.errors.loadGoals');
        this.isLoading.set(false);
      },
    });
  }

  private setDisabledState(): void {
    if (this.isEditMode()) {
      // Solo deshabilitar name y description
      // targetAmount y deadline se pueden editar
      this.goalForm.get('name')?.disable();
      this.goalForm.get('description')?.disable();
    }
  }

  onSubmit(): void {
    if (this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    const formValue = this.goalForm.value;

    if (this.isEditMode()) {
      // Update goal (targetAmount and deadline only)
      const command = new UpdateGoalCommand(
        this.goalId!,
        formValue.targetAmount,
        formValue.deadline
      );

      this.savingsCommandService.handleUpdateGoal(command).subscribe({
        next: () => {
          this.isSaving.set(false);

          // If modal, call success callback
          if (this.isModal && this.onSuccess) {
            this.onSuccess();
          }
        },
        error: (error) => {
          console.error('❌ Error updating goal:', error);
          this.saveError.set('goals.form.errors.save');
          this.isSaving.set(false);
        },
      });
    } else {
      // Create new goal
      const command = new CreateGoalCommand(
        formValue.name,
        formValue.description,
        formValue.targetAmount,
        formValue.deadline
      );

      this.savingsCommandService.handleCreateGoal(command).subscribe({
        next: () => {
          this.isSaving.set(false);

          // If modal, call success callback
          if (this.isModal && this.onSuccess) {
            this.onSuccess();
          }
        },
        error: (error) => {
          console.error('❌ Error creating goal:', error);
          this.saveError.set('goals.form.errors.save');
          this.isSaving.set(false);
        },
      });
    }
  }

  cancel(): void {
    if (this.isModal && this.onClose) {
      this.onClose();
    }
  }

  // Helper methods
  getFieldError(fieldName: string): string | null {
    const field = this.goalForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'goals.form.errors.required';
      }
      if (field.errors?.['min']) {
        return 'goals.form.errors.minAmount';
      }
      if (field.errors?.['minlength']) {
        return 'goals.form.errors.required';
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.goalForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
