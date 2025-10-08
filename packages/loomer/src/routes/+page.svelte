<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { setupKeyboardShortcuts } from '$lib/utils';
	import Loader from '$lib/components/loader.svelte';
	import AppOnboarding from '$lib/components/app-onboarding.svelte';
	import '../app.css';

	type VisibleContent = 'loader' | 'onboarding' | 'editor';

	let cleanupKeyboard: (() => void) | null = null;
	let visibleContent = $state<VisibleContent>('loader');
	let appUrl = $state<string | null>(null);

	function emitCssVariables() {
		window.parent.postMessage(
			JSON.stringify({
				source: 'loomer',
				stylesText: `
					:root {
						--primary-text-color: red;
					}
				`,
				styles: {}
			})
		);
	}

	function handleUrlSubmit(url: string) {
		appUrl = url;
		visibleContent = 'editor';
	}

	onMount(() => {
		const appUrl = page.url.searchParams.get('appUrl');
		if (appUrl) {
			console.log('App URL from query param:', appUrl);
			// If URL is provided, skip onboarding and go to editor
			visibleContent = 'editor';
		} else {
			// Show onboarding if no URL provided
			visibleContent = 'onboarding';
		}

		cleanupKeyboard = setupKeyboardShortcuts(emitCssVariables);
	});

	onDestroy(() => {
		cleanupKeyboard?.();
	});
</script>

{#if visibleContent === 'loader'}
	<div class="loader-container">
		<Loader />
	</div>
{:else if visibleContent === 'onboarding'}
	<AppOnboarding onUrlSubmit={handleUrlSubmit} />
{:else if visibleContent === 'editor'}
	<div class="editor-container">
		<h1>Theme Editor</h1>
		<p>Connected! Theme editor will be implemented here.</p>
		<button onclick={emitCssVariables}>Test Emit CSS Variables</button>
	</div>
{/if}

<style>
	.loader-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		min-height: 100vh;
	}

	.editor-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100vw;
		min-height: 100vh;
		padding: 24px;
		text-align: center;
	}

	.editor-container h1 {
		font-size: 32px;
		color: #1e293b;
		margin-bottom: 16px;
	}

	.editor-container p {
		font-size: 16px;
		color: #64748b;
		margin-bottom: 24px;
	}

	.editor-container button {
		padding: 12px 24px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.editor-container button:hover {
		background: #2563eb;
	}
</style>
