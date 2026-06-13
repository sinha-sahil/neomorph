<script lang="ts">
  import { Button, Input } from '@juspay/svelte-ui-components';
  import { applyUrl, dirty, setUrlDraft, target } from '../store';

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      applyUrl();
    }
  }
</script>

<div class="url-bar">
  <div class="url-input">
    <Input
      value={$target.urlDraft}
      dataType="text"
      placeholder="http://localhost:3000"
      onInput={(val: string) => setUrlDraft(val)}
      {onKeyDown}
      classes="input-url"
    />
  </div>
  {#if $dirty}
    <Button text="Load" ariaLabel="Load target URL" onclick={applyUrl} classes="btn-primary" />
  {/if}
</div>

<style>
  .url-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }

  .url-input {
    flex: 0 1 520px;
    min-width: 0;
  }
</style>
