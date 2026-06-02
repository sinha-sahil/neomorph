<script lang="ts">
	import { activeHostName, canRedo, canUndo, totalTokenCount, ui } from '../store';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<footer class="status-bar">
	<div class="status-left">
		{#if typeof $activeHostName === 'string'}
			<span class="status-chip">
				<span class="dot" aria-hidden="true"></span>
				<span class="status-value">{$activeHostName}</span>
			</span>
			<span class="status-sep" aria-hidden="true">·</span>
			<span class="status-meta">{$totalTokenCount} tokens</span>
		{:else}
			<span class="status-meta status-meta-faded">no target connected</span>
		{/if}
	</div>

	<div class="status-center">
		{#if typeof $ui.lastAction === 'string'}
			<span class="status-action" title={$ui.lastAction}>{$ui.lastAction}</span>
		{/if}
	</div>

	<div class="status-right">
		<span class="status-meta status-meta-faded">
			{#if $canUndo}⌘Z{:else}—{/if}
			·
			{#if $canRedo}⌘⇧Z{:else}—{/if}
		</span>
		<ThemeToggle />
	</div>
</footer>

<style>
	.status-bar {
		display: grid;
		grid-template-columns: 1fr minmax(0, 2fr) 1fr;
		align-items: center;
		height: 26px;
		padding: 0 12px;
		background: var(--bg-statusbar);
		border-top: 1px solid var(--border);
		font-size: 11px;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-right {
		justify-content: flex-end;
	}

	.status-center {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-family: var(--font-mono);
		color: var(--text);
		max-width: 220px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--success);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--success) 25%, transparent);
	}

	.status-value {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-sep {
		color: var(--text-faint);
	}

	.status-meta {
		font-family: var(--font-mono);
	}

	.status-meta-faded {
		color: var(--text-faint);
	}

	.status-action {
		font-family: var(--font-mono);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
		padding: 2px 8px;
		border-radius: 4px;
		background: var(--bg-mute);
	}
</style>
