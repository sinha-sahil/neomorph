<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fit,
    panBy,
    resetView,
    setViewportSize,
    zoomInCentered,
    zoomOutCentered,
    zoomToPoint
  } from '../camera';
  import { isPanning, setSpacePanning, setTool, tools } from '../tools';
  import Scene from './Scene.svelte';
  import ToolRail from './ToolRail.svelte';
  import DeviceBar from './DeviceBar.svelte';

  let viewport: HTMLDivElement;
  let toolOverlay: HTMLDivElement;
  let dragging = $state(false);

  function syncViewportSize(): void {
    const rect = viewport.getBoundingClientRect();
    setViewportSize(rect.width, rect.height);
  }

  function localPoint(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = viewport.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function isTyping(node: EventTarget | null): boolean {
    if (!(node instanceof HTMLElement)) {
      return false;
    }
    const tag = node.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      return true;
    }
    return node.isContentEditable;
  }

  function onWheel(e: WheelEvent): void {
    e.preventDefault();
    const p = localPoint(e);
    if (e.ctrlKey || e.metaKey) {
      zoomToPoint(p.x, p.y, Math.pow(2, -e.deltaY * 0.01));
    } else {
      panBy(-e.deltaX, -e.deltaY);
    }
  }

  function onPointerDown(e: PointerEvent): void {
    if (!isPanning()) {
      return;
    }
    if (e.target instanceof Node && toolOverlay.contains(e.target)) {
      return;
    }
    e.preventDefault();
    dragging = true;
    viewport.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent): void {
    if (!dragging) {
      return;
    }
    panBy(e.movementX, e.movementY);
  }

  function onPointerUp(e: PointerEvent): void {
    if (!dragging) {
      return;
    }
    dragging = false;
    if (viewport.hasPointerCapture(e.pointerId)) {
      viewport.releasePointerCapture(e.pointerId);
    }
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (isTyping(e.target)) {
      return;
    }
    const cmd = e.metaKey || e.ctrlKey;
    if (e.key === ' ') {
      setSpacePanning(true);
      e.preventDefault();
    } else if (!cmd && (e.key === 'v' || e.key === 'V')) {
      setTool('select');
    } else if (!cmd && (e.key === 'h' || e.key === 'H')) {
      setTool('hand');
    } else if (cmd && (e.key === '=' || e.key === '+')) {
      zoomInCentered();
      e.preventDefault();
    } else if (cmd && e.key === '-') {
      zoomOutCentered();
      e.preventDefault();
    } else if (cmd && e.key === '0') {
      resetView();
      e.preventDefault();
    } else if (e.shiftKey && e.key === '1') {
      fit();
      e.preventDefault();
    }
  }

  function onKeyUp(e: KeyboardEvent): void {
    if (e.key === ' ') {
      setSpacePanning(false);
    }
  }

  onMount(() => {
    syncViewportSize();
    fit();
    const observer = new ResizeObserver(syncViewportSize);
    observer.observe(viewport);
    return () => {
      observer.disconnect();
    };
  });
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<div
  bind:this={viewport}
  class="viewport"
  class:pan-mode={$tools.active === 'hand' || $tools.spacePanning}
  class:grabbing={dragging}
  onwheel={onWheel}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
>
  <Scene />
  <div class="tool-overlay" bind:this={toolOverlay}>
    <ToolRail />
    <DeviceBar />
  </div>
</div>

<style>
  .viewport {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background-color: var(--bg-app);
    background-image: radial-gradient(var(--border-strong) 1.2px, transparent 1.2px);
    background-size: 24px 24px;
  }

  .viewport.pan-mode {
    cursor: grab;
  }

  .viewport.grabbing {
    cursor: grabbing;
  }

  .tool-overlay {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* During pan/hand mode the iframe must not swallow the gesture. */
  .viewport.pan-mode :global(iframe) {
    pointer-events: none;
  }
</style>
