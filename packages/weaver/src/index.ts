import { setupListener, teardown } from './messaging';
import { loadConfigFromWindow } from './state';
import { loadTheme } from './storage';
import { scrapeCssVariables, getHostMap } from './scraper';
import { applyCssVariables } from './applier';

export { teardown };

function initWeaver() {
  try {
    loadConfigFromWindow();
    setupListener();
    restoreTheme();
    console.log('🕸️ Weaver initialized');
  } catch (error) {
    console.error('🕸️ Weaver: Error during initialization:', error);
    return null;
  }
}

function restoreTheme() {
  const theme = loadTheme();
  if (theme === null) {
    return;
  }

  scrapeCssVariables();
  applyCssVariables(theme, getHostMap());
  console.log('🕸️ Weaver: Restored saved theme');
}

function handleDOMReady(): void {
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWeaver, { once: true });
    } else {
      initWeaver();
    }
  } catch (error) {
    console.error('🕸️ Weaver: Failed to setup DOM ready handler:', error);
  }
}

handleDOMReady();
