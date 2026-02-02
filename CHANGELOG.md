# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Klavye desteği:** ESC ile modal kapatma (İptal), Enter ile onay (Seç/Tamam).
- **maxPoints:** Çoklu seçimde maksimum nokta sayısı sınırı; `initialPoints` ve harita tıklamasında uygulanır.
- **Koordinat kopyalama:** Tek seçimde koordinat satırı yanında "Kopyala" butonu; çoklu seçimde her satırda "Kopyala" butonu. `options.copyText` ile metin özelleştirilebilir.
- **Özel tile layer:** `tileLayerUrl`, `tileLayerAttribution`, `tileLayerMaxZoom` ile harita katmanı özelleştirme (koyu harita, uydu vb.).
- **Erişilebilirlik:** Odak yönetimi (açılışta ilk focusable, kapatırken önceki öğeye dönüş); Tab ile focus trap (modal içinde dolaşım); sil ve kopyala butonlarına `aria-label`; `:focus-visible` stilleri.
- **Seçim sınırı (bounds):** `bounds` ([[south, west], [north, east]]) veya `minLat`, `maxLat`, `minLng`, `maxLng` ile izin verilen bölge; tek ve çoklu seçimde uygulanır, `initialPoints` bounds dışındakiler atlanır.
- **TypeScript tipleri:** `src/async-map-modal.d.ts` ile `AsyncMapModalOptions`, `showMapModal`, default export tipleri.
- **CHANGELOG.md** ve package `types` / `files` güncellemesi.

## [1.1.0] — (same as Unreleased when released)

(Features listed under Unreleased will be moved here on release.)

## [1.0.0]

### Added

- İlk sürüm.
- Tek seçim modu: haritada tek nokta, Promise ile `{ lat, lng } | null`.
- Çoklu seçim modu: grid (sol harita, sağ liste), checkbox, tek/toplu silme, sıra numarası, `selected` sınıfı, numaralı marker ve popup.
- `markerIcon` ile özel marker ikonu.
- `initialPoints` ile çoklu seçimde başlangıç noktaları.
- Numaralı marker ikonu ve marker popup (tek/çoklu).
