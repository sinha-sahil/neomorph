<script lang="ts">
  import { Slider } from '@juspay/svelte-ui-components';
  import type { NumericEditorProps } from '../types';
  import { parseNumeric } from '../utils';

  let { value, variant, onChange }: NumericEditorProps = $props();

  let range = $derived(
    variant === 'opacity' ? { min: 0, max: 1, step: 0.01 } : { min: 100, max: 900, step: 100 }
  );
</script>

<Slider
  value={parseNumeric(value)}
  min={range.min}
  max={range.max}
  step={range.step}
  showValue={true}
  oninput={(val: number) => onChange(String(val))}
  classes="slider-compact"
/>
