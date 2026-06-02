<script lang="ts">
	import { onMount } from 'svelte';
	import { Studio } from '$lib/studio';
	import { applyUrl, setUrlDraft } from '$lib/studio/store';
	import '../app.css';

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const fromQuery = params.get('appUrl');
		if (typeof fromQuery === 'string' && fromQuery.length > 0) {
			setUrlDraft(fromQuery);
			applyUrl();
		}
	});
</script>

<svelte:head>
	<title>Neomorph Studio</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
</svelte:head>

<Studio />
