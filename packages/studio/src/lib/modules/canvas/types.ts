export type Camera = { x: number; y: number; z: number };
export type WorldRect = { x: number; y: number; width: number; height: number };

export type ToolName = 'select' | 'hand';

export type ToolState = {
  active: ToolName;
  spacePanning: boolean;
};

export type DeviceMode = 'desktop' | 'mobile';

export type DeviceSize = { width: number; height: number };
