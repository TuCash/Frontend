/**
 * IAM Bounded Context - Presentation Layer
 * Language Settings Component
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.css'],
})
export class LanguageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly saveSuccess = signal(false);
  readonly currentLanguage = signal('es');

  readonly languages: Language[] = [
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ];

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang') || this.translate.currentLang || 'es';
    this.currentLanguage.set(savedLang);
  }

  selectLanguage(langCode: string): void {
    this.currentLanguage.set(langCode);
    localStorage.setItem('lang', langCode);
    this.translate.use(langCode);

    // Show success
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 2000);
  }

  onBack(): void {
    this.router.navigate(['/iam/profile']);
  }
}
