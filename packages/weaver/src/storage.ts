import { CssVariableOverrides } from './types';
import { getConfig } from './state';

export function saveTheme(variables: CssVariableOverrides): void {
  try {
    localStorage.setItem(getConfig().persistenceKey, JSON.stringify(variables));
  } catch (e) {
    console.warn('🕸️ Weaver: Failed to save theme:', e);
  }
}

export function loadTheme(): CssVariableOverrides | null {
  try {
    const raw = localStorage.getItem(getConfig().persistenceKey);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('🕸️ Weaver: Failed to load theme:', e);
  }
  return null;
}

export function clearTheme(): void {
  try {
    localStorage.removeItem(getConfig().persistenceKey);
  } catch (e) {
    console.warn('🕸️ Weaver: Failed to clear theme:', e);
  }
}
