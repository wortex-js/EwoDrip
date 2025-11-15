# EwoDrip 🔥

Modern streetwear e-ticaret platformu. React + TypeScript ile geliştirilmiş, hızlı ve responsive bir alışveriş deneyimi.

## Özellikler

- 🛒 Tam özellikli sepet sistemi
- 💳 Stripe ödeme entegrasyonu
- 🌍 Çok dilli destek (TR/EN)
- 📱 Responsive tasarım
- 🔐 Güvenli kullanıcı auth sistemi
- 📦 Admin paneli (ürün, sipariş yönetimi)
- 🎨 Modern UI (Tailwind CSS + Radix UI)

## Teknolojiler

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- tRPC
- Wouter (routing)

**Backend:**
- Node.js + Express
- tRPC
- Drizzle ORM
- MySQL
- Stripe

## Kurulum

### Gereksinimler

- Node.js 18+
- pnpm
- MySQL veritabanı

### Adımlar

1. Projeyi klonlayın:

```bash
git clone https://github.com/wortex213433/EwoDrip.git
cd EwoDrip
```

2. Bağımlılıkları yükleyin:

```bash
pnpm install
```

3. `.env` dosyası oluşturun:

```env
DATABASE_URL=mysql://user:password@localhost:3306/ewodrip
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_APP_ID=your-app-id
VITE_APP_TITLE=EwoDrip
VITE_OAUTH_PORTAL_URL=https://your-oauth-url
OAUTH_SERVER_URL=https://your-oauth-url
OWNER_OPEN_ID=your-owner-id
```

4. Veritabanını hazırlayın:

```bash
pnpm db:push
```

5. Test verileri ekleyin (opsiyonel):

```bash
node seed-data.mjs
```

6. Geliştirme sunucusunu başlatın:

```bash
pnpm dev
```

Uygulama `http://localhost:5173` adresinde çalışacak.

## Production Build

```bash
pnpm build
pnpm start
```

## Stripe Kurulumu

Stripe için test anahtarlarınızı `.env` dosyasına ekleyin. Webhook'ları test etmek için Stripe CLI kullanabilirsiniz:

```bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

## Admin Paneli

Admin paneline erişmek için veritabanında kullanıcı rolünüzü `admin` olarak ayarlayın:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Admin paneli: `/admin`

## Proje Yapısı

```
├── client/          # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── lib/
│   └── public/
├── server/          # Backend (Express + tRPC)
│   ├── _core/
│   └── routers/
├── drizzle/         # Veritabanı şemaları
└── shared/          # Ortak tipler
```

## Scriptler

- `pnpm dev` - Geliştirme sunucusu
- `pnpm build` - Production build
- `pnpm start` - Production sunucusu
- `pnpm check` - TypeScript kontrol
- `pnpm format` - Kod formatlama
- `pnpm test` - Testleri çalıştır
- `pnpm db:push` - Veritabanı migration

## Lisans

MIT

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.

---

Made by wortex213433

