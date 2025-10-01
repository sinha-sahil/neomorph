<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import type { SDKResponse } from 'skin-walker-sdk';

	let weaver: any;
	let cssVariables: SDKResponse | null = null;
	let appUrl = '';

	onMount(async () => {
		if (browser) {
			const { Weaver } = await import('skin-walker-sdk');
			appUrl = $page.url.searchParams.get('appUrl') || 'https://eldotto.myshopify.com/';
			weaver = new Weaver();

			// Load the application with callback
			weaver.loadApplication(appUrl, (response: SDKResponse | null) => {
				console.log('Received CSS variables:', response);
				cssVariables = response;
			});
		}
	});

	function startListening() {
		if (weaver) {
			weaver.listenCssVariables();
		}
	}
</script>

<h1>Welcome to Loomer!</h1>

<div class="app-info">
	<p><strong>Application URL:</strong> {appUrl}</p>
</div>

<div class="controls">
	<button on:click={startListening}>Listen for CSS Variables</button>
</div>

{#if cssVariables}
	<div class="css-variables">
		<h2>CSS Variables Response:</h2>
		<pre>{JSON.stringify(cssVariables, null, 2)}</pre>
	</div>
{/if}

<div class="iframe-container">
	<!-- Iframe will be created programmatically by the SDK -->
</div>

<style>
	.app-info {
		margin: 20px 0;
		padding: 15px;
		background: #e8f4fd;
		border-radius: 4px;
		border-left: 4px solid #007acc;
	}

	.app-info p {
		margin: 0;
		color: #333;
	}

	.controls {
		margin: 20px 0;
	}

	button {
		padding: 10px 20px;
		background: #007acc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background: #005999;
	}

	.css-variables {
		margin: 20px 0;
		padding: 20px;
		background: #f5f5f5;
		border-radius: 4px;
	}

	.css-variables h2 {
		margin-top: 0;
	}

	pre {
		background: white;
		padding: 10px;
		border-radius: 4px;
		overflow: auto;
		max-height: 400px;
	}

	.iframe-container {
		margin-top: 20px;
		min-height: 500px;
	}
</style>
