<script lang="ts">
  import { Img } from '@juspay/svelte-ui-components';
  import {
    applyElementStyle,
    applyTokenValue,
    recordElementEdit,
    selected
  } from '$lib/modules/connection';
  import pointerIcon from '$lib/assets/icons/pointer.svg?url';
  import { quad, selectorLabel, styleOf } from '../edit';
  import type { InspectorCtx } from '../types';
  import LayoutSection from './sections/LayoutSection.svelte';
  import SpacingSection from './sections/SpacingSection.svelte';
  import TypographySection from './sections/TypographySection.svelte';
  import FillSection from './sections/FillSection.svelte';
  import BorderSection from './sections/BorderSection.svelte';
  import TokensSection from './sections/TokensSection.svelte';

  // Optimistic local edits so a control reflects a change before the next scrape.
  // Keyed by element id so one element's pending edits never leak to another —
  // which removes the need for an effect that resets on selection change.
  let localOverrides = $state<Record<string, Record<string, string>>>({});

  function tokenFor(property: string): string | null {
    if ($selected === null) {
      return null;
    }
    for (const rel of $selected.relevantVariables) {
      if (rel.property === property) {
        return rel.varName;
      }
    }
    return null;
  }

  function valueOf(property: string): string {
    if ($selected === null) {
      return '';
    }
    const override = (localOverrides[$selected.elementId] ?? {})[property];
    if (typeof override === 'string') {
      return override;
    }
    return styleOf($selected.computedStyles, property);
  }

  function spacingValue(prefix: string): string {
    if ($selected === null) {
      return '';
    }
    const override = (localOverrides[$selected.elementId] ?? {})[prefix];
    if (typeof override === 'string') {
      return override;
    }
    return quad($selected.computedStyles, prefix);
  }

  function elementSelector(): string {
    if ($selected === null) {
      return '';
    }
    if ($selected.id.length > 0) {
      return `#${$selected.id}`;
    }
    return selectorLabel($selected.tagName, $selected.classNames);
  }

  // Hybrid edit: token-driven properties update the token globally; everything
  // else becomes a per-element override.
  function editProperty(property: string, value: string): void {
    if ($selected === null) {
      return;
    }
    const id = $selected.elementId;
    localOverrides = {
      ...localOverrides,
      [id]: { ...(localOverrides[id] ?? {}), [property]: value }
    };
    const varName = tokenFor(property);
    if (varName !== null) {
      applyTokenValue($selected.hostName, varName, value);
    } else {
      applyElementStyle($selected.elementId, property, value);
      recordElementEdit(elementSelector(), property, value);
    }
  }

  const ctx: InspectorCtx = { valueOf, spacingValue, tokenFor, edit: editProperty };
</script>

<aside class="inspector">
  {#if $selected === null}
    <div class="inspector-empty">
      <Img src={pointerIcon} alt="" classes="studio-icon icon-lg" />
      <p class="empty-title">Nothing selected</p>
      <p class="empty-body">Click an element on the canvas to inspect and restyle it.</p>
    </div>
  {:else}
    <header class="sel-head">
      <span class="sel-tag" title={selectorLabel($selected.tagName, $selected.classNames)}>
        {selectorLabel($selected.tagName, $selected.classNames)}
      </span>
      <span class="sel-dims">
        {Math.round($selected.rect.width)} × {Math.round($selected.rect.height)}
      </span>
    </header>

    <div class="sel-scroll">
      <LayoutSection {ctx} />
      <SpacingSection {ctx} />
      <TypographySection {ctx} />
      <FillSection {ctx} />
      <BorderSection {ctx} selected={$selected} />
      {#if $selected.relevantVariables.length > 0}
        <TokensSection selected={$selected} />
      {/if}
    </div>
  {/if}
</aside>

<style>
  .inspector {
    display: flex;
    flex-direction: column;
    width: 320px;
    min-height: 0;
    background: var(--bg-panel);
    border-left: 1px solid var(--border);
    overflow: hidden;
    flex-shrink: 0;
  }

  .inspector-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 100%;
    padding: 24px;
    text-align: center;
    color: var(--text-muted);
  }

  .empty-title {
    margin: 4px 0 0 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .empty-body {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    max-width: 220px;
  }

  .sel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 12px 10px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .sel-tag {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sel-dims {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-faint);
    white-space: nowrap;
  }

  .sel-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
</style>
