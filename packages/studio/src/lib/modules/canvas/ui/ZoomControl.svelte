<script lang="ts">
  import { Button, Tooltip } from '@juspay/svelte-ui-components';
  import { resetView, zoomPercent } from '../camera';
</script>

<Tooltip text="Reset zoom to 100%" position="bottom" classes="tooltip-studio">
  <Button ariaLabel="Reset zoom to 100 percent" onclick={resetView} classes="zoom-readout">
    {$zoomPercent}%
  </Button>
</Tooltip>
