<script lang="ts">
  import { Button, Img, Tooltip } from '@juspay/svelte-ui-components';
  import { fit, zoomInCentered, zoomOutCentered } from '../camera';
  import { setTool, tools } from '../tools';
  import cursorIcon from '$lib/assets/icons/cursor.svg?url';
  import fitIcon from '$lib/assets/icons/fit.svg?url';
  import handIcon from '$lib/assets/icons/hand.svg?url';
  import zoomInIcon from '$lib/assets/icons/zoom-in.svg?url';
  import zoomOutIcon from '$lib/assets/icons/zoom-out.svg?url';

  function railClass(active: boolean): string {
    return active ? 'rail-btn rail-btn-active' : 'rail-btn';
  }
</script>

<div class="tool-rail" role="toolbar" aria-label="Canvas tools">
  <Tooltip text="Move tool — select & inspect (V)" position="bottom" classes="tooltip-studio">
    <Button
      ariaLabel="Select tool"
      onclick={() => setTool('select')}
      classes={railClass($tools.active === 'select')}
    >
      <Img src={cursorIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>

  <Tooltip
    text="Hand tool — pan the canvas (H or hold Space)"
    position="bottom"
    classes="tooltip-studio"
  >
    <Button
      ariaLabel="Hand tool"
      onclick={() => setTool('hand')}
      classes={railClass($tools.active === 'hand')}
    >
      <Img src={handIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>

  <div class="rail-sep" aria-hidden="true"></div>

  <Tooltip text="Zoom in (⌘+)" position="bottom" classes="tooltip-studio">
    <Button ariaLabel="Zoom in" onclick={zoomInCentered} classes="rail-btn">
      <Img src={zoomInIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>

  <Tooltip text="Zoom out (⌘−)" position="bottom" classes="tooltip-studio">
    <Button ariaLabel="Zoom out" onclick={zoomOutCentered} classes="rail-btn">
      <Img src={zoomOutIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>

  <Tooltip text="Zoom to fit (⇧1)" position="bottom" classes="tooltip-studio">
    <Button ariaLabel="Zoom to fit" onclick={fit} classes="rail-btn">
      <Img src={fitIcon} alt="" classes="studio-icon icon-md" />
    </Button>
  </Tooltip>
</div>

<style>
  /* Horizontal floating toolbar (positioned top-center over the canvas). */
  .tool-rail {
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
