/**
 * Stub Component - To be implemented
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reminders-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stub-container">
      <h2>Reminders</h2>
      <p>This component will be implemented soon.</p>
    </div>
  `,
  styles: [`
    .stub-container {
      padding: 2rem;
      text-align: center;
      color: #666;
    }
  `]
})
export class RemindersListComponent {}
