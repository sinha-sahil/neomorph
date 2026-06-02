<script lang="ts">
	import { Select } from '@juspay/svelte-ui-components';
	import { activeHostName, hostNames, setActiveHost } from '../store';

	type SelectItem = { id: string; label: string };

	let items = $derived<SelectItem[]>($hostNames.map((n) => ({ id: n, label: n })));
	let value = $derived<string[]>(typeof $activeHostName === 'string' ? [$activeHostName] : []);

	function onChange(next: string[]): void {
		const picked = next.at(0);
		if (typeof picked !== 'string') {
			return;
		}
		setActiveHost(picked);
	}
</script>

{#if $hostNames.length > 1}
	<div class="scope-row">
		<span class="scope-label">Scope</span>
		<Select {items} {value} onchange={onChange} classes="select-scope" />
	</div>
{/if}

<style>
	.scope-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 14px 12px;
		border-bottom: 1px solid var(--border-soft);
		background: var(--bg-panel);
	}

	.scope-label {
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 10px;
		color: var(--text-muted);
	}
</style>
