<script lang="ts">
  import { Input } from '@juspay/svelte-ui-components';
  import type { TextEditorProps } from '../types';

  let { value, onChange }: TextEditorProps = $props();
</script>

<Input {value} dataType="text" onInput={(val: string) => onChange(val)} classes="input-token" />
