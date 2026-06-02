<script lang="ts">
	import { Slider } from '@juspay/svelte-ui-components';
	import { parseNumeric } from '../utils';

	type Variant = 'opacity' | 'font-weight';

	type Props = {
		value: string;
		variant: Variant;
		onChange: (next: string) => void;
	};
	let { value, variant, onChange }: Props = $props();

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
