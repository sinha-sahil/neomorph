<script lang="ts">
	import PanelHeader from './PanelHeader.svelte';
	import ScopeSwitcher from './ScopeSwitcher.svelte';
	import TokenList from './TokenList.svelte';
</script>

<aside class="side-panel">
	<PanelHeader />
	<ScopeSwitcher />
	<TokenList />
</aside>

<style>
	.side-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		background: var(--bg-panel);
		border-right: 1px solid var(--border);
		overflow: hidden;
	}
</style>
