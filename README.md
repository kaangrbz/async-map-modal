# async-map-modal

Promise-based map modal component. Opens a Leaflet map inside a modal; the user selects coordinates by clicking on the map, and the selection is returned via a Promise. Designed with the same publishable structure (exports, style, API style) as the [async-modal](https://www.npmjs.com/package/async-modal) package.

## Features

- Promise-based API (async/await compatible)
- **Single selection** (default): one point on the map, returns `{ lat, lng } | null`
- **Multi selection** (`multiSelect: true`): multiple points on the map, list on the right; checkbox selection; delete one by one or delete selected/all; returns `Array<{ lat, lng }> | null`
- Grid layout: in multi-select mode, map on the left, selected points list on the right
- ES module, CommonJS, and global (`window.asyncMapModal`) support
- Styles can be imported separately (`async-map-modal/style`)
- Dependency: Leaflet only (peer dependency)
- Keyboard: ESC to close, Enter to confirm; Tab for focus trap inside the modal
- Copy coordinates (Copy button in single mode and on each list row in multi mode)
- Custom tile layer, selection bounds, max point count (maxPoints)
- Language option: `language` for tr, en, de, es, fr (all strings in-package, no external files)
- Theme: `darkMode: 'light' | 'dark' | 'auto'` (default light; auto = system preference)
- Project-wide defaults: `init()`, `setTheme()`, `setLanguage()`, `getConfig()` to set once
- TypeScript types (`src/async-map-modal.d.ts`)

**Before publishing:** Update the `repository`, `bugs`, and `homepage` URLs in `package.json`, replacing `your-username` with your username or organization.

## Installation

With Yarn:

```bash
yarn add async-map-modal leaflet
```

Include Leaflet CSS on the page (for Leaflet’s own styles):

```html
<link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css" />
```

Or in JS:

```js
import 'leaflet/dist/leaflet.css';
import 'async-map-modal/style';
```

## Usage

### ES Module

```js
import asyncMapModal from 'async-map-modal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'async-map-modal/style';

const result = await asyncMapModal.show({
  title: 'Select location',
  initialCenter: [39.93, 32.85],
  initialZoom: 10,
  confirmText: 'Select',
  cancelText: 'Cancel',
  leaflet: L,
});

if (result) {
  console.log('Selected coordinates:', result.lat, result.lng);
} else {
  console.log('Cancelled');
}
```

### Multi-select

With `multiSelect: true` the modal opens in grid layout: map on the left, selected points list on the right. Each row has a checkbox and a (×) button to remove that point; "Delete selected" and "Delete all" for bulk removal. "OK" returns the selected points as an array.

```js
const points = await asyncMapModal.show({
  multiSelect: true,
  title: 'Select locations',
  listTitle: 'Selected points',
  deleteSelectedText: 'Delete selected',
  deleteAllText: 'Delete all',
  leaflet: L,
});

if (points && points.length) {
  console.log('Selected coordinates:', points);
  // [{ lat, lng }, ...]
} else {
  console.log('Cancelled or empty list');
}
```

### Custom marker icon

Pass a Leaflet `L.Icon` or `L.DivIcon` via `markerIcon`:

```js
const redIcon = L.divIcon({
  className: 'my-marker',
  html: '<span style="width:16px;height:16px;background:#dc2626;border-radius:50%;display:block"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const result = await asyncMapModal.show({ markerIcon: redIcon, leaflet: L });
```

### Project-wide defaults (init, setTheme, setLanguage)

Set default language and theme once at app startup; subsequent `showMapModal` calls use these (overridable per call via options):

```js
import asyncMapModal from 'async-map-modal';

// All at once
asyncMapModal.init({ language: 'en', darkMode: 'dark' });

// Or separately
asyncMapModal.setLanguage('en');
asyncMapModal.setTheme('dark');   // 'light' | 'dark' | 'auto'

// Read current defaults
const config = asyncMapModal.getConfig(); // { language, darkMode }

// Later show() calls use these defaults
const result = await asyncMapModal.show({ leaflet: L });
```

### Language option

All UI strings are defined inside the package; no external locale files or paths. Pass a language code with `language` (tr, en, de, es, fr):

```js
const result = await asyncMapModal.show({
  language: 'en',
  leaflet: L,
});
// Modal text in English: "Select location", "Select", "Cancel", "Copy", etc.
```

### Multi-select with initial points

Pre-fill the list when the modal opens using `initialPoints` (user can edit and confirm):

```js
const points = await asyncMapModal.show({
  multiSelect: true,
  initialPoints: [{ lat: 39.93, lng: 32.85 }, { lat: 41.01, lng: 28.98 }],
  leaflet: L,
});
```

### CommonJS

```js
const asyncMapModal = require('async-map-modal');
const L = require('leaflet');
require('leaflet/dist/leaflet.css');
require('async-map-modal/style');

asyncMapModal.show({ leaflet: L }).then((result) => {
  if (result) console.log(result.lat, result.lng);
});
```

### Global (script tag)

After loading Leaflet and this package via script tags:

```js
const result = await window.asyncMapModal.show({
  title: 'Select location',
  leaflet: window.L,
});
```

## API

### `show(options)`

Opens the modal and returns a Promise based on the user’s selection.

**Parameters (options):**

| Parameter            | Type     | Default           | Description                          |
|----------------------|----------|-------------------|--------------------------------------|
| `multiSelect`        | boolean  | `false`           | Multi-select mode (grid + list)      |
| `title`              | string   | `'Select location'` | Modal title                        |
| `initialCenter`      | [number, number] | `[38.7143, 35.5323]` | Map initial center [lat, lng] |
| `initialZoom`        | number   | `13`              | Initial zoom level                   |
| `confirmText`        | string   | `'Select'` / `'OK'` | Confirm button label               |
| `cancelText`         | string   | `'Cancel'`        | Cancel button label                  |
| `mapHeight`          | string   | `'400px'`         | Map container height                 |
| `leaflet`            | object   | `window.L`        | Leaflet module (L)                   |
| `listTitle`          | string   | `'Selected points'` | (Multi) List header               |
| `deleteSelectedText` | string   | `'Delete selected'` | (Multi) Delete selected button    |
| `deleteAllText`      | string   | `'Delete all'`    | (Multi) Delete all button           |
| `markerIcon`         | L.Icon / L.DivIcon | — | Custom marker icon (single or multi) |
| `initialPoints`      | Array&lt;{ lat, lng }&gt; | — | (Multi) Points to show in list on open |
| `maxPoints`          | number   | —                 | (Multi) Maximum number of points     |
| `tileLayerUrl`       | string   | OSM               | Tile layer URL template              |
| `tileLayerAttribution` | string | OSM             | Tile layer attribution               |
| `tileLayerMaxZoom`   | number   | 18                | Tile layer max zoom                  |
| `bounds`             | [[number, number], [number, number]] | — | Selection area [[south, west], [north, east]] |
| `minLat`, `maxLat`, `minLng`, `maxLng` | number | — | Selection bounds (alternative to bounds) |
| `copyText`           | string   | `'Copy'`          | Copy button label                    |
| `fitBoundsText`      | string   | `'Show all'`      | (Multi) Show all points on map button |
| `language`           | string   | `'tr'`            | Language code: tr, en, de, es, fr. All strings in-package. |
| `darkMode`           | string   | `'light'`         | Theme: `'light'` \| `'dark'` \| `'auto'` (auto = system preference). |

**Returns:**

- **Single selection** (`multiSelect` false/omitted): `Promise<{ lat: number, lng: number } | null>`
  - User selects a point and confirms → `{ lat, lng }`; Cancel or overlay click → `null`
- **Multi selection** (`multiSelect: true`): `Promise<Array<{ lat: number, lng: number }> | null>`
  - User confirms → array of selected points (may be empty); Cancel or overlay click → `null`

## Styling

Default styles are included. Import:

```js
import 'async-map-modal/style';
```

CSS variables for customization:

- `--async-map-modal-z-index`: overlay z-index (default: 9999)
- `--async-map-modal-radius`: modal border radius (default: 8px)
- `--async-map-modal-shadow`: modal box shadow

## Requirements

- Leaflet >= 1.7.0 (peer dependency)
- Browser with ES6+ support

## License

MIT
