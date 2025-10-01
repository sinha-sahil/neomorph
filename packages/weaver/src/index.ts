import { setupListener } from './core';

function initWeaver() {
  try {
    console.log('🕸️ Weaver initialized - scraping CSS variables...');
    setupListener();
  } catch (error) {
    console.error('🕸️ Weaver: Error during CSS variable scraping:', error);
    return null;
  }
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
