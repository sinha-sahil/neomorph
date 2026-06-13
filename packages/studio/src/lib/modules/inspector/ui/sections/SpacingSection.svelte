<script lang="ts">
  import type { SpacingSectionProps } from '../../types';
  import InspectorSection from '../InspectorSection.svelte';
  import ValueRow from '../rows/ValueRow.svelte';

  let { ctx }: SpacingSectionProps = $props();
</script>

<InspectorSection title="Spacing">
  <ValueRow
    label="Padding"
    value={ctx.spacingValue('padding')}
    token={ctx.tokenFor('padding')}
    onChange={(v) => ctx.edit('padding', v)}
  />
  <ValueRow
    label="Margin"
    value={ctx.spacingValue('margin')}
    token={ctx.tokenFor('margin')}
    onChange={(v) => ctx.edit('margin', v)}
  />
</InspectorSection>
