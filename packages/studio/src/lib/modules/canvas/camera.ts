import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import type { Camera, WorldRect } from './types';

/** The target app renders into a fixed-size artboard inside the infinite canvas. */
export const ARTBOARD_WIDTH = 1280;
export const ARTBOARD_HEIGHT = 800;

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;
const FIT_PADDING = 64;
const ZOOM_STEP = 1.2;

const cameraStore: Writable<Camera> = writable({ x: 0, y: 0, z: 1 });

export const camera: Readable<Camera> = { subscribe: cameraStore.subscribe };

export const zoomPercent: Readable<number> = derived(cameraStore, (c) => Math.round(c.z * 100));

/** Last known viewport size, kept here so toolbar controls can zoom about the centre. */
const viewport = { width: 0, height: 0 };

/** Current artboard (device) size; updated when the device view changes. */
const artboard = { width: ARTBOARD_WIDTH, height: ARTBOARD_HEIGHT };

export function setArtboardSize(width: number, height: number): void {
  artboard.width = width;
  artboard.height = height;
}

function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

export function setViewportSize(width: number, height: number): void {
  viewport.width = width;
  viewport.height = height;
}

export function screenToWorld(cx: number, cy: number): { x: number; y: number } {
  const c = get(cameraStore);
  return { x: (cx - c.x) / c.z, y: (cy - c.y) / c.z };
}

export function worldToScreen(wx: number, wy: number): { x: number; y: number } {
  const c = get(cameraStore);
  return { x: wx * c.z + c.x, y: wy * c.z + c.y };
}

export function panBy(dx: number, dy: number): void {
  cameraStore.update((c) => ({ x: c.x + dx, y: c.y + dy, z: c.z }));
}

/** Zoom by `factor`, keeping the world point under (cx, cy) fixed on screen. */
export function zoomToPoint(cx: number, cy: number, factor: number): void {
  cameraStore.update((c) => {
    const worldX = (cx - c.x) / c.z;
    const worldY = (cy - c.y) / c.z;
    const z = clampZoom(c.z * factor);
    return { x: cx - worldX * z, y: cy - worldY * z, z };
  });
}

export function fitTo(viewportWidth: number, viewportHeight: number): void {
  const availableW = Math.max(1, viewportWidth - FIT_PADDING * 2);
  const availableH = Math.max(1, viewportHeight - FIT_PADDING * 2);
  const z = clampZoom(Math.min(availableW / artboard.width, availableH / artboard.height, 1));
  cameraStore.set({
    x: (viewportWidth - artboard.width * z) / 2,
    y: (viewportHeight - artboard.height * z) / 2,
    z
  });
}

export function resetZoom(viewportWidth: number, viewportHeight: number): void {
  cameraStore.set({
    x: (viewportWidth - artboard.width) / 2,
    y: (viewportHeight - artboard.height) / 2,
    z: 1
  });
}

/** Frame a world-space rect inside the viewport (used by zoom-to-selection in Phase 2). */
export function zoomToRect(rect: WorldRect, viewportWidth: number, viewportHeight: number): void {
  const availableW = Math.max(1, viewportWidth - FIT_PADDING * 2);
  const availableH = Math.max(1, viewportHeight - FIT_PADDING * 2);
  const z = clampZoom(Math.min(availableW / rect.width, availableH / rect.height));
  cameraStore.set({
    x: (viewportWidth - rect.width * z) / 2 - rect.x * z,
    y: (viewportHeight - rect.height * z) / 2 - rect.y * z,
    z
  });
}

export function zoomInCentered(): void {
  zoomToPoint(viewport.width / 2, viewport.height / 2, ZOOM_STEP);
}

export function zoomOutCentered(): void {
  zoomToPoint(viewport.width / 2, viewport.height / 2, 1 / ZOOM_STEP);
}

export function fit(): void {
  fitTo(viewport.width, viewport.height);
}

export function resetView(): void {
  resetZoom(viewport.width, viewport.height);
}
