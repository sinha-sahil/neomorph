<script lang="ts">
  import { camera } from '../camera';
  import IframeHost from './IframeHost.svelte';
</script>

<!--
  Pan is `transform: translate` (crisp); zoom is CSS `zoom` (a layout-time re-render,
  crisp at any zoom) — NOT `transform: scale`, which stretches the iframe's bitmap and blurs.
-->
<div class="scene" style="transform: translate({$camera.x}px, {$camera.y}px);">
  <div class="zoomed" style="zoom: {$camera.z};">
    <IframeHost />
    <!-- Phase 2: <SelectionOverlay /> mounts here, sharing the zoom wrapper -->
  </div>
</div>

<style>
  .scene {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
  }

  .zoomed {
    transform-origin: 0 0;
  }
</style>
