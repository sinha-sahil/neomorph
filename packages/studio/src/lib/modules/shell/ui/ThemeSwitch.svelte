<script lang="ts">
  import { ThemeSwitcher, Tooltip } from '@juspay/svelte-ui-components';
  import { setThemeMode } from '../store';

  // Light / dark / system. The library manages the preference UI + persistence;
  // we apply the *resolved* value (system → the OS preference) to Studio's chrome.
  const options = [{ value: 'light' }, { value: 'dark' }, { value: 'system' }];

  function handleChange(_value: string, resolved: string): void {
    setThemeMode(resolved === 'dark' ? 'dark' : 'light');
  }
</script>

<Tooltip text="Studio theme" position="bottom" classes="tooltip-studio">
  <ThemeSwitcher
    {options}
    mode="segment"
    storageKey="neomorph-studio-theme"
    onchange={handleChange}
    classes="theme-switch"
  />
</Tooltip>
