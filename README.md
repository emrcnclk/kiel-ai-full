# KIEL-AI-FULL

KIEL-AI-FULL, uzmanlar ve aileleri birbirine bağlayan psikolojik ve eğitimsel destek platformudur. Platform, içerik yönetimi, aktiviteler, randevu sistemi, gerçek zamanlı sohbet ve AI destekli özellikler sunar.

## 🚀 Özellikler

### Kullanıcı Rolleri
- **Uzman (Expert)**: Blog yazıları oluşturabilir, aktiviteler ekleyebilir, randevu alabilir, mesajlaşabilir
- **Müşteri (Client)**: Blog yazılarını okuyabilir, aktiviteleri tamamlayabilir, randevu alabilir, mesajlaşabilir
- **Admin**: Tüm içeriği yönetebilir

### Ana Sistemler

1. **Kimlik Doğrulama ve Güvenlik**
   - JWT tabanlı kimlik doğrulama
   - Rol tabanlı erişim kontrolü
   - Şifre hashleme (bcrypt)

2. **Blog ve İçerik Sistemi**
   - Uzmanlar blog yazıları oluşturabilir
   - Kategoriler ve etiketler
   - Yayınlama durumu yönetimi
   - **Resim yükleme desteği**

3. **Aktivite/Oyun Sistemi**
   - Yaş ve zorluk seviyesine göre aktiviteler
   - Aktivite tamamlama takibi
   - AI destekli öneriler
   - **Resim yükleme desteği**

4. **Randevu Sistemi**
   - Uzmanlar takvim oluşturabilir
   - Müşteriler randevu alabilir
   - Çakışma kontrolü
   - Randevu durumu yönetimi

5. **Gerçek Zamanlı Sohbet**
   - Socket.IO ile 1-1 mesajlaşma
   - Okundu/okunmadı durumu
   - Mesaj geçmişi

6. **AI Özellikleri**
   - AI asistan sohbeti
   - İçerik özetleme
   - Aktivite önerileri

7. **Bildirim Sistemi**
   - Yeni randevu talepleri
   - Mesaj bildirimleri
   - Blog yayın bildirimleri

8. **Dosya Yükleme Sistemi** ✨
   - Blog görselleri
   - Aktivite görselleri
   - Profil fotoğrafları
   - Çoklu dosya desteği

9. **Pagination** ✨
   - Blog listesi
   - Aktivite listesi
   - Randevu listesi
   - Bildirim listesi
   - Mesaj listesi

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- MongoDB (v6 veya üzeri)
- npm veya yarn

## 🛠️ Kurulum

### Backend Kurulumu

1. Backend klasörüne gidin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kiel-ai-full
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
AI_API_URL=https://api.openai.com/v1
AI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

4. Backend'i başlatın:
```bash
npm run dev
```

Backend `http://localhost:5000` adresinde çalışacaktır.

5. (Opsiyonel) Otizm için özel aktiviteleri veritabanına ekleyin:
```bash
npm run seed:autism
```

### Frontend Kurulumu

