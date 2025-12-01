/**
 * Savings Bounded Context - Presentation Layer
 * Goals List Component
 */

import { Component, inject, OnInit, signal, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SavingsQueryService } from '../../../application/internal/queryservices/savings-query.service';
import { SavingsCommandService } from '../../../application/internal/commandservices/savings-command.service';
import { GetAllGoalsQuery } from '../../../domain/model/queries/get-all-goals.query';
import { GoalResource } from '../../resources/goal.resource';
import { ModalService } from '../../../../shared/infrastructure/services/modal.service';
import { GoalFormComponent } from './goal-form.component';
import { GoalContributionComponent } from './goal-contribution.component';

@Component({
  selector: 'app-goals-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.css'],
})
export class GoalsListComponent implements OnInit {
  private readonly savingsQueryService = inject(SavingsQueryService);
  private readonly savingsCommandService = inject(SavingsCommandService);
  private readonly modalService = inject(ModalService);

  // State signals
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly goals = signal<GoalResource[]>([]);
  private currentModalRef?: ComponentRef<any>;

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.savingsQueryService.handleGetAllGoals(new GetAllGoalsQuery()).subscribe({
      next: (goals) => {
        console.log('✅ Goals loaded:', goals);
        this.goals.set(goals);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading goals:', error);
        this.loadError.set('goals.errors.loadGoals');
        this.isLoading.set(false);
      },
    });
  }

  deleteGoal(goalId: number): void {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) {
      return;
    }

    this.savingsCommandService.handleDeleteGoal(goalId).subscribe({
      next: () => {
        console.log('✅ Goal deleted');
        this.loadGoals();
      },
      error: (error) => {
        console.error('❌ Error deleting goal:', error);
        alert('Error al eliminar la meta');
      },
    });
  }

  // Helper methods
  getProgressPercentage(goal: GoalResource): number {
    if (goal.targetAmount === 0) return 0;
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
  }

  getProgressClass(percentage: number): string {
    if (percentage >= 100) return 'progress-complete';
    if (percentage >= 75) return 'progress-high';
    if (percentage >= 50) return 'progress-medium';
    if (percentage >= 25) return 'progress-low';
    return 'progress-minimal';
  }

  getDaysRemaining(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  formatAmount(amount: number): string {
    return `S/${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // Modal methods
  openNewGoalModal(): void {
    this.openGoalModal();
  }

  openEditGoalModal(goalId: number): void {
    this.openGoalModal(goalId);
  }

  private openGoalModal(goalId?: number): void {
    const modalData = {
      isModal: true,
      goalId,
      onClose: () => this.closeModal(),
      onSuccess: () => {
        this.closeModal();
        this.loadGoals();
      },
    };

    this.currentModalRef = this.modalService.open(GoalFormComponent, modalData);
  }

  private closeModal(): void {
    if (this.currentModalRef) {
      this.modalService.close(this.currentModalRef);
      this.currentModalRef = undefined;
    }
  }

  // Contribution modal
  openContributionModal(goal: GoalResource): void {
    const modalData = {
      isModal: true,
      goalId: goal.id,
      goalName: goal.name,
      onClose: () => this.closeModal(),
      onSuccess: () => {
        this.loadGoals();
      },
    };

    this.currentModalRef = this.modalService.open(GoalContributionComponent, modalData);
  }
}
