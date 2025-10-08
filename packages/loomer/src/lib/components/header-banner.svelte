<script lang="ts">
	interface Props {
		title?: string;
		subtitle?: string;
		showBadge?: boolean;
	}

	let {
		title = "Neomorph Loomer",
		subtitle = "Visual theme editor for modern web apps",
		showBadge = true
	}: Props = $props();
</script>

<div class="header-banner">
	<div class="banner-content">
		{#if showBadge}
			<div class="badge">
				<span class="badge-icon">✨</span>
				<span>Theme Designer</span>
			</div>
		{/if}

		<h1 class="title">{title}</h1>
		<p class="subtitle">{subtitle}</p>

		<div class="feature-pills">
			<span class="pill">Real-time Preview</span>
			<span class="pill">CSS Variables</span>
			<span class="pill">Cross-origin Support</span>
		</div>
	</div>

	<!-- Animated background elements -->
	<div class="bg-elements">
		<div class="element element-1"></div>
		<div class="element element-2"></div>
		<div class="element element-3"></div>
	</div>
</div>

<style>
	.header-banner {
		--header-bg-primary: #f8fafc;
		--header-bg-secondary: #e2e8f0;
		--header-border-color: #e2e8f0;
		--header-padding-top: 80px;
		--header-padding-bottom: 60px;
		--header-padding-horizontal: 24px;

		background: linear-gradient(135deg, var(--header-bg-primary) 0%, var(--header-bg-secondary) 100%);
		padding: var(--header-padding-top) var(--header-padding-horizontal) var(--header-padding-bottom);
		text-align: center;
		position: relative;
		overflow: hidden;
		border-bottom: 1px solid var(--header-border-color);
	}

	.banner-content {
		--content-max-width: 800px;

		position: relative;
		z-index: 2;
		max-width: var(--content-max-width);
		margin: 0 auto;
	}

	.badge {
		--badge-bg-primary: #3b82f6;
		--badge-bg-secondary: #8b5cf6;
		--badge-text-color: white;
		--badge-padding-y: 8px;
		--badge-padding-x: 16px;
		--badge-border-radius: 24px;
		--badge-font-size: 14px;
		--badge-font-weight: 600;
		--badge-margin-bottom: 24px;
		--badge-shadow-color: rgba(59, 130, 246, 0.2);
		--badge-icon-size: 16px;

		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: linear-gradient(135deg, var(--badge-bg-primary), var(--badge-bg-secondary));
		color: var(--badge-text-color);
		padding: var(--badge-padding-y) var(--badge-padding-x);
		border-radius: var(--badge-border-radius);
		font-size: var(--badge-font-size);
		font-weight: var(--badge-font-weight);
		margin-bottom: var(--badge-margin-bottom);
		box-shadow: 0 4px 16px var(--badge-shadow-color);
	}

	.badge-icon {
		font-size: var(--badge-icon-size);
	}

	.title {
		--title-font-size: 56px;
		--title-font-weight: 800;
		--title-margin-bottom: 16px;
		--title-line-height: 1.1;
		--title-bg-primary: #1e293b;
		--title-bg-secondary: #475569;
		--title-letter-spacing: -0.02em;

		font-size: var(--title-font-size);
		font-weight: var(--title-font-weight);
		margin: 0 0 var(--title-margin-bottom) 0;
		line-height: var(--title-line-height);
		background: linear-gradient(135deg, var(--title-bg-primary), var(--title-bg-secondary));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: var(--title-letter-spacing);
	}

	.subtitle {
		--subtitle-font-size: 20px;
		--subtitle-font-weight: 500;
		--subtitle-margin-bottom: 32px;
		--subtitle-color: #64748b;
		--subtitle-line-height: 1.5;
		--subtitle-max-width: 600px;

		font-size: var(--subtitle-font-size);
		font-weight: var(--subtitle-font-weight);
		margin: 0 0 var(--subtitle-margin-bottom) 0;
		color: var(--subtitle-color);
		line-height: var(--subtitle-line-height);
		max-width: var(--subtitle-max-width);
		margin-left: auto;
		margin-right: auto;
	}

	.feature-pills {
		--pills-gap: 12px;
		--pills-margin-top: 32px;

		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--pills-gap);
		margin-top: var(--pills-margin-top);
	}

	.pill {
		--pill-bg: white;
		--pill-color: #475569;
		--pill-padding-y: 8px;
		--pill-padding-x: 16px;
		--pill-border-radius: 20px;
		--pill-font-size: 14px;
		--pill-font-weight: 500;
		--pill-border-color: #e2e8f0;
		--pill-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		--pill-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.08);
		--pill-transition: all 0.2s ease;

		background: var(--pill-bg);
		color: var(--pill-color);
		padding: var(--pill-padding-y) var(--pill-padding-x);
		border-radius: var(--pill-border-radius);
		font-size: var(--pill-font-size);
		font-weight: var(--pill-font-weight);
		border: 1px solid var(--pill-border-color);
		box-shadow: var(--pill-shadow);
		transition: var(--pill-transition);
	}

	.pill:hover {
		transform: translateY(-1px);
		box-shadow: var(--pill-shadow-hover);
	}

	.bg-elements {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		pointer-events: none;
	}

	.element {
		--element-bg-primary: rgba(59, 130, 246, 0.1);
		--element-bg-secondary: rgba(139, 92, 246, 0.1);
		--element-animation-duration: 6s;

		position: absolute;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--element-bg-primary), var(--element-bg-secondary));
		animation: float var(--element-animation-duration) ease-in-out infinite;
	}

	.element-1 {
		width: 200px;
		height: 200px;
		top: 10%;
		left: -5%;
		animation-delay: 0s;
	}

	.element-2 {
		width: 150px;
		height: 150px;
		top: 60%;
		right: -5%;
		animation-delay: 2s;
	}

	.element-3 {
		width: 100px;
		height: 100px;
		top: 30%;
		right: 20%;
		animation-delay: 4s;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
		}
	}

	@media (max-width: 768px) {
		.header-banner {
			--header-padding-top: 60px;
			--header-padding-bottom: 40px;
			--header-padding-horizontal: 20px;
		}

		.title {
			--title-font-size: 40px;
		}

		.subtitle {
			--subtitle-font-size: 18px;
		}

		.feature-pills {
			--pills-margin-top: 24px;
		}

		.element-1,
		.element-2,
		.element-3 {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.title {
			--title-font-size: 32px;
		}

		.subtitle {
			--subtitle-font-size: 16px;
		}

		.feature-pills {
			flex-direction: column;
			align-items: center;
		}
	}

	/* Dark theme overrides */
	:global([data-theme="dark"]) .header-banner {
		--header-bg-primary: #0f172a;
		--header-bg-secondary: #1e293b;
		--header-border-color: #334155;

		--badge-bg-primary: #7c3aed;
		--badge-bg-secondary: #a855f7;
		--badge-shadow-color: rgba(124, 58, 237, 0.3);

		--title-bg-primary: #ffffff;
		--title-bg-secondary: #f1f5f9;

		--subtitle-color: #cbd5e1;

		--pill-bg: #334155;
		--pill-color: #e2e8f0;
		--pill-border-color: #475569;
		--pill-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		--pill-shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.3);

		--element-bg-primary: rgba(124, 58, 237, 0.15);
		--element-bg-secondary: rgba(168, 85, 247, 0.15);
	}

	/* Fix title visibility in dark mode */
	:global([data-theme="dark"]) .title {
		background: none;
		-webkit-background-clip: unset;
		-webkit-text-fill-color: unset;
		background-clip: unset;
		color: #ffffff;
	}
</style>