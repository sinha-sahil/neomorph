<script lang="ts">
  import { ALIGN_OPTIONS, DISPLAY_OPTIONS, FLEX_DIR_OPTIONS, JUSTIFY_OPTIONS } from '../../edit';
  import type { LayoutSectionProps } from '../../types';
  import InspectorSection from '../InspectorSection.svelte';
  import SelectRow from '../rows/SelectRow.svelte';
  import ValueRow from '../rows/ValueRow.svelte';

  let { ctx }: LayoutSectionProps = $props();
</script>

<InspectorSection title="Layout">
  <SelectRow
    label="Display"
    value={ctx.valueOf('display')}
    options={DISPLAY_OPTIONS}
    onChange={(v) => ctx.edit('display', v)}
  />
  <ValueRow label="Width" value={ctx.valueOf('width')} onChange={(v) => ctx.edit('width', v)} />
  <ValueRow label="Height" value={ctx.valueOf('height')} onChange={(v) => ctx.edit('height', v)} />
  {#if ctx.valueOf('display').includes('flex')}
    <SelectRow
      label="Direction"
      value={ctx.valueOf('flex-direction')}
      options={FLEX_DIR_OPTIONS}
      onChange={(v) => ctx.edit('flex-direction', v)}
    />
    <SelectRow
      label="Justify"
      value={ctx.valueOf('justify-content')}
      options={JUSTIFY_OPTIONS}
      onChange={(v) => ctx.edit('justify-content', v)}
    />
    <SelectRow
      label="Align"
      value={ctx.valueOf('align-items')}
      options={ALIGN_OPTIONS}
      onChange={(v) => ctx.edit('align-items', v)}
    />
    <ValueRow label="Gap" value={ctx.valueOf('gap')} onChange={(v) => ctx.edit('gap', v)} />
  {/if}
</InspectorSection>
