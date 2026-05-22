<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { Loomer } from '@neomorph/sdk';
	import AppOnboarding from '$lib/components/app-onboarding.svelte';
	import LoaderComponent from '$lib/components/loader.svelte';
	import '../app.css';

	type VisibleContent = 'loader' | 'onboarding' | 'editor';
	type ScrapedVariables = Record<
		string,
		Record<string, Array<{ property: string; value: string }>>
	>;

	let visibleContent = $state<VisibleContent>('loader');
	let appUrl = $state<string | null>(null);
	let loomer: Loomer | null = null;
	let scrapedVariables = $state<ScrapedVariables | null>(null);

	function handleUrlSubmit(url: string) {
		appUrl = url;
		visibleContent = 'editor';
	}

	function initLoomer(container: HTMLDivElement) {
		if (appUrl === null) {
			return;
		}

		loomer = new Loomer();
		loomer.loadApplication(appUrl, container);
		loomer.listenCssVariables((payload) => {
			scrapedVariables = payload as ScrapedVariables;
		});
	}

	function applyDarkTheme() {
		if (loomer === null) {
			return;
		}
		loomer.applyCssVariables(
			{
				document: {
					'--color-primary': '#e11d48',
					'--color-primary-hover': '#be123c',
					'--color-secondary': '#0891b2',
					'--color-accent': '#16a34a',
					'--color-bg': '#0f172a',
					'--color-surface': '#1e293b',
					'--color-surface-hover': '#334155',
					'--color-border': '#475569',
					'--color-text': '#f1f5f9',
					'--color-text-muted': '#94a3b8',
					'--color-text-inverse': '#ffffff',
					'--color-success': '#22c55e',
					'--color-danger': '#f43f5e'
				}
			},
			true
		);
	}

	function resetTheme() {
		if (loomer === null) {
			return;
		}
		loomer.clearTheme();
		scrapedVariables = null;
		loomer.listenCssVariables((payload) => {
			scrapedVariables = payload as ScrapedVariables;
		});
	}

	onMount(() => {
		const urlParam = page.url.searchParams.get('appUrl');
		if (urlParam !== null) {
			appUrl = urlParam;
			visibleContent = 'editor';
		} else {
			visibleContent = 'onboarding';
		}
	});

	onDestroy(() => {
		if (loomer !== null) {
			loomer.teardown();
		}
	});
</script>

{#if visibleContent === 'loader'}
	<div class="loader-container">
		<LoaderComponent />
	</div>
{:else if visibleContent === 'onboarding'}
	<AppOnboarding onUrlSubmit={handleUrlSubmit} />
{:else if visibleContent === 'editor'}
	<div class="editor">
		<header class="editor-toolbar">
			<span class="editor-title">Neomorph Studio</span>
			<span class="editor-url">{appUrl}</span>
			<div class="editor-actions">
				<button class="btn" onclick={applyDarkTheme}>Apply Dark Theme</button>
				<button class="btn btn-danger" onclick={resetTheme}>Reset</button>
			</div>
		</header>

		<div class="editor-layout">
			<div class="preview" use:initLoomer></div>

			<aside class="sidebar">
				<h2 class="sidebar-title">CSS Variables</h2>
				{#if scrapedVariables === null}
					<p class="sidebar-empty">Loading variables...</p>
				{:else}
					{#each Object.entries(scrapedVariables) as [host, selectors]}
						<div class="host-group">
							<h3 class="host-name">{host}</h3>
							{#each Object.entries(selectors) as [selector, vars]}
								<div class="selector-group">
									<span class="selector-name">{selector}</span>
									{#each vars as v}
										<div class="var-row">
											<span class="var-prop">{v.property}</span>
											<span class="var-value">{v.value}</span>
										</div>
									{/each}
								</div>
							{/each}
						</div>
					{/each}
				{/if}
			</aside>
		</div>
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

	.editor {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 16px;
		background: var(--color-surface, #1e293b);
		border-bottom: 1px solid var(--color-border, #334155);
	}

	.editor-title {
		font-weight: 700;
		font-size: 15px;
		color: var(--color-primary, #8b5cf6);
	}

	.editor-url {
		font-size: 13px;
		color: var(--color-text-muted, #94a3b8);
		margin-right: auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.editor-actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 5px 12px;
		border: 1px solid var(--color-border, #334155);
		border-radius: 6px;
		background: var(--color-surface, #1e293b);
		color: var(--color-text, #e2e8f0);
		font-size: 12px;
		cursor: pointer;
	}

	.btn:hover {
		background: var(--color-surface-hover, #334155);
	}

	.btn-danger {
		background: #e11d48;
		border-color: #e11d48;
		color: #fff;
	}

	.btn-danger:hover {
		background: #be123c;
	}

	.editor-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.preview {
		flex: 1;
	}

	.preview :global(iframe) {
		width: 100%;
		height: 100%;
		border: none;
	}

	.sidebar {
		width: 320px;
		overflow-y: auto;
		padding: 12px;
		border-left: 1px solid var(--color-border, #334155);
		background: var(--color-bg, #0f172a);
	}

	.sidebar-title {
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted, #94a3b8);
		margin-bottom: 12px;
	}

	.sidebar-empty {
		font-size: 13px;
		color: var(--color-text-muted, #64748b);
	}

	.host-group {
		margin-bottom: 16px;
	}

	.host-name {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text, #cbd5e1);
		padding-bottom: 4px;
		margin-bottom: 8px;
		border-bottom: 1px solid var(--color-border, #1e293b);
	}

	.selector-group {
		margin-bottom: 8px;
	}

	.selector-name {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-primary, #8b5cf6);
		padding: 2px 6px;
		background: rgba(139, 92, 246, 0.1);
		border-radius: 3px;
		font-family: monospace;
		display: inline-block;
		margin-bottom: 4px;
	}

	.var-row {
		display: flex;
		justify-content: space-between;
		padding: 3px 6px;
		font-size: 12px;
		border-radius: 3px;
	}

	.var-row:hover {
		background: var(--color-surface, #1e293b);
	}

	.var-prop {
		color: #38bdf8;
		font-family: monospace;
	}

	.var-value {
		color: var(--color-text-muted, #94a3b8);
		font-family: monospace;
	}
</style>
