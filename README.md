# AI Film Yarışması — İzleyici Oylama Sistemi

Uludağ Yazılım Topluluğu AI film yarışması için tasarladığım ve geliştirdiğim gerçek zamanlı izleyici puanlama platformu.

## Özellikler

- İzleyiciler telefonlarından QR kod ile bağlanıp oy verir
- 3 kriter üzerinden 1-10 arası puanlama: **Görsel Kalite**, **Senaryo & Hikaye**, **Yaratıcılık**
- Sonuçlar admin panelinde anlık güncellenir
- Her izleyici her projeye yalnızca 1 kez oy verebilir
- Admin paneli şifre korumalı

## Teknolojiler

- **Frontend:** HTML, CSS, JavaScript
- **Veritabanı & Realtime:** [Supabase](https://supabase.com)
- **Hosting:** [Netlify](https://netlify.com)

## Kullanım

### Admin Paneli
`/admin.html` adresini açın, şifreyi girin. Buradan:
- Proje ekleyip silebilirsiniz
- Oylamayı başlatıp durdurabilirsiniz
- QR kodu izleyicilere gösterebilirsiniz
- Anlık sonuçları takip edebilirsiniz

### Oylama Sayfası
`/vote.html` — izleyiciler QR kodu tarayarak buraya ulaşır ve projleri puanlar.

## Kurulum

1. [Supabase](https://supabase.com) üzerinde yeni proje oluşturun
2. `setup.sql` içindeki SQL komutlarını Supabase SQL Editor'da çalıştırın
3. `public/admin.html` ve `public/vote.html` içindeki `SUPABASE_URL` ve `SUPABASE_KEY` değerlerini doldurun
4. `public/` klasörünü [Netlify](https://netlify.com)'a deploy edin

## Geliştirici

**Ravan Novruzov**  
[Uludağ Yazılım Topluluğu](https://github.com/uludagyazilimtoplulugu)
