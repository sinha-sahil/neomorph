<script lang="ts">
  import { attachLoomer } from '$lib/modules/connection';
  import { target } from '$lib/modules/connection';
  import { deviceSize } from '../device';

  function initLoomer(node: HTMLDivElement) {
    return attachLoomer(node, $target.appUrl);
  }
</script>

<!--
  Keyed on appUrl + reloadNonce: bumping the nonce (the reload button) remounts
  the host, which re-fetches the app and re-establishes the Loomer connection.
  The device toggle only changes deviceSize, which resizes the host in place so
  the app reflows responsively without a reload.
-->
{#key `${$target.appUrl}:${$target.reloadNonce}`}
  <div
    class="iframe-host"
    style="width: {$deviceSize.width}px; height: {$deviceSize.height}px;"
    use:initLoomer
  ></div>
{/key}

<style>
  .iframe-host {
    background: #ffffff;
    box-shadow: var(--shadow-elevated);
    overflow: hidden;
    transition:
      width 0.2s ease,
      height 0.2s ease;
  }

  .iframe-host :global(iframe) {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
</style>
