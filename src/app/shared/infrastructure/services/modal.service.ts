/**
 * Shared - Infrastructure Layer
 * Simple Modal Service
 */

import { Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private overlayElement: HTMLElement | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open<T>(component: Type<T>, data?: any): ComponentRef<T> {
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'modal-overlay';
    document.body.appendChild(this.overlayElement);

    // Create component container
    const container = document.createElement('div');
    container.className = 'modal-container';
    this.overlayElement.appendChild(container);

    // Create component
    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
      hostElement: container
    });

    // Pass data if provided
    if (data && componentRef.instance) {
      Object.assign(componentRef.instance as any, data);
    }

    // Attach to application
    this.appRef.attachView(componentRef.hostView);

    // Close on overlay click
    this.overlayElement.addEventListener('click', (e) => {
      if (e.target === this.overlayElement) {
        this.close(componentRef);
      }
    });

    return componentRef;
  }

  close<T>(componentRef: ComponentRef<T>): void {
    if (componentRef) {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    }

    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
      this.overlayElement = null;
    }
  }
}
