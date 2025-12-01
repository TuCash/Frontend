/**
 * Shared Kernel - Language Service
 * Servicio de internacionalización (i18n)
 */

import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const KEY = 'lang';
const SUPPORTED = ['es', 'en', 'pt'] as const;
type Lang = typeof SUPPORTED[number];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private t = inject(TranslateService);

  constructor() {
    this.t.addLangs([...SUPPORTED]);

    const browser = (this.t.getBrowserLang() || 'es').slice(0, 2);
    const saved = (localStorage.getItem(KEY) || '') as Lang;

    const start =
      (SUPPORTED as readonly string[]).includes(saved) ? saved :
      (SUPPORTED as readonly string[]).includes(browser) ? (browser as Lang) :
      'es';

   
    this.t.setFallbackLang('es');

    this.t.use(start);
  }

  use(lang: Lang) {
    this.t.use(lang);
    localStorage.setItem(KEY, lang);
  }

  current(): Lang {
   
    return (this.t.getCurrentLang() as Lang) || 'es';
  }

  available(): Lang[] {
    return [...SUPPORTED];
  }
}
