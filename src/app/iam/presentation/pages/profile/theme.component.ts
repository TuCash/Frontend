/**
 * IAM Bounded Context - Presentation Layer
 * Theme Settings Component
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

type ThemeMode = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css'],
})
export class ThemeComponent implements OnInit {
  private readonly router = inject(Router);

  readonly saveSuccess = signal(false);
  readonly currentTheme = signal<ThemeMode>('light');

  readonly themes: { id: ThemeMode; icon: string; labelKey: string }[] = [
    { id: 'light', icon: '☀️', labelKey: 'profile.theme.light' },
    { id: 'dark', icon: '🌙', labelKey: 'profile.theme.dark' },
    { id: 'system', icon: '💻', labelKey: 'profile.theme.system' },
  ];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    }
  }

  selectTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);

    // Apply theme
    this.applyTheme(theme);

    // Show success
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 2000);
  }

  private applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  onBack(): void {
    this.router.navigate(['/iam/profile']);
  }
}
