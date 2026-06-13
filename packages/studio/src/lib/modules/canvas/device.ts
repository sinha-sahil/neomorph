import { derived, writable, type Readable, type Writable } from 'svelte/store';
import { fit, setArtboardSize } from './camera';
import type { DeviceMode, DeviceSize } from './types';

const DESKTOP: DeviceSize = { width: 1280, height: 800 };
const MOBILE: DeviceSize = { width: 390, height: 844 };

function sizeFor(mode: DeviceMode): DeviceSize {
  return mode === 'mobile' ? MOBILE : DESKTOP;
}

const deviceStore: Writable<DeviceMode> = writable('desktop');

export const device: Readable<DeviceMode> = { subscribe: deviceStore.subscribe };

export const deviceSize: Readable<DeviceSize> = derived(deviceStore, sizeFor);

export function setDevice(mode: DeviceMode): void {
  deviceStore.set(mode);
  const size = sizeFor(mode);
  // Resize the artboard the camera frames, then re-fit so the new viewport is centred.
  setArtboardSize(size.width, size.height);
  fit();
}
