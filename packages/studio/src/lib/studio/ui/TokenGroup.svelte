<script lang="ts">
	import type { TokenGroup } from '../types';
	import TokenRow from './TokenRow.svelte';

	type Props = {
		group: TokenGroup;
		host: string;
	};
	let { group, host }: Props = $props();
</script>

<section class="token-group">
	<header class="group-header">
		<span class="group-title">{group.label}</span>
		<span class="group-count">{group.variables.length}</span>
	</header>
	{#each group.variables as variable (variable.name)}
		<TokenRow {variable} {host} />
	{/each}
</section>

<style>
	.token-group {
		display: contents;
	}

	.group-header {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 14px 6px;
		background: var(--bg-panel);
		border-bottom: 1px solid var(--border-soft);
	}

	.group-title {
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.group-count {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--text-faint);
	}
</style>
