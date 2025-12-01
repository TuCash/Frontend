/**
 * IAM Bounded Context - Presentation Layer
 * Profile Page Component
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IamQueryService } from '../../../application/internal/queryservices/iam-query.service';
import { IamCommandService } from '../../../application/internal/commandservices/iam-command.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
})
export class ProfilePageComponent {
  private readonly iamQueryService = inject(IamQueryService);
  private readonly iamCommandService = inject(IamCommandService);

  readonly user = this.iamQueryService.getCurrentUser();
  readonly showLogoutConfirm = signal(false);

  onLogout(): void {
    this.showLogoutConfirm.set(true);
  }

  confirmLogout(): void {
    this.iamCommandService.logout();
    window.location.href = '/auth/login';
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }
}
