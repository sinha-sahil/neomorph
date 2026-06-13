<script lang="ts">
  import { Button, Img, Tooltip } from '@juspay/svelte-ui-components';
  import { device, setDevice } from '../device';
  import { reloadTarget } from '$lib/modules/connection';
  import desktopIcon from '$lib/assets/icons/desktop.svg?url';
  import mobileIcon from '$lib/assets/icons/mobile.svg?url';
  import refreshIcon from '$lib/assets/icons/refresh.svg?url';

  function railClass(active: boolean): string {
    return active ? 'rail-btn rail-btn-active' : 'rail-btn';
  }
</script>

<div class="device-bar" role="toolbar" aria-label="Device view & reload">
  <Tooltip text="Desktop view" position="bottom" classes="tooltip-studio">
    <Button
      ariaLabel="Desktop view"
      onclick={() => setDevice('desktop')}
      classes={railClass($device === 'desktop')}
    >
      <Img src={desktopIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>

  <Tooltip text="Mobile view" position="bottom" classes="tooltip-studio">
    <Button
      ariaLabel="Mobile view"
      onclick={() => setDevice('mobile')}
      classes={railClass($device === 'mobile')}
    >
      <Img src={mobileIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>

  <div class="rail-sep" aria-hidden="true"></div>

  <Tooltip text="Reload app frame" position="bottom" classes="tooltip-studio">
    <Button ariaLabel="Reload app frame" onclick={reloadTarget} classes="rail-btn">
      <Img src={refreshIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>
</div>

<style>
  .device-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    padding: 4px 6px;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-elevated);
  }

  .rail-sep {
    width: 1px;
    height: 20px;
    background: var(--border);
    margin: 0 4px;
  }
</style>
