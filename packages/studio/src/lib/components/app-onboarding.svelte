<script lang="ts">
	import HeaderBanner from './header-banner.svelte';
	import UrlInput from './url-input.svelte';
	import ThemeToggle from './theme-toggle.svelte';

	interface Props {
		onUrlSubmit?: (url: string) => void;
	}

	let { onUrlSubmit }: Props = $props();
</script>

<div class="onboarding-container">
	<!-- Fixed theme toggle -->
	<ThemeToggle position="fixed" />

	<HeaderBanner />

	<div class="url-section">
		<UrlInput
			onSubmit={onUrlSubmit}
			placeholder="your-app.com"
			buttonText="Connect & Customize"
		/>

		<div class="help-text">
			<p>
				Need help? Check out our <a href="https://github.com/sinha-sahil/neomorph#integration" class="help-link" target="_blank" rel="noopener noreferrer">integration guide</a>
				to add Weaver to your app.
			</p>
		</div>
	</div>
</div>

<style>
	.onboarding-container {
		min-height: 100vh;
		background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
	}

	.url-section {
		padding: 64px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		max-width: 600px;
		margin: 0 auto;
	}

	.help-text {
		text-align: center;
		padding: 16px 20px;
		background: rgba(59, 130, 246, 0.05);
		border-radius: 12px;
		border: 1px solid rgba(59, 130, 246, 0.1);
		max-width: 500px;
	}

	.help-text p {
		font-size: 14px;
		color: #475569;
		margin: 0;
		line-height: 1.5;
	}

	.help-link {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.help-link:hover {
		color: #2563eb;
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.url-section {
			padding: 48px 16px;
		}
	}
</style>