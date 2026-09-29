// Single source of truth for the site's photo categories.
// Adding a new category later = add one entry here (plus a route in
// App.jsx and a case in Menu, if it should be nav-visible).

export const CATEGORIES = [
  { key: 'index', label: 'Index', path: '/index' },
  { key: 'event', label: 'Event', path: '/event' },
  { key: 'table', label: 'Table', path: '/table' },
  { key: 'onset', label: 'On Set', path: '/on-set' },
];

export const CATEGORY_KEYS = CATEGORIES.map(c => c.key);

export const DEFAULT_CATEGORY = 'index';

export const getCategoryLabel = key =>
  CATEGORIES.find(c => c.key === key)?.label || key;
