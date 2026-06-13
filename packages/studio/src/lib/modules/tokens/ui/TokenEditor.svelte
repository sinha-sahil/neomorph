<script lang="ts">
  import type { TokenEditorProps } from '../types';
  import { editorForKind } from '../utils';
  import NumericEditor from './NumericEditor.svelte';
  import TextEditor from './TextEditor.svelte';

  let { variable, value, onChange }: TokenEditorProps = $props();

  let variant = $derived(editorForKind(variable.kind));
</script>

{#if variant === 'opacity-slider'}
  <NumericEditor {value} variant="opacity" {onChange} />
{:else if variant === 'font-weight-slider'}
  <NumericEditor {value} variant="font-weight" {onChange} />
{:else}
  <TextEditor {value} {onChange} />
{/if}
