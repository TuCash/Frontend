// src/app/app.ts
import { Component, inject, signal, ComponentRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LangSwitcherComponent } from './shared/presentation/components/language-switch/lang-switcher.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ModalService } from './shared/infrastructure/services/modal.service';
import { TransactionFormComponent } from './transactions/presentation/pages/transaction-form/transaction-form.component';
import { AccountFormComponent } from './transactions/presentation/pages/account-form/account-form.component';

type FabActionType = 'modal' | 'route';

interface FabOption {
  icon: string;
  label: string;
  class: string;
  action: FabActionType;
  route?: string;
  queryParams?: any;
  modalComponent?: any;
  modalData?: any;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LangSwitcherComponent, CommonModule],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  showBottomNav = false;
  fabMenuOpen = signal(false);
  currentRoute = signal('');
  private currentModalRef?: ComponentRef<any>;

  constructor() {
    this.showBottomNav = !this.isAuthRoute(this.router.url);
    this.currentRoute.set(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showBottomNav = !this.isAuthRoute(event.urlAfterRedirects);
        this.currentRoute.set(event.urlAfterRedirects);
        this.fabMenuOpen.set(false);
      });
  }

  private isAuthRoute(url: string): boolean {
    return url.startsWith('/auth/login') || url.startsWith('/auth/register') || url.startsWith('/login') || url.startsWith('/register');
  }

  toggleFabMenu(): void {
    this.fabMenuOpen.update(open => !open);
  }

  closeFabMenu(): void {
    this.fabMenuOpen.set(false);
  }

  getFabOptions(): FabOption[] {
    // Siempre mostrar las mismas 3 opciones en todas las vistas
    // Esto permite registrar ingresos/egresos desde cualquier página
    return [
      {
        icon: '⬆️',
        label: 'fab.newIncome',
        class: 'fab-option-income',
        action: 'modal',
        modalComponent: TransactionFormComponent,
        modalData: { initialType: 'INCOME' }
      },
      {
        icon: '⬇️',
        label: 'fab.newExpense',
        class: 'fab-option-expense',
        action: 'modal',
        modalComponent: TransactionFormComponent,
        modalData: { initialType: 'EXPENSE' }
      },
      {
        icon: '💳',
        label: 'fab.newAccount',
        class: 'fab-option-account',
        action: 'modal',
        modalComponent: AccountFormComponent,
        modalData: {}
      },
    ];
  }

  handleFabOptionClick(option: FabOption): void {
    this.closeFabMenu();

    if (option.action === 'modal' && option.modalComponent) {
      this.openModal(option.modalComponent, option.modalData);
    } else if (option.action === 'route' && option.route) {
      this.router.navigate([option.route], { queryParams: option.queryParams });
    }
  }

  private openModal(component: any, data?: any): void {
    const modalData = {
      isModal: true,
      ...data,
      onClose: () => this.closeModal(),
      onSuccess: () => {
        this.closeModal();
        // Force reload by navigating away and back
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    };

    this.currentModalRef = this.modalService.open(component, modalData);
  }

  private closeModal(): void {
    if (this.currentModalRef) {
      this.modalService.close(this.currentModalRef);
      this.currentModalRef = undefined;
    }
  }
}
