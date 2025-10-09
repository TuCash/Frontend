// lang-switcher.component.ts con flecha indicadora y banderas redondeadas mejoradas
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/i18n/language.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switcher">
      <button class="lang-btn" (click)="toggleDropdown()">
        <img [src]="getFlag(lang.current())" class="flag" />
        {{ getName(lang.current()) }}
        <span class="arrow">▾</span>
      </button>

      <ul *ngIf="open" class="lang-dropdown">
        <li *ngFor="let l of lang.available()" (click)="select(l)">
          <img [src]="getFlag(l)" class="flag" />
          {{ getName(l) }}
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['lang-switcher.component.css']
})
export class LangSwitcherComponent {
  lang = inject(LanguageService);
  open = false;

  toggleDropdown() {
    this.open = !this.open;
  }

  close() {
    this.open = false;
  }

  select(lang: string) {
    this.lang.use(lang as any);
    this.close();
  }

  getFlag(lang: string): string {
    return `assets/flags/${lang}.png`;
  }

  getName(lang: string): string {
    return {
      es: 'Español',
      en: 'Inglés',
      pt: 'Português'
    }[lang] || lang.toUpperCase();
  }
}