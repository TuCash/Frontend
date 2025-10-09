import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { ProfileService, Profile } from './profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
})
export class ProfilePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly user = signal(this.authService.getCurrentUser());
  readonly profile = signal<Profile | null>(null);

  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    const user = this.user();
    if (!user) {
      this.handleLogout();
      return;
    }

    this.profileService.getProfile(user.id).subscribe({
      next: profile => {
        this.profile.set(profile[0] ?? null);
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load profile', error);
        this.loadError = 'profile.errors.load';
        this.isLoading = false;
      },
    });
  }

  handleLogout(): void {
    this.authService.logout();
    this.user.set(null);
    this.profile.set(null);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
