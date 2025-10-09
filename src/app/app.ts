// src/app/app.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LangSwitcherComponent } from './shared/presentation/components/language-switch/lang-switcher.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LangSwitcherComponent, CommonModule],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  showBottomNav = false;

  constructor() {
    this.showBottomNav = !this.isAuthRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showBottomNav = !this.isAuthRoute(event.urlAfterRedirects);
      });
  }

  private isAuthRoute(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/register');
  }
}
