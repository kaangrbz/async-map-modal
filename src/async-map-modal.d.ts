/**
 * TypeScript type definitions for async-map-modal.
 * Leaflet types: install @types/leaflet for L.* types, or use leaflet as any.
 */

export interface AsyncMapModalOptions {
  multiSelect?: boolean;
  title?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  confirmText?: string;
  cancelText?: string;
  mapHeight?: string;
  deleteSelectedText?: string;
  deleteAllText?: string;
  listTitle?: string;
  markerIcon?: unknown;
  initialPoints?: Array<{ lat: number; lng: number } | [number, number]>;
  leaflet?: unknown;
  maxPoints?: number;
  tileLayerUrl?: string;
  tileLayerAttribution?: string;
  tileLayerMaxZoom?: number;
  bounds?: [[number, number], [number, number]];
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  copyText?: string;
  /** Çoklu mod: "Tümünü göster" (fitBounds) butonu metni */
  fitBoundsText?: string;
  /** Dil kodu: tr, en, de, es, fr (varsayılan: tr). Tüm metinler paket içinde, harici dosya yok. */
  language?: string;
  /** Tema: 'light' | 'dark' | 'auto' (varsayılan light; auto = sistem tercihi). */
  darkMode?: 'light' | 'dark' | 'auto';
}

export type AsyncMapModalResult =
  | { lat: number; lng: number }
  | Array<{ lat: number; lng: number }>
  | null;

export function showMapModal(options?: AsyncMapModalOptions): Promise<AsyncMapModalResult>;

/** Proje bazlı varsayılanları tek seferde ayarlar (language, darkMode). */
export function init(options?: Partial<Pick<AsyncMapModalOptions, 'language' | 'darkMode'>>): void;

/** Mevcut proje varsayılanlarını döner. */
export function getConfig(): { language?: string; darkMode?: string };

/** Varsayılan tema: 'light' | 'dark' | 'auto'. */
export function setTheme(theme: 'light' | 'dark' | 'auto'): void;

/** Varsayılan dil kodu: tr, en, de, es, fr. */
export function setLanguage(lang: string): void;

declare const asyncMapModal: {
  show: typeof showMapModal;
  showMapModal: typeof showMapModal;
  init: typeof init;
  getConfig: typeof getConfig;
  setTheme: typeof setTheme;
  setLanguage: typeof setLanguage;
};

export default asyncMapModal;
