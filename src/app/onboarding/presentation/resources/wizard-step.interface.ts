/**
 * Onboarding - Presentation Layer
 * Wizard Step Interface
 */

export interface WizardStep {
  id: number;
  titleKey: string;
  completed: boolean;
  optional: boolean;
}
