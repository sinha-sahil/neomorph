<script lang="ts">
  import { onMount } from 'svelte';
  import { pushValueDirect, stepRedo, stepUndo } from '$lib/modules/connection';
  import { themeMode, toggleThemeMode } from '../store';
  import { CanvasViewport } from '$lib/modules/canvas';
  import { Inspector } from '$lib/modules/inspector';
  import { TokenSidebar } from '$lib/modules/tokens';
  import StatusBar from './StatusBar.svelte';
  import TopBar from './TopBar.svelte';

  // Mirror the theme mode onto the document. subscribe() fires immediately with the
  // current value and on every change; the returned unsubscribe is the cleanup.
  onMount(() =>
    themeMode.subscribe((mode) => {
      document.documentElement.dataset.studioTheme = mode;
    })
  );

  function isEditableTarget(el: EventTarget | null): boolean {
    if (el === null) {
      return false;
    }
    if (!(el instanceof HTMLElement)) {
      return false;
    }
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      return true;
    }
    if (el.isContentEditable) {
      return true;
    }
    return false;
  }

  function onKeyDown(e: KeyboardEvent): void {
    const cmd = e.metaKey || e.ctrlKey;
    if (!cmd) {
      return;
    }
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) {
      const popped = stepUndo();
      if (popped !== null) {
        pushValueDirect(popped.host, popped.name, popped.previousValue);
      }
      e.preventDefault();
    } else if (key === 'z' && e.shiftKey) {
      const next = stepRedo();
      if (next !== null) {
        pushValueDirect(next.host, next.name, next.nextValue);
      }
      e.preventDefault();
    } else if (key === 'l' && e.shiftKey) {
      if (isEditableTarget(e.target)) {
        return;
      }
      toggleThemeMode();
      e.preventDefault();
    }
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="studio">
  <TopBar />
  <main class="workspace">
    <TokenSidebar />
    <CanvasViewport />
    <Inspector />
  </main>
  <StatusBar />
</div>

<style>
  .studio {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--bg-app);
    color: var(--text);
  }

  .workspace {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
</style>
