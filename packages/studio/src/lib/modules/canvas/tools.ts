import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { ToolName, ToolState } from './types';

const toolStore: Writable<ToolState> = writable({ active: 'select', spacePanning: false });

export const tools: Readable<ToolState> = { subscribe: toolStore.subscribe };

export function setTool(tool: ToolName): void {
  toolStore.update((s) => ({ ...s, active: tool }));
}

export function setSpacePanning(on: boolean): void {
  toolStore.update((s) => (s.spacePanning === on ? s : { ...s, spacePanning: on }));
}

/** True when a drag should pan the canvas rather than reach the iframe. */
export function isPanning(): boolean {
  const s = get(toolStore);
  return s.active === 'hand' || s.spacePanning;
}
