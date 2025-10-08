export function setupKeyboardShortcuts(onSave: () => void) {
	function handleKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			onSave();
		}
	}

	window.addEventListener('keydown', handleKeydown);

	return () => {
		window.removeEventListener('keydown', handleKeydown);
	};
}

export function getAppUrlFromQuery(): string | null {
	const url = new URL(window.location.href);
	return url.searchParams.get('appUrl');
}

// Theme management utilities
export type Theme = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'neomorph-theme';
const THEME_DATA_ATTRIBUTE = 'data-theme';

export function getStoredTheme(): Theme {
	if (typeof window === 'undefined') return 'auto';
	return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'auto';
}

export function setStoredTheme(theme: Theme): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
	if (theme === 'auto') {
		return getSystemTheme();
	}
	return theme;
}

export function applyTheme(theme: Theme): void {
	if (typeof document === 'undefined') return;

	const resolvedTheme = resolveTheme(theme);
	document.documentElement.setAttribute(THEME_DATA_ATTRIBUTE, resolvedTheme);

	// Also set class for compatibility
	document.documentElement.classList.remove('light', 'dark');
	document.documentElement.classList.add(resolvedTheme);
}

export function initializeTheme(): Theme {
	const storedTheme = getStoredTheme();
	applyTheme(storedTheme);
	return storedTheme;
}

export function toggleTheme(currentTheme: Theme): Theme {
	const themes: Theme[] = ['light', 'dark', 'auto'];
	const currentIndex = themes.indexOf(currentTheme);
	const nextIndex = (currentIndex + 1) % themes.length;
	const nextTheme = themes[nextIndex];

	setStoredTheme(nextTheme);
	applyTheme(nextTheme);

	return nextTheme;
}

export function setupSystemThemeListener(callback: (theme: 'light' | 'dark') => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	function handleChange(e: MediaQueryListEvent) {
		callback(e.matches ? 'dark' : 'light');
	}

	mediaQuery.addEventListener('change', handleChange);

	return () => {
		mediaQuery.removeEventListener('change', handleChange);
	};
}
