<script lang="ts">
	import { ColorPicker, Pill } from '@juspay/svelte-ui-components';
	import type { DefinedVariable } from '../types';
	import { kindGlyph, kindGroup, resolveSwatchValue, rowTooltip } from '../utils';
	import { edits } from '../store';
	import { applyEdit } from '../sdk-bridge';
	import TokenEditor from './TokenEditor.svelte';

	type Props = {
		variable: DefinedVariable;
		host: string;
	};
	let { variable, host }: Props = $props();

	let current = $derived.by(() => {
		const hostEdits = $edits[host];
		if (typeof hostEdits === 'object') {
			const edited = hostEdits[variable.name];
			if (typeof edited === 'string') {
				return edited;
			}
		}
		return variable.resolvedValue;
	});

	let swatchValue = $derived(resolveSwatchValue(current, variable.resolvedValue));

	function handleChange(next: string): void {
		applyEdit(host, variable.name, current, next);
	}
</script>

<div
	class={'var-row kind-' + variable.kind}
	title={rowTooltip(variable.name, variable.kind, variable.consumedBy)}
>
	<div class="var-leader">
		{#if variable.kind === 'color'}
			<ColorPicker
				value={swatchValue}
				showValue={false}
				oninput={(val: string) => handleChange(val)}
				classes="colorpicker-swatch"
			/>
		{:else}
			<Pill
				text={kindGlyph(variable.kind)}
				classes={'pill-kind pill-kind-' + kindGroup(variable.kind)}
			/>
		{/if}
	</div>
	<span class="var-name">{variable.name}</span>
	<div class="var-editor">
		<TokenEditor {variable} value={current} onChange={handleChange} />
	</div>
</div>

<style>
	.var-row {
		display: grid;
		grid-template-columns: 20px minmax(110px, 1fr) 130px;
		align-items: center;
		column-gap: 10px;
		padding: 4px 14px;
		min-height: 30px;
		transition: background 0.08s ease;
	}

	.var-row:hover {
		background: var(--bg-row-hover);
	}

	.var-leader {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
	}

	.var-name {
		font-family: var(--font-mono);
		font-size: 11.5px;
		color: var(--text);
		font-weight: 500;
		letter-spacing: -0.005em;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.var-editor {
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.var-editor > :global(*) {
		width: 100%;
		min-width: 0;
	}
</style>
