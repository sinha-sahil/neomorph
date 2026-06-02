<script lang="ts">
	import { Browser } from '@juspay/svelte-ui-components';
	import { attachLoomer } from '../sdk-bridge';
	import { target } from '../store';

	function initLoomer(node: HTMLDivElement) {
		return attachLoomer(node, $target.appUrl);
	}
</script>

<section class="preview">
	{#key $target.appUrl}
		<Browser url={$target.appUrl} variant="light" classes="browser-flat">
			<div class="iframe-host" use:initLoomer></div>
		</Browser>
	{/key}
</section>

<style>
	.preview {
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 16px;
	}

	.iframe-host {
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	.iframe-host :global(iframe) {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}
</style>
