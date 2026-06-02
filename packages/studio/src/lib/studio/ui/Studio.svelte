<script lang="ts">
	import { stepRedo, stepUndo, toggleThemeMode, ui } from '../store';
	import { pushValueDirect } from '../sdk-bridge';
	import Preview from './Preview.svelte';
	import SidePanel from './SidePanel.svelte';
	import StatusBar from './StatusBar.svelte';
	import TopBar from './TopBar.svelte';

	$effect(() => {
		document.documentElement.dataset.studioTheme = $ui.themeMode;
	});

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
		<SidePanel />
		<Preview />
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
		display: grid;
		grid-template-columns: 320px 1fr;
		min-height: 0;
		overflow: hidden;
	}
</style>
