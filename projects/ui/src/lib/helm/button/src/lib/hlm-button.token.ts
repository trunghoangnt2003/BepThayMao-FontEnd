import { InjectionToken, type ValueProvider, inject } from '@angular/core';
import type { ButtonDefaults } from './hlm-button.types';

export interface BrnButtonConfig {
  variant: ButtonDefaults['variant'];
  size: ButtonDefaults['size'];
}

const defaultConfig: BrnButtonConfig = {
  variant: 'default',
  size: 'default',
};

const BrnButtonConfigToken = new InjectionToken<BrnButtonConfig>('BrnButtonConfig');

export function provideBrnButtonConfig(config: Partial<BrnButtonConfig>): ValueProvider {
  return { provide: BrnButtonConfigToken, useValue: { ...defaultConfig, ...config } };
}

export function injectBrnButtonConfig(): BrnButtonConfig {
  return inject(BrnButtonConfigToken, { optional: true }) ?? defaultConfig;
}
