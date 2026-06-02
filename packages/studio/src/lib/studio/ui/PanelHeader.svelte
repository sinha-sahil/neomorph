<script lang="ts">
	import { Input } from '@juspay/svelte-ui-components';
	import { filteredCount, setSearch, ui } from '../store';
</script>

<header class="panel-header">
	<div class="panel-title-row">
		<h2 class="panel-title">Tokens</h2>
		{#if $filteredCount > 0}
			<span class="panel-count">{$filteredCount}</span>
		{/if}
	</div>
	<div class="panel-search">
		<svg
			class="search-icon"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
		<Input
			value={$ui.search}
			dataType="text"
			placeholder="Search tokens"
			onInput={(val: string) => setSearch(val)}
			classes="input-search"
		/>
	</div>
</header>

<style>
	.panel-header {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px 14px 14px;
		border-bottom: 1px solid var(--border-soft);
		background: var(--bg-panel);
	}

	.panel-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.panel-title {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: -0.005em;
		color: var(--text);
	}

	.panel-count {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
		font-weight: 500;
		padding: 1px 7px;
		border-radius: 4px;
		background: var(--bg-mute);
	}

	.panel-search {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-faint);
		pointer-events: none;
		z-index: 1;
	}
</style>
