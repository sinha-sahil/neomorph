<script lang="ts">
  import { Banner, Button, Img, Modal, Pill, Tooltip } from '@juspay/svelte-ui-components';
  import {
    copyCss,
    downloadCss,
    generatedCss,
    hasOutput,
    highlightCss,
    outputStats
  } from '../export';
  import closeIcon from '$lib/assets/icons/close.svg?url';
  import codeIcon from '$lib/assets/icons/code.svg?url';
  import copyIcon from '$lib/assets/icons/copy.svg?url';

  let open = $state(false);
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  let subtitle = $derived(
    $hasOutput
      ? `${$outputStats.tokens} token${$outputStats.tokens === 1 ? '' : 's'} · ${$outputStats.elements} element${$outputStats.elements === 1 ? '' : 's'}`
      : 'No overrides yet'
  );

  function show(): void {
    open = true;
  }

  function close(): void {
    open = false;
    copied = false;
  }

  async function onCopy(): Promise<void> {
    const ok = await copyCss($generatedCss);
    if (!ok) {
      return;
    }
    copied = true;
    if (copyTimer !== null) {
      clearTimeout(copyTimer);
    }
    copyTimer = setTimeout(() => {
      copied = false;
    }, 1500);
  }

  function onDownload(): void {
    downloadCss($generatedCss);
  }
</script>

<Tooltip text="Export generated CSS" position="bottom" classes="tooltip-studio">
  <Button ariaLabel="Export generated CSS" onclick={show} classes="btn-icon">
    <Img src={codeIcon} alt="" classes="studio-icon icon-sm" />
  </Button>
</Tooltip>

{#if open}
  <Modal classes="export-modal" size="fit-content" align="center" onoverlayClick={close}>
    {#snippet content()}
      <section class="export">
        <header class="export-head">
          <div class="export-titles">
            <h2 class="export-title">Export CSS</h2>
            <Pill text={subtitle} classes="pill-stat" />
          </div>
          <Tooltip text="Close" position="left" classes="tooltip-studio">
            <Button ariaLabel="Close export dialog" onclick={close} classes="btn-icon">
              <Img src={closeIcon} alt="" classes="studio-icon icon-sm" />
            </Button>
          </Tooltip>
        </header>

        {#if $hasOutput}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlightCss() HTML-escapes its input before adding only our own <span> wrappers, so this is safe -->
          <pre class="export-code"><code>{@html highlightCss($generatedCss.trimEnd())}</code></pre>
        {:else}
          <Banner
            text="Edit a token or an element to generate CSS — then come back to copy or download the theme."
            classes="export-empty-banner"
          >
            {#snippet icon()}
              <Img src={codeIcon} alt="" classes="studio-icon icon-sm" />
            {/snippet}
          </Banner>
        {/if}

        <footer class="export-actions">
          <Button onclick={onCopy} disabled={!$hasOutput} classes="btn-secondary">
            <span class="btn-label">
              <Img src={copyIcon} alt="" classes="studio-icon icon-xs" />
              {copied ? 'Copied!' : 'Copy CSS'}
            </span>
          </Button>
          <Button onclick={onDownload} disabled={!$hasOutput} classes="btn-primary">
            Download .css
          </Button>
        </footer>
      </section>
    {/snippet}
  </Modal>
{/if}

<style>
  .export {
    display: flex;
    flex-direction: column;
    width: min(720px, 92vw);
    min-height: 0;
    box-sizing: border-box;
  }

  .export-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 20px 14px;
  }

  .export-titles {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .export-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .btn-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .export-code {
    margin: 0 20px;
    max-height: 52vh;
    overflow: auto;
    padding: 13px 16px;
    background: var(--bg-app);
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.55;
    color: var(--text);
    white-space: pre;
    tab-size: 2;
  }

  .export-code code {
    font-family: inherit;
  }

  .export-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
    padding: 14px 20px;
    border-top: 1px solid var(--border-strong);
  }
</style>
