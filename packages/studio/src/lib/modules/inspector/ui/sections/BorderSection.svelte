<script lang="ts">
  import { styleOf } from '../../edit';
  import type { BorderSectionProps } from '../../types';
  import InspectorSection from '../InspectorSection.svelte';
  import ColorRow from '../rows/ColorRow.svelte';
  import ValueRow from '../rows/ValueRow.svelte';
  import PropRow from '../rows/PropRow.svelte';

  let { ctx, selected }: BorderSectionProps = $props();
</script>

<InspectorSection title="Border & effects">
  <ColorRow
    label="Border"
    value={ctx.valueOf('border-color')}
    token={ctx.tokenFor('border-color')}
    onChange={(v) => ctx.edit('border-color', v)}
  />
  <ValueRow
    label="Radius"
    value={ctx.valueOf('border-radius')}
    token={ctx.tokenFor('border-radius')}
    onChange={(v) => ctx.edit('border-radius', v)}
  />
  <ValueRow
    label="Opacity"
    value={ctx.valueOf('opacity')}
    onChange={(v) => ctx.edit('opacity', v)}
  />
  <PropRow label="Shadow" value={styleOf(selected.computedStyles, 'box-shadow')} />
</InspectorSection>
