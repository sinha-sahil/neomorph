import { WeaverConfig } from './types';

const DEFAULT_CONFIG: WeaverConfig = {
  debounceMs: 250,
  persistenceKey: '__neomorph_theme',
  persistByDefault: false,
  hostFilter: null
};

let currentConfig: WeaverConfig = { ...DEFAULT_CONFIG };
let applying = false;

export function getConfig(): Readonly<WeaverConfig> {
  return currentConfig;
}

export function updateConfig(partial: Partial<WeaverConfig>): void {
  currentConfig = { ...currentConfig, ...partial };
}

export function loadConfigFromWindow(): void {
  const descriptor = Object.getOwnPropertyDescriptor(window, '__NEOMORPH_CONFIG__');
  if (descriptor === null) {
    return;
  }
  const globalConfig = descriptor?.value;
  if (globalConfig !== null && typeof globalConfig === 'object') {
    updateConfig(globalConfig);
  }
}

export function setApplying(value: boolean): void {
  applying = value;
}

export function isApplying(): boolean {
  return applying;
}
