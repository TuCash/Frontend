import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GoalsService, Goal } from './goals.service';
import { AuthService } from '../auth/auth.service';
import { forkJoin } from 'rxjs';
import { GoalFormDialogComponent } from './goal-form-dialog.component';

interface GoalsTotals {
  totalGoals: number;
  totalTarget: number;
  totalSaved: number;
  remaining: number;
}

@Component({
  selector: 'app-goals-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, TranslateModule],
  templateUrl: './goals-page.component.html',
  styleUrls: ['./goals-page.component.css'],
})
export class GoalsPageComponent implements OnInit {
  private readonly goalsService = inject(GoalsService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  readonly currency = 'S/';
  readonly goals = signal<Goal[]>([]);
  readonly totals = signal<GoalsTotals>({
    totalGoals: 0,
    totalTarget: 0,
    totalSaved: 0,
    remaining: 0,
  });

  isLoading = true;
  loadError = '';

  get authUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
  }

  openGoalDialog(): void {
    const dialogRef = this.dialog.open(GoalFormDialogComponent, { width: '480px' });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      const user = this.authUser;
      if (!user) {
        this.loadError = 'goals.errors.noUser';
        return;
      }

      const payload = {
        userId: user.id,
        title: result.title,
        targetAmount: Number(result.targetAmount),
        savedAmount: Number(result.savedAmount),
        deadline: result.deadline ? new Date(result.deadline).toISOString() : undefined,
        notes: result.notes ?? '',
      };

      this.goalsService.createGoal(payload).subscribe({
        next: () => this.loadData(),
        error: error => {
          console.error('Failed to create goal', error);
          this.loadError = 'goals.errors.create';
        },
      });
    });
  }

  reload(): void {
    this.loadData();
  }

  goBack(): void {
    window.history.back();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace('PEN', this.currency)
      .trim();
  }

  progress(goal: Goal): number {
    if (goal.targetAmount === 0) {
      return 0;
    }
    const value = (goal.savedAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  formatDate(date?: string): string {
    if (!date) {
      return this.translate.instant('goals.labels.noDeadline');
    }
    return new Intl.DateTimeFormat(this.translate.currentLang || 'es', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(date));
  }

  private loadData(): void {
    const user = this.authUser;
    if (!user) {
      this.isLoading = false;
      this.loadError = 'goals.errors.noUser';
      return;
    }

    this.isLoading = true;
    this.loadError = '';

    this.goalsService.listGoals(user.id).subscribe({
      next: goals => {
        const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
        this.goals.set(
          goals.sort((a, b) => (b.deadline ? new Date(b.deadline).getTime() : 0) - (a.deadline ? new Date(a.deadline).getTime() : 0))
        );
        this.totals.set({
          totalGoals: goals.length,
          totalTarget,
          totalSaved,
          remaining: totalTarget - totalSaved,
        });
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load goals', error);
        this.isLoading = false;
        this.loadError = 'goals.errors.load';
      },
    });
  }
}
