<script lang="ts">
  import type { FillSectionProps } from '../../types';
  import InspectorSection from '../InspectorSection.svelte';
  import ColorRow from '../rows/ColorRow.svelte';

  let { ctx }: FillSectionProps = $props();
</script>

<InspectorSection title="Fill">
  <ColorRow
    label="Text"
    value={ctx.valueOf('color')}
    token={ctx.tokenFor('color')}
    onChange={(v) => ctx.edit('color', v)}
  />
  <ColorRow
    label="Background"
    value={ctx.valueOf('background-color')}
    token={ctx.tokenFor('background-color')}
    onChange={(v) => ctx.edit('background-color', v)}
  />
</InspectorSection>
