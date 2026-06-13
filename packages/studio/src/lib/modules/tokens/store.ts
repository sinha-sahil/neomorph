import { derived, writable, type Readable, type Writable } from 'svelte/store';
import { activeHostName, scraped } from '$lib/modules/connection';
import type { GroupDescriptor, TokenGroup } from './types';
import { kindGroup } from './utils';

const searchStore: Writable<string> = writable('');

export const search: Readable<string> = { subscribe: searchStore.subscribe };

export function setSearch(value: string): void {
  searchStore.set(value);
}

const GROUP_ORDER: GroupDescriptor[] = [
  { name: 'color', label: 'Colors' },
  { name: 'typography', label: 'Typography' },
  { name: 'sizing', label: 'Sizing' },
  { name: 'shadow', label: 'Shadows' },
  { name: 'motion', label: 'Motion' },
  { name: 'numeric', label: 'Numeric' },
  { name: 'alias', label: 'Aliases' },
  { name: 'default', label: 'Other' }
];

export const groupedVariables: Readable<TokenGroup[]> = derived(
  [scraped, searchStore, activeHostName],
  ([$scraped, $search, $activeHost]) => {
    if ($scraped.scraped === null || typeof $activeHost !== 'string') {
      return [];
    }
    const host = $scraped.scraped[$activeHost];
    if (typeof host !== 'object') {
      return [];
    }
    const term = $search.trim().toLowerCase();
    const filtered =
      term.length === 0
        ? host.variables
        : host.variables.filter((v) => v.name.toLowerCase().includes(term));

    return GROUP_ORDER.map<TokenGroup>(({ name, label }) => ({
      name,
      label,
      variables: filtered.filter((v) => kindGroup(v.kind) === name)
    })).filter((g) => g.variables.length > 0);
  }
);

export const filteredCount: Readable<number> = derived(groupedVariables, (groups) =>
  groups.reduce((sum, g) => sum + g.variables.length, 0)
);
