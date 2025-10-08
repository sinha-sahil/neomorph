<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		type Theme,
		initializeTheme,
		toggleTheme,
		resolveTheme,
		setupSystemThemeListener
	} from '$lib/utils';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		showLabel?: boolean;
		position?: 'relative' | 'fixed';
	}

	let {
		size = 'md',
		showLabel = true,
		position = 'relative'
	}: Props = $props();

	let currentTheme = $state<Theme>('auto');
	let resolvedTheme = $state<'light' | 'dark'>('light');
	let cleanupSystemListener: (() => void) | null = null;

	function handleToggle() {
		currentTheme = toggleTheme(currentTheme);
		resolvedTheme = resolveTheme(currentTheme);
	}

	function getThemeIcon(theme: Theme): string {
		switch (theme) {
			case 'light': return '☀️';
			case 'dark': return '🌙';
			case 'auto': return '🔄';
		}
	}

	function getThemeLabel(theme: Theme): string {
		switch (theme) {
			case 'light': return 'Light';
			case 'dark': return 'Dark';
			case 'auto': return 'Auto';
		}
	}

	onMount(() => {
		currentTheme = initializeTheme();
		resolvedTheme = resolveTheme(currentTheme);

		// Listen for system theme changes when in auto mode
		cleanupSystemListener = setupSystemThemeListener((systemTheme) => {
			if (currentTheme === 'auto') {
				resolvedTheme = systemTheme;
			}
		});
	});

	onDestroy(() => {
		cleanupSystemListener?.();
	});
</script>

<button
	type="button"
	class="theme-toggle"
	class:fixed={position === 'fixed'}
	class:sm={size === 'sm'}
	class:md={size === 'md'}
	class:lg={size === 'lg'}
	onclick={handleToggle}
	title="Toggle theme: {getThemeLabel(currentTheme)}"
>
	<span class="icon" role="img" aria-label="Theme icon">
		{getThemeIcon(currentTheme)}
	</span>

	{#if showLabel}
		<span class="label">{getThemeLabel(currentTheme)}</span>
	{/if}
</button>

<style>
	.theme-toggle {
		--toggle-bg-light: #ffffff;
		--toggle-bg-dark: #1e293b;
		--toggle-border-light: #e2e8f0;
		--toggle-border-dark: #334155;
		--toggle-text-light: #475569;
		--toggle-text-dark: #e2e8f0;
		--toggle-shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
		--toggle-shadow-dark: 0 2px 8px rgba(0, 0, 0, 0.3);
		--toggle-hover-light: #f8fafc;
		--toggle-hover-dark: #334155;

		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid;
		border-radius: 8px;
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		user-select: none;

		/* Light theme styles */
		background: var(--toggle-bg-light);
		border-color: var(--toggle-border-light);
		color: var(--toggle-text-light);
		box-shadow: var(--toggle-shadow-light);
	}

	.theme-toggle:hover {
		background: var(--toggle-hover-light);
		transform: translateY(-1px);
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	/* Dark theme styles */
	:global([data-theme="dark"]) .theme-toggle {
		background: var(--toggle-bg-dark);
		border-color: var(--toggle-border-dark);
		color: var(--toggle-text-dark);
		box-shadow: var(--toggle-shadow-dark);
	}

	:global([data-theme="dark"]) .theme-toggle:hover {
		background: var(--toggle-hover-dark);
	}

	/* Size variants */
	.theme-toggle.sm {
		padding: 6px 8px;
		font-size: 12px;
		border-radius: 6px;
		gap: 4px;
	}

	.theme-toggle.sm .icon {
		font-size: 14px;
	}

	.theme-toggle.md {
		padding: 8px 12px;
		font-size: 14px;
		border-radius: 8px;
		gap: 8px;
	}

	.theme-toggle.md .icon {
		font-size: 16px;
	}

	.theme-toggle.lg {
		padding: 12px 16px;
		font-size: 16px;
		border-radius: 10px;
		gap: 10px;
	}

	.theme-toggle.lg .icon {
		font-size: 20px;
	}

	/* Fixed positioning */
	.theme-toggle.fixed {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.label {
		font-weight: 600;
		white-space: nowrap;
	}

	/* Focus styles for accessibility */
	.theme-toggle:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	:global([data-theme="dark"]) .theme-toggle:focus {
		outline-color: #60a5fa;
	}

	@media (max-width: 480px) {
		.theme-toggle.fixed {
			top: 16px;
			right: 16px;
		}
	}
</style>