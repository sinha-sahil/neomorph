import { CssVariableOverrides, HostStyleMap, ApplyResult } from './types';
import { setApplying } from './state';

const WEAVER_STYLE_ID = '__neomorph-weaver-overrides';

export function applyCssVariables(
  variables: CssVariableOverrides,
  hostStyleMap: HostStyleMap
): ApplyResult {
  setApplying(true);
  const applied: ApplyResult = {};

  try {
    for (const [hostName, vars] of Object.entries(variables)) {
      const appliedVars: Array<string> = [];

      if (hostName === 'document') {
        for (const [varName, value] of Object.entries(vars)) {
          document.documentElement.style.setProperty(varName, value);
          appliedVars.push(varName);
        }
      } else {
        for (const [entryName, hostEntry] of hostStyleMap) {
          if (entryName !== hostName) {
            continue;
          }
          if (!(hostEntry.target instanceof ShadowRoot)) {
            continue;
          }
          let styleEl = hostEntry.target.getElementById(WEAVER_STYLE_ID);
          if (styleEl === null) {
            styleEl = document.createElement('style');
            styleEl.id = WEAVER_STYLE_ID;
            hostEntry.target.appendChild(styleEl);
          }
          const declarations = Object.entries(vars)
            .map(([name, val]) => `${name}: ${val};`)
            .join(' ');
          styleEl.textContent = `:host { ${declarations} }`;
          appliedVars.push(...Object.keys(vars));
        }
      }

      applied[hostName] = appliedVars;
    }
  } finally {
    setTimeout(() => {
      setApplying(false);
    }, 0);
  }

  return applied;
}

export function clearAppliedVariables(hostStyleMap: HostStyleMap): void {
  setApplying(true);

  try {
    const rootStyle = document.documentElement.style;
    const propsToRemove: Array<string> = [];
    for (let i = 0; i < rootStyle.length; i++) {
      const prop = rootStyle[i];
      if (prop.startsWith('--')) {
        propsToRemove.push(prop);
      }
    }
    for (const prop of propsToRemove) {
      rootStyle.removeProperty(prop);
    }

    for (const [, hostEntry] of hostStyleMap) {
      if (hostEntry.target instanceof ShadowRoot) {
        const styleEl = hostEntry.target.getElementById(WEAVER_STYLE_ID);
        if (styleEl !== null) {
          styleEl.remove();
        }
      }
    }
  } finally {
    setTimeout(() => {
      setApplying(false);
    }, 0);
  }
}
