/**
 * async-map-modal
 * Promise tabanlı harita modal: modal içinde Leaflet haritası açar, kullanıcı tıklayarak koordinat seçer,
 * seçim Promise ile döndürülür (async-modal tarzı API).
 * Çoklu seçim modunda liste sağda, checkbox ile seçim ve tek/toplu silme desteklenir.
 */

import './async-map-modal.css';

const DEFAULT_CENTER = [38.7143, 35.5323];
const DEFAULT_ZOOM = 13;
const MODAL_ID = 'async-map-modal-root';
const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_TILE_ATTRIBUTION = '© OpenStreetMap contributors';
const DEFAULT_TILE_MAX_ZOOM = 18;

/** Proje bazlı varsayılanlar: showMapModal çağrılarında options ile birleştirilir (options öncelikli). */
let _defaultConfig = { language: undefined, darkMode: undefined };

/** src/icons/content-copy.svg — inline: ek istek yok, currentColor ile renk uyumu. */
const CONTENT_COPY_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" class="async-map-modal-copy-icon-svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

/** Yerelleştirme: tüm metinler tek dosyada, harici yol kullanılmaz. */
const TRANSLATIONS = {
  tr: {
    title: 'Konum Seçin',
    titleMulti: 'Konumları Seçin',
    confirm: 'Seç',
    confirmMulti: 'Tamam',
    cancel: 'İptal',
    copy: 'Kopyala',
    deleteSelected: 'Seçilenleri sil',
    deleteAll: 'Tümünü sil',
    listTitle: 'Seçilen noktalar',
    fitBounds: 'Tümünü göster',
    lat: 'Lat',
    lng: 'Lng',
    placeholder: '0.0',
    ariaLat: 'Enlem',
    ariaLng: 'Boylam',
    ariaCopy: 'Koordinatı kopyala',
    ariaSelectAll: 'Tümünü seç',
    ariaFitBounds: 'Haritada tüm noktaları göster',
    ariaDeletePoint: 'Bu noktayı sil',
    ariaCheckboxLabel: 'Nokta {n} silinecekler listesine ekle',
    pointLabel: 'Nokta',
  },
  en: {
    title: 'Select location',
    titleMulti: 'Select locations',
    confirm: 'Select',
    confirmMulti: 'OK',
    cancel: 'Cancel',
    copy: 'Copy',
    deleteSelected: 'Delete selected',
    deleteAll: 'Delete all',
    listTitle: 'Selected points',
    fitBounds: 'Show all',
    lat: 'Lat',
    lng: 'Lng',
    placeholder: '0.0',
    ariaLat: 'Latitude',
    ariaLng: 'Longitude',
    ariaCopy: 'Copy coordinates',
    ariaSelectAll: 'Select all',
    ariaFitBounds: 'Show all points on map',
    ariaDeletePoint: 'Delete this point',
    ariaCheckboxLabel: 'Add point {n} to delete list',
    pointLabel: 'Point',
  },
  de: {
    title: 'Ort wählen',
    titleMulti: 'Orte wählen',
    confirm: 'Wählen',
    confirmMulti: 'OK',
    cancel: 'Abbrechen',
    copy: 'Kopieren',
    deleteSelected: 'Ausgewählte löschen',
    deleteAll: 'Alle löschen',
    listTitle: 'Ausgewählte Punkte',
    fitBounds: 'Alle anzeigen',
    lat: 'Lat',
    lng: 'Lng',
    placeholder: '0.0',
    ariaLat: 'Breitengrad',
    ariaLng: 'Längengrad',
    ariaCopy: 'Koordinaten kopieren',
    ariaSelectAll: 'Alle auswählen',
    ariaFitBounds: 'Alle Punkte auf Karte anzeigen',
    ariaDeletePoint: 'Diesen Punkt löschen',
    ariaCheckboxLabel: 'Punkt {n} zur Löschliste hinzufügen',
    pointLabel: 'Punkt',
  },
  es: {
    title: 'Seleccionar ubicación',
    titleMulti: 'Seleccionar ubicaciones',
    confirm: 'Seleccionar',
    confirmMulti: 'Aceptar',
    cancel: 'Cancelar',
    copy: 'Copiar',
    deleteSelected: 'Eliminar seleccionados',
    deleteAll: 'Eliminar todo',
    listTitle: 'Puntos seleccionados',
    fitBounds: 'Ver todos',
    lat: 'Lat',
    lng: 'Lng',
    placeholder: '0.0',
    ariaLat: 'Latitud',
    ariaLng: 'Longitud',
    ariaCopy: 'Copiar coordenadas',
    ariaSelectAll: 'Seleccionar todo',
    ariaFitBounds: 'Mostrar todos los puntos en el mapa',
    ariaDeletePoint: 'Eliminar este punto',
    ariaCheckboxLabel: 'Añadir punto {n} a la lista de borrado',
    pointLabel: 'Punto',
  },
  fr: {
    title: 'Choisir un lieu',
    titleMulti: 'Choisir des lieux',
    confirm: 'Choisir',
    confirmMulti: 'OK',
    cancel: 'Annuler',
    copy: 'Copier',
    deleteSelected: 'Supprimer la sélection',
    deleteAll: 'Tout supprimer',
    listTitle: 'Points sélectionnés',
    fitBounds: 'Tout afficher',
    lat: 'Lat',
    lng: 'Lng',
    placeholder: '0.0',
    ariaLat: 'Latitude',
    ariaLng: 'Longitude',
    ariaCopy: 'Copier les coordonnées',
    ariaSelectAll: 'Tout sélectionner',
    ariaFitBounds: 'Afficher tous les points sur la carte',
    ariaDeletePoint: 'Supprimer ce point',
    ariaCheckboxLabel: 'Ajouter le point {n} à la liste de suppression',
    pointLabel: 'Point',
  },
};

