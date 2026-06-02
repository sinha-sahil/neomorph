<script lang="ts">
	import type { DefinedVariable } from '../types';
	import { editorForKind } from '../utils';
	import NumericEditor from './NumericEditor.svelte';
	import TextEditor from './TextEditor.svelte';

	type Props = {
		variable: DefinedVariable;
		value: string;
		onChange: (next: string) => void;
	};
	let { variable, value, onChange }: Props = $props();

	let variant = $derived(editorForKind(variable.kind));
</script>

{#if variant === 'opacity-slider'}
	<NumericEditor {value} variant="opacity" {onChange} />
{:else if variant === 'font-weight-slider'}
	<NumericEditor {value} variant="font-weight" {onChange} />
{:else}
	<TextEditor {value} {onChange} />
{/if}
