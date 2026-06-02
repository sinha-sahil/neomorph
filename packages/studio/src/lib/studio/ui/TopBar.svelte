<script lang="ts">
	import { Button, Toolbar } from '@juspay/svelte-ui-components';
	import { clearAll, rescrape } from '../sdk-bridge';
	import URLBar from './URLBar.svelte';
</script>

<Toolbar classes="toolbar-app">
	{#snippet leftContent()}
		<div class="brand">
			<span class="brand-mark" aria-hidden="true"></span>
			<span class="brand-text">Studio</span>
		</div>
	{/snippet}
	{#snippet centerContent()}
		<URLBar />
	{/snippet}
	{#snippet rightContent()}
		<div class="actions">
			<span title="Rescrape variables">
				<Button ariaLabel="Rescrape CSS variables" onclick={rescrape} classes="btn-icon">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
					</svg>
				</Button>
			</span>
			<span title="Reset all overrides">
				<Button ariaLabel="Reset all overrides" onclick={clearAll} classes="btn-icon">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M3 7v6h6" />
						<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
					</svg>
				</Button>
			</span>
		</div>
	{/snippet}
</Toolbar>

<style>
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 16px 0 12px;
		min-width: 180px;
	}

	.brand-mark {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.06),
			0 1px 2px rgba(99, 102, 241, 0.3);
	}

	.brand-text {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--text);
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 4px;
		padding: 0 12px 0 12px;
		min-width: 180px;
	}
</style>
