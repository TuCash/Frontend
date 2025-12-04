/**
 * IAM Bounded Context - Presentation Layer
 * Profile Page Component
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IamQueryService } from '../../../application/internal/queryservices/iam-query.service';
import { IamCommandService } from '../../../application/internal/commandservices/iam-command.service';
import { SignInResponse } from '../../resources/sign-in.resource';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
})
export class ProfilePageComponent implements OnInit {
  private readonly iamQueryService = inject(IamQueryService);
  private readonly iamCommandService = inject(IamCommandService);

  user: SignInResponse | null = null;
  readonly showLogoutConfirm = signal(false);

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    this.user = this.iamQueryService.getCurrentUser();
  }

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
