<script lang="ts">
  import { Button, Img } from '@juspay/svelte-ui-components';
  import { slide } from 'svelte/transition';
  import chevronDownIcon from '$lib/assets/icons/chevron-down.svg?url';
  import type { InspectorSectionProps } from '../types';

  let { title, children }: InspectorSectionProps = $props();
  let expanded = $state(true);

  function toggle(): void {
    expanded = !expanded;
  }
</script>

<section class="section">
  <Button onclick={toggle} ariaLabel={`Toggle ${title} section`} classes="section-head-btn">
    <span class="section-head-inner">
      <span class="section-title">{title}</span>
      <Img
        src={chevronDownIcon}
        alt=""
        classes={expanded ? 'studio-icon icon-xs chev chev-open' : 'studio-icon icon-xs chev'}
      />
    </span>
  </Button>
  <!--
    Animated collapse via Svelte's `slide`, NOT the library Accordion. Accordion's
    grid-row animation needs a persistent `overflow: hidden` that clips any open
    Select/ColorPicker dropdown extending past the section box. `slide` applies
    overflow:hidden only DURING the transition and removes it once open, so settled
    sections never clip their dropdowns while still animating like an accordion.
  -->
  {#if expanded}
    <div class="section-body" transition:slide={{ duration: 200 }}>
      {@render children()}
    </div>
  {/if}
</section>

<style>
  .section {
    border-bottom: 1px solid var(--border);
  }

  .section :global(.section-head-btn) {
    --button-color: transparent;
    --button-hover-color: var(--bg-mute);
    --button-text-color: var(--text-faint);
    --button-padding: 8px 12px 6px;
    --button-border-radius: 0;
    --button-border: none;
    --button-width: 100%;
    display: block;
    width: 100%;
  }

  .section-head-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Applied to the <Img> top-level element via its `classes` prop, so it must be
     reached with :global (anchored to the local header span). */
  .section-head-inner :global(.chev) {
    transition: transform 0.15s ease;
  }

  .section-head-inner :global(.chev-open) {
    transform: rotate(180deg);
  }

  .section-body {
    display: flex;
    flex-direction: column;
    padding-bottom: 8px;
  }
</style>
