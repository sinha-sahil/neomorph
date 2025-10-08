<script lang="ts">
	import { onDestroy } from 'svelte';

	interface Props {
		onSubmit?: (url: string) => void;
		placeholder?: string;
		buttonText?: string;
		disabled?: boolean;
	}

	let {
		onSubmit,
		placeholder = 'example.com or https://example.com',
		buttonText = 'Load App',
		disabled = false
	}: Props = $props();

	let urlValue = $state('');
	let isValid = $state(false);
	let errorMessage = $state('');
	let isLoading = $state(false);
	let hasBlurred = $state(false);
	let validationTimeout: number | null = null;

	function normalizeUrl(url: string): string {
		const trimmed = url.trim();
		if (!trimmed) return '';

		// If no protocol specified, add https://
		if (!trimmed.match(/^https?:\/\//)) {
			return `https://${trimmed}`;
		}

		return trimmed;
	}

	function validateUrl(url: string, showErrors: boolean = true): boolean {
		if (!url.trim()) {
			if (showErrors) errorMessage = 'URL is required';
			return false;
		}

		const normalizedUrl = normalizeUrl(url);

		try {
			const urlObj = new URL(normalizedUrl);

			// Check protocol
			if (!['http:', 'https:'].includes(urlObj.protocol)) {
				if (showErrors) errorMessage = 'URL must use HTTP or HTTPS protocol';
				return false;
			}

			// Check hostname - must be valid domain format
			const hostname = urlObj.hostname;

			// Must contain at least one dot for TLD (unless localhost)
			if (hostname !== 'localhost' && !hostname.includes('.')) {
				if (showErrors) errorMessage = 'Please enter a valid domain (e.g., example.com)';
				return false;
			}

			// Basic domain validation - must have valid characters and structure
			const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
			if (hostname !== 'localhost' && !domainRegex.test(hostname)) {
				if (showErrors) errorMessage = 'Please enter a valid domain format';
				return false;
			}

			// Must have a proper TLD (at least 2 characters after final dot)
			if (hostname !== 'localhost') {
				const parts = hostname.split('.');
				const tld = parts[parts.length - 1];
				if (tld.length < 2) {
					if (showErrors) errorMessage = 'Please enter a complete domain with valid TLD';
					return false;
				}
			}

			errorMessage = '';
			return true;
		} catch {
			if (showErrors) errorMessage = 'Please enter a valid URL (e.g., example.com or https://example.com)';
			return false;
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		urlValue = target.value;

		// Clear any existing timeout
		if (validationTimeout) {
			clearTimeout(validationTimeout);
		}

		// Only show errors if user has blurred the field before
		// or if the field is empty (immediate feedback for required field)
		const shouldShowErrors = hasBlurred || urlValue === '';
		isValid = validateUrl(urlValue, shouldShowErrors);

		// Debounced validation for real-time feedback (but only after first blur)
		if (hasBlurred && urlValue.length > 0) {
			validationTimeout = setTimeout(() => {
				isValid = validateUrl(urlValue, true);
			}, 500);
		}
	}

	function handleBlur() {
		hasBlurred = true;
		// Validate immediately on blur
		isValid = validateUrl(urlValue, true);
	}

	async function handleSubmit() {
		if (!isValid || isLoading || disabled) return;

		isLoading = true;
		try {
			// Send the normalized URL with protocol
			const normalizedUrl = normalizeUrl(urlValue);
			onSubmit?.(normalizedUrl);
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			// Validate before submit
			isValid = validateUrl(urlValue, true);
			hasBlurred = true;
			if (isValid) {
				handleSubmit();
			}
		}
	}

	onDestroy(() => {
		if (validationTimeout) {
			clearTimeout(validationTimeout);
		}
	});
</script>

<div class="url-input-container">
	<div class="input-wrapper">
		<input
			type="url"
			value={urlValue}
			{placeholder}
			class="url-input"
			class:error={errorMessage}
			class:valid={isValid && urlValue}
			{disabled}
			oninput={handleInput}
			onblur={handleBlur}
			onkeydown={handleKeydown}
		/>
		{#if errorMessage}
			<span class="error-message">{errorMessage}</span>
		{/if}
	</div>

	<button
		type="button"
		class="submit-button"
		class:loading={isLoading}
		disabled={!isValid || isLoading || disabled}
		onclick={handleSubmit}
	>
		{#if isLoading}
			<span class="loading-spinner"></span>
		{/if}
		{buttonText}
	</button>
</div>

<style>
	.url-input-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		max-width: 500px;
	}

	.input-wrapper {
		position: relative;
		width: 100%;
		margin-bottom: 20px; /* Reserve space for error message */
	}

	.url-input {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 14px;
		font-family: 'Poppins', sans-serif;
		background: white;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.url-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.url-input.valid {
		border-color: #10b981;
	}

	.url-input.error {
		border-color: #ef4444;
	}

	.url-input:disabled {
		background: #f8fafc;
		color: #64748b;
		cursor: not-allowed;
	}

	.error-message {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 4px;
		font-size: 12px;
		color: #ef4444;
		font-weight: 500;
	}

	.submit-button {
		padding: 12px 24px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		font-family: 'Poppins', sans-serif;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 48px;
	}

	.submit-button:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-button:disabled {
		background: #94a3b8;
		cursor: not-allowed;
		transform: none;
	}

	.submit-button.loading {
		cursor: wait;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Mobile spacing adjustments */
	@media (max-width: 639px) {
		.url-input-container {
			gap: 16px; /* Increase gap on mobile */
		}

		.input-wrapper {
			margin-bottom: 24px; /* More space for error message on mobile */
		}
	}

	@media (min-width: 640px) {
		.url-input-container {
			flex-direction: row;
			align-items: flex-start;
		}

		.input-wrapper {
			flex: 1;
			margin-bottom: 20px; /* Keep consistent spacing */
		}

		.submit-button {
			min-width: 120px;
			white-space: nowrap;
		}
	}
</style>
