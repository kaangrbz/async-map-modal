# Örnek / Demo

Bu klasör `async-map-modal` paketinin landing ve demo sayfasını içerir.

## Çalıştırma

ES modül kullanıldığı için doğrudan `file://` ile açmak çalışmaz. Proje kökünden basit bir HTTP sunucusu ile açın:

```bash
# Proje kökünden (async-map-modal/)
npx serve . -p 3000
```

Tarayıcıda: **http://localhost:3000/example/**

Alternatif: `yarn example` (proje kökünden).

## GitHub Pages

Repo’da **Settings > Pages > Source: GitHub Actions** seçiliyse, `main` veya `master`’a her push’ta `.github/workflows/example-pages.yml` çalışır ve örnek sayfa yayına alınır. Canlı adres: `https://<kullanıcı>.github.io/async-map-modal/example/`

## İçerik

- **Landing:** Hero, demo butonları, özellikler, kullanım kodu
- **Tek seçim:** Haritada tek nokta seçimi, sonuç aynı sayfada
- **Çoklu seçim:** Birden fazla nokta, sağda liste, checkbox ile silme