1. Frontend klasörüne gidin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun (opsiyonel):
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Frontend'i başlatın:
```bash
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
kiel-ai-full/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB modelleri
│   │   ├── controllers/     # Route controller'ları
│   │   ├── routes/          # API route'ları
│   │   ├── services/        # İş mantığı servisleri
│   │   ├── middleware/      # Auth, error handling, upload middleware
│   │   ├── socket/           # Socket.IO yapılandırması
│   │   ├── utils/           # Yardımcı fonksiyonlar
│   │   └── server.ts        # Ana server dosyası
│   ├── uploads/             # Yüklenen dosyalar
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React bileşenleri
    │   │   └── Upload/      # Dosya yükleme bileşeni
    │   ├── pages/           # Sayfa bileşenleri
    │   ├── store/           # Redux store
    │   ├── types/           # TypeScript tipleri
    │   ├── utils/           # Yardımcı fonksiyonlar
    │   └── App.tsx          # Ana uygulama
    ├── package.json
    └── vite.config.ts
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `GET /api/auth/me` - Kullanıcı bilgileri

### Upload
- `POST /api/upload/single` - Tek dosya yükleme
- `POST /api/upload/multiple` - Çoklu dosya yükleme
- `DELETE /api/upload/:uploadType/:filename` - Dosya silme

### Blogs
- `GET /api/blogs?page=1&limit=10` - Blog listesi (pagination)
- `GET /api/blogs/:id` - Blog detayı
- `POST /api/blogs` - Blog oluştur (Expert/Admin)
- `PUT /api/blogs/:id` - Blog güncelle (Expert/Admin)
- `DELETE /api/blogs/:id` - Blog sil (Expert/Admin)

### Activities
- `GET /api/activities?page=1&limit=10` - Aktivite listesi (pagination)
- `GET /api/activities/:id` - Aktivite detayı
- `POST /api/activities` - Aktivite oluştur (Expert/Admin)
- `POST /api/activities/:id/complete` - Aktivite tamamla (Client)

### Appointments
- `GET /api/appointments?page=1&limit=10` - Randevu listesi (pagination)
- `POST /api/appointments` - Randevu oluştur
- `PATCH /api/appointments/:id/status` - Randevu durumu güncelle

### Notifications
- `GET /api/notifications?page=1&limit=20` - Bildirimler (pagination)
- `GET /api/notifications/unread-count` - Okunmamış sayısı
- `PATCH /api/notifications/:id/read` - Okundu işaretle

## 🗄️ Veritabanı Modelleri

- **User**: Kullanıcı bilgileri
- **ExpertProfile**: Uzman profil bilgileri (profileImageUrl)
- **ClientProfile**: Müşteri profil bilgileri (profileImageUrl)
- **Blog**: Blog yazıları (imageUrl)
- **Activity**: Aktiviteler (imageUrl)
- **ActivityCompletion**: Aktivite tamamlama kayıtları
- **Schedule**: Uzman takvimleri
- **Appointment**: Randevular
- **Message**: Mesajlar
- **Notification**: Bildirimler
- **AIChat**: AI sohbet geçmişi

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Şifreler bcrypt ile hashlenir
- Rol tabanlı erişim kontrolü (RBAC)
- CORS yapılandırması
- Input validation (express-validator)
- Dosya yükleme güvenliği (dosya türü ve boyut kontrolü)

## 📸 Dosya Yükleme

Platform, aşağıdaki dosya türlerini destekler:
- JPEG/JPG
- PNG
- GIF
- WEBP

Maksimum dosya boyutu: 5MB

Yükleme türleri:
- `blog` - Blog görselleri
- `activity` - Aktivite görselleri
- `profile` - Profil fotoğrafları
- `general` - Genel dosyalar

## 📄 Pagination

Tüm listeleme endpoint'leri pagination desteği sunar:
- `page` - Sayfa numarası (varsayılan: 1)
- `limit` - Sayfa başına öğe sayısı (varsayılan: 10, maksimum: 100)

Response formatı:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🤖 AI Entegrasyonu

Platform OpenAI uyumlu API'ler ile çalışır. `.env` dosyasında `AI_API_URL` ve `AI_API_KEY` değerlerini ayarlayın.

**Not:** AI API key yapılandırılmamışsa, sistem fallback yanıtlar kullanır ve çalışmaya devam eder.

## 🎮 Otizm Desteği Aktiviteleri

Platform, otizm spektrum bozukluğu olan çocuklar için özel olarak hazırlanmış aktiviteler içerir:

- **Basit Seviye**: Renk eşleştirme, şekil sıralama, duyusal oyunlar, basit puzzle
- **Orta Seviye**: Sosyal hikaye oyunları, duygu tanıma, kategorize etme, taklit oyunları
- **Zor Seviye**: Sosyal senaryo çözme, çok adımlı görevler, soyut düşünme, iletişim oyunları

Aktiviteler yaş aralıklarına göre (2-12 yaş) ve zorluk seviyelerine göre filtrelenebilir.

## 📝 Notlar

- MongoDB'nin çalıştığından emin olun
- Backend ve frontend'i ayrı terminal pencerelerinde çalıştırın
- Production ortamında güvenlik ayarlarını güncelleyin
- JWT secret'ları güçlü ve rastgele olmalıdır
- `uploads/` klasörü `.gitignore`'da olduğu için Git'e eklenmez

## 🐛 Sorun Giderme

- MongoDB bağlantı hatası: MongoDB'nin çalıştığından ve `MONGODB_URI`'nin doğru olduğundan emin olun
- CORS hatası: Backend'deki `FRONTEND_URL` ayarını kontrol edin
- Socket.IO bağlantı hatası: Backend'in çalıştığından ve token'ın geçerli olduğundan emin olun
- Dosya yükleme hatası: Dosya boyutunun 5MB'dan küçük olduğundan ve dosya türünün desteklendiğinden emin olun

## 📄 Lisans

Bu proje eğitim amaçlıdır.

## 👥 Katkıda Bulunanlar

Bu proje tam özellikli bir web uygulaması örneği olarak geliştirilmiştir.
