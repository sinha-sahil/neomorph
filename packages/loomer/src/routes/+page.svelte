<script lang="ts">
	function emitCssVariables() {
		window.parent.postMessage(
			JSON.stringify({
				source: 'loomer',
				stylesText: `
					:root{ 
						--primary-text-color: red;
					}
				`,
				styles: {}
			})
		);
	}
</script>

<h1>Welcome to Loomer!</h1>

<button onclick={emitCssVariables}> Test Emit CSS Variables </button>
