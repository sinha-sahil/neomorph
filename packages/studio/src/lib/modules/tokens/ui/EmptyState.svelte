<script lang="ts">
  import { Img } from '@juspay/svelte-ui-components';
  import type { EmptyStateProps } from '../types';
  import activityIcon from '$lib/assets/icons/activity.svg?url';

  let { title, body, hint }: EmptyStateProps = $props();
</script>

<div class="empty">
  <div class="empty-mark" aria-hidden="true">
    <Img src={activityIcon} alt="" classes="studio-icon icon-lg" />
  </div>
  <h3 class="empty-title">{title}</h3>
  <p class="empty-body">{body}</p>
  {#if typeof hint === 'string'}
    <p class="empty-hint">{hint}</p>
  {/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 20px;
    gap: 8px;
    color: var(--text-muted);
  }

  .empty-mark {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-mute);
    color: var(--text-faint);
    margin-bottom: 4px;
  }

  .empty-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.005em;
  }

  .empty-body {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
    max-width: 240px;
    line-height: 1.5;
  }

  .empty-hint {
    margin: 4px 0 0;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-faint);
    padding: 4px 8px;
    background: var(--bg-mute);
    border-radius: 4px;
  }
</style>