function getTranslations(lang) {
  const key = (lang && String(lang).toLowerCase().slice(0, 2)) || 'tr';
  return TRANSLATIONS[key] || TRANSLATIONS.tr;
}

/** darkMode: 'light' | 'dark' | 'auto' → 'light' | 'dark'. Varsayılan light; auto = sistem tercihi. */
function resolveTheme(darkMode) {
  if (darkMode === 'dark') return 'dark';
  if (darkMode === 'light') return 'light';
  if (darkMode === 'auto' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

/** Mevcut proje varsayılanlarını döner (kopya). */
export function getConfig() {
  return { language: _defaultConfig.language, darkMode: _defaultConfig.darkMode };
}

/** Proje bazlı varsayılanları tek seferde ayarlar. Sonraki showMapModal çağrılarında options ile birleştirilir. */
export function init(options = {}) {
  if (options.language !== undefined) _defaultConfig.language = options.language;
  if (options.darkMode !== undefined) _defaultConfig.darkMode = options.darkMode;
}

/** Varsayılan tema: 'light' | 'dark' | 'auto'. */
export function setTheme(theme) {
  _defaultConfig.darkMode = theme;
}

/** Varsayılan dil kodu: tr, en, de, es, fr. */
export function setLanguage(lang) {
  _defaultConfig.language = lang;
}

function getLeaflet() {
  if (typeof window === 'undefined') return null;
  return typeof window.L !== 'undefined' ? window.L : null;
}

function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Çoklu seçimde numaralı marker ikonu (1, 2, 3...) */
function createNumberedMarkerIcon(L, num) {
  return L.divIcon({
    className: 'async-map-modal-marker-num',
    html: `<span class="async-map-modal-marker-num-inner">${num}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function formatLatLng(lat, lng) {
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

/** Yapıştırılan metinden "lat, lng" veya "lat lng" formatında koordinat parse eder; geçerliyse { lat, lng }, değilse null. */
function parsePastedLatLng(text) {
  if (typeof text !== 'string') return null;
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** opts: bounds [[south, west], [north, east]] veya minLat, maxLat, minLng, maxLng */
function isInBounds(lat, lng, opts) {
  if (!opts) return true;
  const bounds = opts.bounds;
  if (bounds && Array.isArray(bounds) && bounds.length >= 2) {
    const [[south, west], [north, east]] = bounds;
    return lat >= south && lat <= north && lng >= west && lng <= east;
  }
  const { minLat, maxLat, minLng, maxLng } = opts;
  if (typeof minLat === 'number' && lat < minLat) return false;
  if (typeof maxLat === 'number' && lat > maxLat) return false;
  if (typeof minLng === 'number' && lng < minLng) return false;
  if (typeof maxLng === 'number' && lng > maxLng) return false;
  return true;
}

/**
 * Tekil seçim modu: tek nokta seçilir, Promise<{ lat, lng } | null> döner.
 */
function runSingleSelectMode(options, L, resolve) {
  const t = getTranslations(options.language);
  const title = options.title != null ? options.title : t.title;
  const initialCenter = options.initialCenter || DEFAULT_CENTER;
  const initialZoom = options.initialZoom ?? DEFAULT_ZOOM;
  const confirmText = options.confirmText != null ? options.confirmText : t.confirm;
  const cancelText = options.cancelText != null ? options.cancelText : t.cancel;
  const mapHeight = options.mapHeight != null ? options.mapHeight : '400px';
  const markerIcon = options.markerIcon ?? null;
  const copyText = options.copyText != null ? options.copyText : t.copy;

  let map = null;
  let marker = null;
  let selectedLat = null;
  let selectedLng = null;

  const root = document.getElementById(MODAL_ID);
  if (root) root.remove();

  const overlay = document.createElement('div');
  overlay.className = 'async-map-modal-overlay';
  overlay.id = MODAL_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'async-map-modal-title');
  overlay.setAttribute('data-theme', resolveTheme(options.darkMode));

  const content = document.createElement('div');
  content.className = 'async-map-modal-content';

  content.innerHTML = `
    <h2 id="async-map-modal-title" class="async-map-modal-title">${escapeHtml(title)}</h2>
    <div id="async-map-modal-map" class="async-map-modal-map" style="height: ${escapeHtml(mapHeight)}; width: 100%; min-height: 300px;"></div>
    <div class="async-map-modal-lat-lng-inputs">
      <label class="async-map-modal-lat-lng-label">${escapeHtml(t.lat)} <input type="text" id="async-map-modal-lat" class="async-map-modal-lat-lng-input" placeholder="${escapeHtml(t.placeholder)}" inputmode="decimal" aria-label="${escapeHtml(t.ariaLat)}"></label>
      <label class="async-map-modal-lat-lng-label">${escapeHtml(t.lng)} <input type="text" id="async-map-modal-lng" class="async-map-modal-lat-lng-input" placeholder="${escapeHtml(t.placeholder)}" inputmode="decimal" aria-label="${escapeHtml(t.ariaLng)}"></label>
      <button type="button" class="async-map-modal-chip async-map-modal-copy-btn async-map-modal-btn async-map-modal-btn-sm" disabled aria-label="${escapeHtml(t.ariaCopy)}" title="${escapeHtml(copyText)}"><span class="async-map-modal-copy-icon">${CONTENT_COPY_SVG}</span><span class="async-map-modal-copy-text">${escapeHtml(copyText)}</span></button>
    </div>
    <div class="async-map-modal-actions async-map-modal-chips">
      <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-cancel">${escapeHtml(cancelText)}</button>
      <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-confirm" disabled>${escapeHtml(confirmText)}</button>
    </div>
  `;

  overlay.appendChild(content);

  const mapEl = content.querySelector('#async-map-modal-map');
  const latInput = content.querySelector('#async-map-modal-lat');
  const lngInput = content.querySelector('#async-map-modal-lng');
  const copyBtn = content.querySelector('.async-map-modal-copy-btn');
  const confirmBtn = content.querySelector('.async-map-modal-confirm');
  const cancelBtn = content.querySelector('.async-map-modal-cancel');

  function parseLatLngFromInputs() {
    const lat = parseFloat(latInput.value.trim());
    const lng = parseFloat(lngInput.value.trim());
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    if (!isInBounds(lat, lng, options)) return null;
    return { lat, lng };
  }

  function applyInputsToMarker() {
    const parsed = parseLatLngFromInputs();
    if (!parsed) return;
    selectedLat = parsed.lat;
    selectedLng = parsed.lng;
    if (marker) map.removeLayer(marker);
    marker = L.marker([parsed.lat, parsed.lng], markerIcon ? { icon: markerIcon } : {}).addTo(map);
    marker.bindPopup(formatLatLng(parsed.lat, parsed.lng), { className: 'async-map-modal-marker-popup' });
    map.setView([parsed.lat, parsed.lng], map.getZoom(), { animate: true });
    updateCoords();
  }

  const previousActive = typeof document !== 'undefined' ? document.activeElement : null;

  function getFocusables() {
    return overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(null);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedLat != null && selectedLng != null) close({ lat: selectedLat, lng: selectedLng });
      return;
    }
    if (e.key === 'Tab') {
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function close(result) {
    document.removeEventListener('keydown', onKeydown);
    if (map) map.remove();
    map = null;
    marker = null;
    overlay.remove();
    if (previousActive && previousActive.focus) previousActive.focus();
    resolve(result);
  }

  function updateCoords() {
    if (selectedLat != null && selectedLng != null) {
      latInput.value = selectedLat.toFixed(6);
      lngInput.value = selectedLng.toFixed(6);
      confirmBtn.disabled = false;
      copyBtn.disabled = false;
    } else {
      latInput.value = '';
      lngInput.value = '';
      confirmBtn.disabled = true;
      copyBtn.disabled = true;
    }
  }

  latInput.addEventListener('change', applyInputsToMarker);
  lngInput.addEventListener('change', applyInputsToMarker);

  function onLatLngPaste(e) {
    const text = (e.clipboardData || (typeof window !== 'undefined' && window.clipboardData))?.getData?.('text');
    const parsed = parsePastedLatLng(text);
    if (!parsed || !isInBounds(parsed.lat, parsed.lng, options)) return;
    e.preventDefault();
    latInput.value = parsed.lat.toFixed(6);
    lngInput.value = parsed.lng.toFixed(6);
    applyInputsToMarker();
  }
  latInput.addEventListener('paste', onLatLngPaste);
  lngInput.addEventListener('paste', onLatLngPaste);

  copyBtn.addEventListener('click', () => {
    if (selectedLat == null || selectedLng == null) return;
    const text = formatLatLng(selectedLat, selectedLng);
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  });

  cancelBtn.addEventListener('click', () => close(null));
  confirmBtn.addEventListener('click', () => {
    if (selectedLat != null && selectedLng != null) close({ lat: selectedLat, lng: selectedLng });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(null);
  });

  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKeydown);
  cancelBtn.focus();

  const tileUrl = options.tileLayerUrl ?? DEFAULT_TILE_URL;
  const tileAttribution = options.tileLayerAttribution ?? DEFAULT_TILE_ATTRIBUTION;
  const tileMaxZoom = options.tileLayerMaxZoom ?? DEFAULT_TILE_MAX_ZOOM;

  map = L.map(mapEl, { center: initialCenter, zoom: initialZoom });
  L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: tileMaxZoom }).addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (!isInBounds(lat, lng, options)) return;
    selectedLat = lat;
    selectedLng = lng;
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng], markerIcon ? { icon: markerIcon } : {}).addTo(map);
    marker.bindPopup(formatLatLng(lat, lng), { className: 'async-map-modal-marker-popup' });
    map.setView([lat, lng], map.getZoom(), { animate: true });
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
    updateCoords();
  });

  updateCoords();
}

/**
 * Çoklu seçim modu: grid (sol harita, sağ liste), checkbox, tek/tümünü sil, Promise<Array<{ lat, lng }> | null>.
 */
function runMultiSelectMode(options, L, resolve) {
  const t = getTranslations(options.language);
  const title = options.title != null ? options.title : t.titleMulti;
  const initialCenter = options.initialCenter || DEFAULT_CENTER;
  const initialZoom = options.initialZoom ?? DEFAULT_ZOOM;
  const confirmText = options.confirmText != null ? options.confirmText : t.confirmMulti;
  const cancelText = options.cancelText != null ? options.cancelText : t.cancel;
  const mapHeight = options.mapHeight != null ? options.mapHeight : '400px';
  const deleteSelectedText = options.deleteSelectedText != null ? options.deleteSelectedText : t.deleteSelected;
  const deleteAllText = options.deleteAllText != null ? options.deleteAllText : t.deleteAll;
  const listTitle = options.listTitle != null ? options.listTitle : t.listTitle;
  const markerIcon = options.markerIcon ?? null;
  const initialPoints = Array.isArray(options.initialPoints) ? options.initialPoints : [];
  const maxPoints = typeof options.maxPoints === 'number' ? options.maxPoints : null;
  const copyText = options.copyText != null ? options.copyText : t.copy;
  const fitBoundsText = options.fitBoundsText != null ? options.fitBoundsText : t.fitBounds;

  const points = [];
  const markers = [];
  let map = null;
  let selectedIndex = -1;

  function addMarkerWithPopup(lat, lng, index1Based) {
    const opts = markerIcon
      ? { icon: markerIcon }
      : { icon: createNumberedMarkerIcon(L, index1Based) };
    const m = L.marker([lat, lng], opts).addTo(map);
    m.bindPopup(`${t.pointLabel} ${index1Based}: ${formatLatLng(lat, lng)}`, { className: 'async-map-modal-marker-popup' });
    return m;
  }

  const root = document.getElementById(MODAL_ID);
  if (root) root.remove();

  const overlay = document.createElement('div');
  overlay.className = 'async-map-modal-overlay';
  overlay.id = MODAL_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'async-map-modal-title');
  overlay.setAttribute('data-theme', resolveTheme(options.darkMode));

  const content = document.createElement('div');
  content.className = 'async-map-modal-content async-map-modal-content--multi';

  content.innerHTML = `
    <h2 id="async-map-modal-title" class="async-map-modal-title">${escapeHtml(title)}</h2>
    <div class="async-map-modal-grid">
      <div class="async-map-modal-grid-map">
        <div id="async-map-modal-map" class="async-map-modal-map" style="height: ${escapeHtml(mapHeight)}; min-height: 300px;"></div>
        <div class="async-map-modal-lat-lng-inputs">
          <label class="async-map-modal-lat-lng-label">${escapeHtml(t.lat)} <input type="text" id="async-map-modal-lat" class="async-map-modal-lat-lng-input" placeholder="${escapeHtml(t.placeholder)}" inputmode="decimal" aria-label="${escapeHtml(t.ariaLat)}"></label>
          <label class="async-map-modal-lat-lng-label">${escapeHtml(t.lng)} <input type="text" id="async-map-modal-lng" class="async-map-modal-lat-lng-input" placeholder="${escapeHtml(t.placeholder)}" inputmode="decimal" aria-label="${escapeHtml(t.ariaLng)}"></label>
          <button type="button" class="async-map-modal-chip async-map-modal-copy-btn async-map-modal-btn async-map-modal-btn-sm" disabled aria-label="${escapeHtml(t.ariaCopy)}" title="${escapeHtml(copyText)}"><span class="async-map-modal-copy-icon">${CONTENT_COPY_SVG}</span><span class="async-map-modal-copy-text">${escapeHtml(copyText)}</span></button>
        </div>
      </div>
      <div class="async-map-modal-list-panel">
        <div class="async-map-modal-list-header">
          <label class="async-map-modal-list-title">
            <input type="checkbox" class="async-map-modal-checkbox async-map-modal-select-all" aria-label="${escapeHtml(t.ariaSelectAll)}" />
            ${escapeHtml(listTitle)}
          </label>
          <div class="async-map-modal-list-actions async-map-modal-chips">
            <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-btn-sm async-map-modal-fit-bounds" disabled aria-label="${escapeHtml(t.ariaFitBounds)}" title="${escapeHtml(fitBoundsText)}">${escapeHtml(fitBoundsText)}</button>
            <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-btn-sm async-map-modal-delete-selected" disabled>${escapeHtml(deleteSelectedText)}</button>
            <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-btn-sm async-map-modal-delete-all">${escapeHtml(deleteAllText)}</button>
          </div>
        </div>
        <ul class="async-map-modal-list" id="async-map-modal-list"></ul>
      </div>
    </div>
    <div class="async-map-modal-actions async-map-modal-chips">
      <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-cancel">${escapeHtml(cancelText)}</button>
      <button type="button" class="async-map-modal-chip async-map-modal-btn async-map-modal-confirm">${escapeHtml(confirmText)}</button>
    </div>
  `;

  overlay.appendChild(content);

  const mapEl = content.querySelector('#async-map-modal-map');
  const listEl = content.querySelector('#async-map-modal-list');
  const latInput = content.querySelector('#async-map-modal-lat');
  const lngInput = content.querySelector('#async-map-modal-lng');
  const confirmBtn = content.querySelector('.async-map-modal-confirm');
  const cancelBtn = content.querySelector('.async-map-modal-cancel');
  const selectAllCb = content.querySelector('.async-map-modal-select-all');
  const deleteSelectedBtn = content.querySelector('.async-map-modal-delete-selected');
  const deleteAllBtn = content.querySelector('.async-map-modal-delete-all');
  const fitBoundsBtn = content.querySelector('.async-map-modal-fit-bounds');

  function focusMapOnPoint(index) {
    if (!map || index < 0 || index >= points.length) return;
    const p = points[index];
    map.setView([p.lat, p.lng], map.getZoom(), { animate: true });
  }

  function fitMapToAllPoints() {
    if (!map || points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], map.getZoom(), { animate: true });
      return;
    }
    try {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [20, 20], animate: true });
    } catch (_) {}
  }

  function parseLatLngFromInputs() {
    const lat = parseFloat(latInput.value.trim());
    const lng = parseFloat(lngInput.value.trim());
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    if (!isInBounds(lat, lng, options)) return null;
    return { lat, lng };
  }

  function syncInputsFromSelected() {
    if (selectedIndex >= 0 && selectedIndex < points.length) {
      const p = points[selectedIndex];
      latInput.value = p.lat.toFixed(6);
      lngInput.value = p.lng.toFixed(6);
      latInput.disabled = false;
      lngInput.disabled = false;
    } else {
      latInput.value = '';
      lngInput.value = '';
      latInput.disabled = true;
      lngInput.disabled = true;
    }
  }

  function applyInputsToMarker() {
    if (selectedIndex < 0 || selectedIndex >= points.length) return;
    const parsed = parseLatLngFromInputs();
    if (!parsed) return;
    points[selectedIndex] = { lat: parsed.lat, lng: parsed.lng };
    const m = markers[selectedIndex];
    if (m) {
      m.setLatLng([parsed.lat, parsed.lng]);
      m.setPopupContent(`${t.pointLabel} ${selectedIndex + 1}: ${formatLatLng(parsed.lat, parsed.lng)}`);
    }
    renderList();
    const li = listEl.querySelector(`.async-map-modal-list-item:nth-child(${selectedIndex + 1})`);
    if (li) {
      listEl.querySelectorAll('.async-map-modal-list-item').forEach((el) => el.classList.remove('selected'));
      li.classList.add('selected');
    }
  }

  const previousActive = typeof document !== 'undefined' ? document.activeElement : null;

  function getFocusables() {
    return overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(null);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      close(points.length ? points.map((p) => ({ lat: p.lat, lng: p.lng })) : []);
      return;
    }
    if (e.key === 'Tab') {
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function close(result) {
    document.removeEventListener('keydown', onKeydown);
    if (map) map.remove();
    map = null;
    overlay.remove();
    if (previousActive && previousActive.focus) previousActive.focus();
    resolve(result);
  }

  function removePoint(index) {
    if (index < 0 || index >= points.length) return;
    const m = markers[index];
    if (m && map) map.removeLayer(m);
    points.splice(index, 1);
    markers.splice(index, 1);
    if (selectedIndex === index) selectedIndex = -1;
    else if (selectedIndex > index) selectedIndex--;
    renderList();
    syncInputsFromSelected();
    syncCopyButton();
    deleteSelectedBtn.disabled = !listEl.querySelectorAll('.async-map-modal-item-cb:checked').length;
  }

  function removeSelected() {
    const checkboxes = listEl.querySelectorAll('.async-map-modal-item-cb:checked');
    const indices = Array.from(checkboxes).map((cb) => parseInt(cb.dataset.index, 10)).sort((a, b) => b - a);
    indices.forEach((i) => removePoint(i));
    selectAllCb.checked = false;
    deleteSelectedBtn.disabled = true;
  }

  function removeAll() {
    points.length = 0;
    markers.forEach((m) => { if (map) map.removeLayer(m); });
    markers.length = 0;
    selectedIndex = -1;
    renderList();
    syncInputsFromSelected();
    syncCopyButton();
    selectAllCb.checked = false;
    deleteSelectedBtn.disabled = true;
  }

  function renderList() {
    listEl.innerHTML = '';
    points.forEach((p, i) => {
      const li = document.createElement('li');
      li.className = 'async-map-modal-list-item';
      li.dataset.index = String(i);
      const coordsStr = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
      const ariaCheckbox = t.ariaCheckboxLabel.replace('{n}', String(i + 1));
      li.innerHTML = `
        <div class="async-map-modal-item-row" role="button" tabindex="0">
          <span class="async-map-modal-item-num" aria-hidden="true">${i + 1}</span>
          <input type="checkbox" class="async-map-modal-checkbox async-map-modal-item-cb" data-index="${i}" aria-label="${escapeHtml(ariaCheckbox)}" />
          <span class="async-map-modal-item-coords">${coordsStr}</span>
          <button type="button" class="async-map-modal-item-copy" aria-label="${escapeHtml(t.ariaCopy)}" title="${escapeHtml(copyText)}"><span class="async-map-modal-copy-icon">${CONTENT_COPY_SVG}</span><span class="async-map-modal-copy-text">${escapeHtml(copyText)}</span></button>
          <button type="button" class="async-map-modal-item-delete" data-index="${i}" aria-label="${escapeHtml(t.ariaDeletePoint)}">×</button>
        </div>
      `;
      const cb = li.querySelector('.async-map-modal-item-cb');
      const deleteOne = li.querySelector('.async-map-modal-item-delete');
      const copyOne = li.querySelector('.async-map-modal-item-copy');
      const row = li.querySelector('.async-map-modal-item-row');
      cb.addEventListener('change', () => {
        deleteSelectedBtn.disabled = !listEl.querySelectorAll('.async-map-modal-item-cb:checked').length;
      });
      deleteOne.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        removePoint(i);
      });
      copyOne.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(coordsStr).catch(() => {});
        }
      });
      function selectThisRow() {
        listEl.querySelectorAll('.async-map-modal-list-item').forEach((el) => el.classList.remove('selected'));
        li.classList.add('selected');
        selectedIndex = i;
        syncInputsFromSelected();
        syncCopyButton();
        focusMapOnPoint(i);
      }
      row.addEventListener('click', (e) => {
        if (e.target === cb || e.target === deleteOne || e.target === copyOne) return;
        selectThisRow();
      });
      row.addEventListener('keydown', (e) => {
        if (e.target === cb || e.target === deleteOne || e.target === copyOne) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectThisRow();
        }
      });
      listEl.appendChild(li);
    });
    if (fitBoundsBtn) fitBoundsBtn.disabled = points.length === 0;
  }

  selectAllCb.addEventListener('change', () => {
    listEl.querySelectorAll('.async-map-modal-item-cb').forEach((cb) => {
      cb.checked = selectAllCb.checked;
    });
    deleteSelectedBtn.disabled = !selectAllCb.checked;
  });

  deleteSelectedBtn.addEventListener('click', removeSelected);
  deleteAllBtn.addEventListener('click', removeAll);
  if (fitBoundsBtn) fitBoundsBtn.addEventListener('click', fitMapToAllPoints);

  cancelBtn.addEventListener('click', () => close(null));
  confirmBtn.addEventListener('click', () => close(points.length ? points.map((p) => ({ lat: p.lat, lng: p.lng })) : []));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(null);
  });

  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKeydown);
  cancelBtn.focus();

  const tileUrl = options.tileLayerUrl ?? DEFAULT_TILE_URL;
  const tileAttribution = options.tileLayerAttribution ?? DEFAULT_TILE_ATTRIBUTION;
  const tileMaxZoom = options.tileLayerMaxZoom ?? DEFAULT_TILE_MAX_ZOOM;

  map = L.map(mapEl, { center: initialCenter, zoom: initialZoom });
  L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: tileMaxZoom }).addTo(map);

  initialPoints.forEach((p) => {
    const lat = typeof p.lat === 'number' ? p.lat : p[0];
    const lng = typeof p.lng === 'number' ? p.lng : p[1];
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    if (!isInBounds(lat, lng, options)) return;
    if (typeof maxPoints === 'number' && points.length >= maxPoints) return;
    points.push({ lat, lng });
    const m = addMarkerWithPopup(lat, lng, points.length);
    markers.push(m);
  });
  if (initialPoints.length) {
    renderList();
    selectedIndex = points.length - 1;
    syncInputsFromSelected();
    const lastLi = listEl.querySelector('.async-map-modal-list-item:last-child');
    if (lastLi) {
      listEl.querySelectorAll('.async-map-modal-list-item').forEach((el) => el.classList.remove('selected'));
      lastLi.classList.add('selected');
    }
    if (points.length > 1 && map.getBounds) {
      try {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      } catch (_) {}
    }
  }

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (!isInBounds(lat, lng, options)) return;
    if (maxPoints != null && points.length >= maxPoints) return;
    const point = { lat, lng };
    points.push(point);
    const m = addMarkerWithPopup(lat, lng, points.length);
    markers.push(m);
    renderList();
    listEl.querySelectorAll('.async-map-modal-list-item').forEach((el) => el.classList.remove('selected'));
    const lastLi = listEl.querySelector('.async-map-modal-list-item:last-child');
    if (lastLi) lastLi.classList.add('selected');
    selectedIndex = points.length - 1;
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
    latInput.disabled = false;
    lngInput.disabled = false;
    deleteSelectedBtn.disabled = !listEl.querySelectorAll('.async-map-modal-item-cb:checked').length;
  });

  latInput.addEventListener('change', applyInputsToMarker);
  lngInput.addEventListener('change', applyInputsToMarker);

  function onLatLngPaste(e) {
    const text = (e.clipboardData || (typeof window !== 'undefined' && window.clipboardData))?.getData?.('text');
    const parsed = parsePastedLatLng(text);
    if (!parsed || !isInBounds(parsed.lat, parsed.lng, options)) return;
    e.preventDefault();
    latInput.value = parsed.lat.toFixed(6);
    lngInput.value = parsed.lng.toFixed(6);
    applyInputsToMarker();
  }
  latInput.addEventListener('paste', onLatLngPaste);
  lngInput.addEventListener('paste', onLatLngPaste);

  const copyBtn = content.querySelector('.async-map-modal-grid-map .async-map-modal-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const parsed = parseLatLngFromInputs();
      if (!parsed) return;
      const text = formatLatLng(parsed.lat, parsed.lng);
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    });
  }

  function syncCopyButton() {
    if (copyBtn) copyBtn.disabled = selectedIndex < 0 || selectedIndex >= points.length;
  }

  syncInputsFromSelected();
  syncCopyButton();
}

/**
 * Harita modalı gösterir.
 * - multiSelect: false (varsayılan) → tek nokta, Promise<{ lat, lng } | null>
 * - multiSelect: true → çoklu nokta, sağda liste, checkbox, tek/tümünü sil, Promise<Array<{ lat, lng }> | null>
 *
 * @param {Object} [options]
 * @param {boolean} [options.multiSelect=false]
 * @param {string} [options.title]
 * @param {[number, number]} [options.initialCenter]
 * @param {number} [options.initialZoom]
 * @param {string} [options.confirmText]
 * @param {string} [options.cancelText]
 * @param {string} [options.mapHeight]
 * @param {string} [options.deleteSelectedText='Seçilenleri sil']
 * @param {string} [options.deleteAllText='Tümünü sil']
 * @param {string} [options.listTitle='Seçilen noktalar']
 * @param {L.Icon|L.DivIcon} [options.markerIcon] - Özel marker ikonu (tek veya çoklu)
 * @param {Array<{ lat: number, lng: number }|[number, number]>} [options.initialPoints] - Çoklu seçimde başlangıç noktaları
 * @param {number} [options.maxPoints] - Çoklu seçimde maksimum nokta sayısı
 * @param {string} [options.tileLayerUrl] - Harita katmanı URL şablonu
 * @param {string} [options.tileLayerAttribution] - Katman attribution
 * @param {number} [options.tileLayerMaxZoom] - Katman max zoom
 * @param {[[number, number], [number, number]]} [options.bounds] - Seçim alanı [[güney, batı], [kuzey, doğu]]
 * @param {number} [options.minLat] [options.maxLat] [options.minLng] [options.maxLng] - Seçim alanı sınırları
 * @param {string} [options.copyText] - Kopyala butonu metni
 * @param {string} [options.fitBoundsText='Tümünü göster'] - Çoklu mod: haritada tüm noktaları göster butonu metni
 * @param {string} [options.language] - Dil kodu: tr, en, de, es, fr (varsayılan: tr). Tüm metinler paket içinde, harici dosya yok.
 * @param {string} [options.darkMode] - Tema: 'light' | 'dark' | 'auto' (varsayılan light; auto = sistem tercihi).
 * @param {object} [options.leaflet]
 * @returns {Promise<{ lat: number, lng: number } | Array<{ lat: number, lng: number }> | null>}
 */
export function showMapModal(options = {}) {
  const defaults = getConfig();
  const merged = { ...defaults, ...options };
  const L = merged.leaflet != null ? merged.leaflet : getLeaflet();
  if (!L) {
    return Promise.reject(
      new Error(
        'Leaflet bulunamadı. leaflet paketini yükleyin (yarn add leaflet) ve L global veya options.leaflet ile sağlayın.'
      )
    );
  }

  return new Promise((resolve) => {
    if (merged.multiSelect) {
      runMultiSelectMode(merged, L, resolve);
    } else {
      runSingleSelectMode(merged, L, resolve);
    }
  });
}

const asyncMapModal = {
  show: showMapModal,
  showMapModal,
  init,
  getConfig,
  setTheme,
  setLanguage,
};

export default asyncMapModal;

if (typeof window !== 'undefined') {
  window.asyncMapModal = asyncMapModal;
}
