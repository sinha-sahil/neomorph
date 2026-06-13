import { writable, type Readable, type Writable } from 'svelte/store';
import type { StudioThemeMode } from './types';

const themeModeStore: Writable<StudioThemeMode> = writable('light');

export const themeMode: Readable<StudioThemeMode> = { subscribe: themeModeStore.subscribe };

export function setThemeMode(mode: StudioThemeMode): void {
  themeModeStore.set(mode);
}

export function toggleThemeMode(): void {
  themeModeStore.update((mode) => (mode === 'light' ? 'dark' : 'light'));
}
