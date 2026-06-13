<script lang="ts">
  import { TEXT_ALIGN_OPTIONS, WEIGHT_OPTIONS } from '../../edit';
  import type { TypographySectionProps } from '../../types';
  import InspectorSection from '../InspectorSection.svelte';
  import SelectRow from '../rows/SelectRow.svelte';
  import ValueRow from '../rows/ValueRow.svelte';

  let { ctx }: TypographySectionProps = $props();
</script>

<InspectorSection title="Typography">
  <ValueRow
    label="Font"
    value={ctx.valueOf('font-family')}
    token={ctx.tokenFor('font-family')}
    onChange={(v) => ctx.edit('font-family', v)}
  />
  <ValueRow
    label="Size"
    value={ctx.valueOf('font-size')}
    token={ctx.tokenFor('font-size')}
    onChange={(v) => ctx.edit('font-size', v)}
  />
  <SelectRow
    label="Weight"
    value={ctx.valueOf('font-weight')}
    options={WEIGHT_OPTIONS}
    token={ctx.tokenFor('font-weight')}
    onChange={(v) => ctx.edit('font-weight', v)}
  />
  <ValueRow
    label="Line height"
    value={ctx.valueOf('line-height')}
    token={ctx.tokenFor('line-height')}
    onChange={(v) => ctx.edit('line-height', v)}
  />
  <ValueRow
    label="Letter sp."
    value={ctx.valueOf('letter-spacing')}
    onChange={(v) => ctx.edit('letter-spacing', v)}
  />
  <SelectRow
    label="Align"
    value={ctx.valueOf('text-align')}
    options={TEXT_ALIGN_OPTIONS}
    onChange={(v) => ctx.edit('text-align', v)}
  />
</InspectorSection>
