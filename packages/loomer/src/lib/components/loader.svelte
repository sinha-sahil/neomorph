<div class="loader">
	<svg width="48" height="48" viewBox="0 0 48 48">
		<circle
			cx="24"
			cy="24"
			r="19"
			fill="none"
			stroke="var(--loader-color, #212b36)"
			stroke-width="5"
			stroke-linecap="round"
			stroke-dasharray="75 25"
		/>
	</svg>
</div>

<style>
	.loader {
		width: 48px;
		height: 48px;
		display: inline-block;
		animation: rotation 1s linear infinite;
	}

	.loader svg {
		width: 100%;
		height: 100%;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
