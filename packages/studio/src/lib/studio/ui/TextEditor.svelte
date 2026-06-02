<script lang="ts">
	import { Input } from '@juspay/svelte-ui-components';

	type Props = {
		value: string;
		onChange: (next: string) => void;
	};
	let { value, onChange }: Props = $props();
</script>

<Input {value} dataType="text" onInput={(val: string) => onChange(val)} classes="input-token" />
