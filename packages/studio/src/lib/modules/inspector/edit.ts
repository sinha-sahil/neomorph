export const DISPLAY_OPTIONS = [
  'block',
  'flex',
  'inline-flex',
  'inline-block',
  'grid',
  'inline',
  'none'
];
export const FLEX_DIR_OPTIONS = ['row', 'column', 'row-reverse', 'column-reverse'];
export const JUSTIFY_OPTIONS = [
  'flex-start',
  'center',
  'flex-end',
  'space-between',
  'space-around',
  'space-evenly'
];
export const ALIGN_OPTIONS = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'];
export const WEIGHT_OPTIONS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
export const TEXT_ALIGN_OPTIONS = ['left', 'center', 'right', 'justify', 'start', 'end'];

export function styleOf(map: Record<string, string>, key: string): string {
  const v = map[key];
  return typeof v === 'string' ? v : '';
}

export function quad(map: Record<string, string>, prefix: string): string {
  const t = styleOf(map, `${prefix}-top`);
  const r = styleOf(map, `${prefix}-right`);
  const b = styleOf(map, `${prefix}-bottom`);
  const l = styleOf(map, `${prefix}-left`);
  if (t === r && r === b && b === l) {
    return t;
  }
  return `${t} ${r} ${b} ${l}`;
}

export function selectorLabel(tag: string, classes: string[]): string {
  return classes.length > 0 ? `${tag}.${classes.join('.')}` : tag;
}
