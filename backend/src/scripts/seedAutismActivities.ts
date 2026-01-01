import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Activity } from '../models/Activity.model';
import { User } from '../models/User.model';

dotenv.config();

const autismActivities = [
  // BASIT SEVİYE
  {
    title: 'Renk Eşleştirme Oyunu',
    description: 'Çocuğun renkleri tanıması ve eşleştirmesi için basit bir aktivite. Görsel algı ve dikkat becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 2, max: 5 },
    difficulty: 'easy',
    instructions: `1. Farklı renklerde kartlar hazırlayın (kırmızı, mavi, sarı, yeşil)
2. Çocuğa bir renk kartı gösterin
3. Aynı renkteki diğer kartları bulmasını isteyin
4. Her eşleştirmede tebrik edin ve ödüllendirin
5. Zorluk seviyesini yavaşça artırın`,
    materials: ['Renkli kartlar', 'Renkli bloklar', 'Renkli kalemler'],
    estimatedDuration: 15,
  },
  {
    title: 'Şekil Sıralama',
    description: 'Geometrik şekilleri tanıma ve sıralama aktivitesi. Motor beceriler ve kavram gelişimini destekler.',
    category: 'Otizm Desteği',
    ageRange: { min: 3, max: 6 },
    difficulty: 'easy',
    instructions: `1. Farklı şekillerde bloklar hazırlayın (daire, kare, üçgen)
2. Çocuğa şekilleri gösterin ve isimlerini söyleyin
3. Şekilleri büyüklüklerine göre sıralamasını isteyin
4. Her doğru sıralamada övgü kullanın
5. Zamanla daha karmaşık şekiller ekleyin`,
    materials: ['Şekilli bloklar', 'Şekil sıralama kutusu'],
    estimatedDuration: 20,
  },
  {
    title: 'Duyusal Oyun - Dokunma Kutusu',
    description: 'Farklı dokuları keşfetme aktivitesi. Duyusal işleme becerilerini geliştirir ve rahatlatıcı etkisi vardır.',
    category: 'Otizm Desteği',
    ageRange: { min: 2, max: 7 },
    difficulty: 'easy',
    instructions: `1. Bir kutuya farklı dokularda malzemeler koyun (pamuk, kum, su, yumuşak oyuncak)
2. Çocuğun gözleri kapalıyken dokunmasını sağlayın
3. Hissettiği şeyi tanımlamasına yardımcı olun
4. Yumuşak, sert, pürüzlü gibi kavramları öğretin
5. Çocuk rahatsız olursa durdurun`,
    materials: ['Kutu', 'Farklı dokularda malzemeler', 'Göz bandı (opsiyonel)'],
    estimatedDuration: 15,
  },
  {
    title: 'Basit Puzzle Yapımı',
    description: '2-4 parçalı puzzle yapımı. Görsel-motor koordinasyon ve problem çözme becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 3, max: 6 },
    difficulty: 'easy',
    instructions: `1. Basit, büyük parçalı puzzle seçin (2-4 parça)
2. Puzzle'ı çocuğun önüne koyun
3. Parçaları birleştirmesine rehberlik edin
4. Her parça yerleştiğinde tebrik edin
5. Başarılı olduğunda daha zor puzzle'lara geçin`,
    materials: ['Basit puzzle (2-4 parça)', 'Düz zemin'],
    estimatedDuration: 20,
  },
  
  // ORTA SEVİYE
  {
    title: 'Sosyal Hikaye Oyunu',
    description: 'Günlük durumları canlandırma aktivitesi. Sosyal beceriler ve empati gelişimini destekler.',
    category: 'Otizm Desteği',
    ageRange: { min: 4, max: 8 },
    difficulty: 'medium',
    instructions: `1. Günlük bir durum seçin (oyuncak paylaşma, selamlaşma)
2. Durumu basit hikaye kartlarıyla anlatın
3. Çocukla birlikte durumu canlandırın
4. Doğru davranışları modelleyin
5. Çocuğun da denemesini sağlayın ve övgü kullanın`,
    materials: ['Hikaye kartları', 'Oyuncaklar', 'Kostümler (opsiyonel)'],
    estimatedDuration: 30,
  },
  {
    title: 'Duygu Tanıma Kartları',
    description: 'Farklı duyguları tanıma ve ifade etme aktivitesi. Duygusal zeka ve iletişim becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 4, max: 9 },
    difficulty: 'medium',
    instructions: `1. Farklı duyguları gösteren kartlar hazırlayın (mutlu, üzgün, kızgın, korkmuş)
2. Her kartı gösterin ve duygunun adını söyleyin
3. Çocuğun duyguyu taklit etmesini isteyin
4. Hangi durumlarda bu duyguları hissettiğini sorun
5. Kendi duygularını ifade etmesine yardımcı olun`,
    materials: ['Duygu kartları', 'Ayna', 'Resimler'],
    estimatedDuration: 25,
  },
  {
    title: 'Sıralama ve Kategorize Etme',
    description: 'Nesneleri kategorilere ayırma aktivitesi. Bilişsel organizasyon ve mantıksal düşünme becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 4, max: 8 },
    difficulty: 'medium',
    instructions: `1. Farklı kategorilerde nesneler toplayın (hayvanlar, meyveler, oyuncaklar)
2. Her kategori için bir kutu veya alan hazırlayın
3. Çocuğun nesneleri doğru kategorilere yerleştirmesini isteyin
4. Her doğru yerleştirmede övgü kullanın
5. Zamanla daha karmaşık kategoriler ekleyin`,
    materials: ['Farklı kategorilerde nesneler', 'Kategoriler için kutular'],
    estimatedDuration: 30,
  },
  {
    title: 'Taklit Oyunu',
    description: 'Basit hareketleri taklit etme aktivitesi. Motor planlama ve dikkat becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 3, max: 7 },
    difficulty: 'medium',
    instructions: `1. Basit hareketler seçin (el sallama, zıplama, alkışlama)
2. Hareketi yavaşça yapın ve çocuğun izlemesini sağlayın
3. Çocuğun aynı hareketi yapmasını isteyin
4. Başarılı olduğunda tebrik edin
5. Zamanla daha karmaşık hareket dizileri ekleyin`,
    materials: ['Açık alan', 'Müzik (opsiyonel)'],
    estimatedDuration: 20,
  },
  
  // ZOR SEVİYE
  {
    title: 'Sosyal Senaryo Çözme',
    description: 'Karmaşık sosyal durumları anlama ve çözüm üretme aktivitesi. Sosyal problem çözme becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 6, max: 12 },
    difficulty: 'hard',
    instructions: `1. Gerçek hayat senaryoları hazırlayın (arkadaşla anlaşmazlık, yardım isteme)
2. Senaryoyu çocuğa anlatın veya gösterin
3. Durum hakkında sorular sorun
4. Olası çözümleri birlikte düşünün
5. En iyi çözümü seçin ve rol yaparak uygulayın`,
    materials: ['Senaryo kartları', 'Rol yapma materyalleri'],
    estimatedDuration: 40,
  },
  {
    title: 'Çok Adımlı Görev Tamamlama',
    description: 'Birden fazla adımdan oluşan görevleri tamamlama aktivitesi. İşleyen bellek ve planlama becerilerini geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 5, max: 10 },
    difficulty: 'hard',
    instructions: `1. 3-5 adımlı bir görev seçin (örnek: masayı hazırlama)
2. Adımları görsel olarak gösterin (kartlar veya resimler)
3. Çocuğun adımları sırayla takip etmesini sağlayın
4. Her adımı tamamladığında işaretleyin
5. Tüm görevi tamamladığında büyük övgü kullanın`,
    materials: ['Görev kartları', 'Gerekli materyaller', 'İşaretleme sistemi'],
    estimatedDuration: 45,
  },
  {
    title: 'Soyut Düşünme Oyunları',
    description: 'Soyut kavramları anlama ve uygulama aktivitesi. Bilişsel esneklik ve yaratıcı düşünmeyi geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 6, max: 12 },
    difficulty: 'hard',
    instructions: `1. Soyut kavramlar seçin (adalet, dostluk, sorumluluk)
2. Kavramı somut örneklerle açıklayın
3. Çocuğun kendi örneklerini vermesini isteyin
4. Farklı durumlarda kavramı nasıl uygulayacağını sorun
5. Yaratıcı çözümler üretmesine yardımcı olun`,
    materials: ['Kavram kartları', 'Hikaye kitapları', 'Resimler'],
    estimatedDuration: 40,
  },
  {
    title: 'İletişim Oyunu - Soru-Cevap',
    description: 'Karşılıklı konuşma ve soru sorma aktivitesi. İletişim becerileri ve sosyal etkileşimi geliştirir.',
    category: 'Otizm Desteği',
    ageRange: { min: 5, max: 11 },
    difficulty: 'hard',
    instructions: `1. Konuşma konuları belirleyin (hobiler, aile, okul)
2. Çocuğa açık uçlu sorular sorun
3. Cevap vermesine zaman tanıyın
4. İlgili takip soruları sorun
5. Çocuğun da size soru sormasını teşvik edin`,
    materials: ['Konuşma kartları', 'Zamanlayıcı'],
    estimatedDuration: 30,
  },
  
  // GENEL ÇOCUK AKTİVİTELERİ
  {
    title: 'Boya ve Çizim Atölyesi',
    description: 'Yaratıcılığı geliştiren boyama ve çizim aktivitesi. İnce motor becerileri ve hayal gücünü destekler.',
    category: 'Sanat ve Yaratıcılık',
    ageRange: { min: 3, max: 10 },
    difficulty: 'easy',
    instructions: `1. Çocuğa farklı boya türleri sunun (sulu boya, pastel, kuru boya)
2. Serbest çizim yapmasına izin verin
3. Renkleri karıştırmayı öğretin
4. Çalışmasını övün ve sergileyin
5. Farklı temalar önerin (doğa, hayvanlar, aile)`,
    materials: ['Kağıt', 'Boyalar', 'Fırçalar', 'Kalemler'],
    estimatedDuration: 30,
  },
  {
    title: 'Müzik ve Dans',
    description: 'Ritm ve hareket aktivitesi. Motor koordinasyon ve müzik algısını geliştirir.',
    category: 'Müzik ve Hareket',
    ageRange: { min: 2, max: 8 },
    difficulty: 'easy',
    instructions: `1. Çocuğun sevdiği müzikleri açın
2. Basit dans hareketleri yapın
3. Çocuğun taklit etmesini sağlayın
4. Ritm tutma oyunları oynayın
5. Eğlenmeyi ön planda tutun`,
    materials: ['Müzik çalar', 'Müzik', 'Açık alan'],
    estimatedDuration: 20,
  },
  {
    title: 'Hikaye Okuma ve Anlatma',
    description: 'Okuma ve anlatma becerilerini geliştiren aktivite. Dil gelişimi ve hayal gücünü destekler.',
    category: 'Dil ve Okuma',
    ageRange: { min: 3, max: 10 },
    difficulty: 'medium',
    instructions: `1. Yaşa uygun bir hikaye kitabı seçin
2. Resimleri göstererek okuyun
3. Hikaye hakkında sorular sorun
4. Çocuğun hikayeyi anlatmasını isteyin
5. Kendi hikayesini oluşturmasını teşvik edin`,
    materials: ['Hikaye kitapları', 'Resimli kitaplar'],
    estimatedDuration: 25,
  },
  {
    title: 'Doğa Keşfi',
    description: 'Doğayı gözlemleme ve keşfetme aktivitesi. Merak duygusu ve bilimsel düşünmeyi geliştirir.',
    category: 'Doğa ve Bilim',
    ageRange: { min: 4, max: 12 },
    difficulty: 'medium',
    instructions: `1. Park veya bahçeye çıkın
2. Farklı bitkileri, böcekleri gözlemleyin
3. Çocuğun sorular sormasını teşvik edin
4. Topladığınız şeyleri inceleyin
5. Doğa günlüğü tutun`,
    materials: ['Büyüteç', 'Not defteri', 'Kalem'],
    estimatedDuration: 45,
  },
  {
    title: 'Yapboz ve Bulmaca',
    description: 'Problem çözme ve dikkat becerilerini geliştiren aktivite. Görsel-motor koordinasyonu destekler.',
    category: 'Zeka Oyunları',
    ageRange: { min: 4, max: 12 },
    difficulty: 'medium',
    instructions: `1. Yaşa uygun yapboz seçin
2. Parçaları düzenleyin
3. Birlikte yapbozu tamamlayın
4. Strateji geliştirmesine yardımcı olun
5. Tamamlandığında kutlayın`,
    materials: ['Yapboz', 'Bulmaca kitapları'],
    estimatedDuration: 30,
  },
  {
    title: 'Mutfak Atölyesi',
    description: 'Basit yemek yapma aktivitesi. Sorumluluk ve öz bakım becerilerini geliştirir.',
    category: 'Yaşam Becerileri',
    ageRange: { min: 5, max: 12 },
    difficulty: 'medium',
    instructions: `1. Basit bir tarif seçin (kurabiye, sandviç)
2. Malzemeleri hazırlayın
3. Adım adım yapımı gösterin
4. Çocuğun yardım etmesini sağlayın
5. Birlikte yiyin ve tadın`,
    materials: ['Tarif', 'Malzemeler', 'Mutfak eşyaları'],
    estimatedDuration: 40,
  },
  {
    title: 'Spor ve Fiziksel Aktivite',
    description: 'Fiziksel gelişimi destekleyen aktivite. Koordinasyon ve dayanıklılığı geliştirir.',
    category: 'Spor ve Fiziksel Aktivite',
    ageRange: { min: 3, max: 12 },
    difficulty: 'easy',
    instructions: `1. Açık havada oyun oynayın
2. Top oyunları yapın
3. Koşu, zıplama aktiviteleri
4. Eğlenceli yarışmalar düzenleyin
5. Güvenliği ön planda tutun`,
    materials: ['Top', 'Açık alan', 'Spor ekipmanları'],
    estimatedDuration: 30,
  },
  {
    title: 'Lego ve Yapı Oyunları',
    description: 'Yapı inşa etme aktivitesi. Yaratıcılık ve mühendislik düşüncesini geliştirir.',
    category: 'Yapı ve İnşa',
    ageRange: { min: 4, max: 12 },
    difficulty: 'medium',
    instructions: `1. Lego veya yapı blokları hazırlayın
2. Basit bir model gösterin
3. Çocuğun taklit etmesini sağlayın
4. Kendi tasarımını yapmasını teşvik edin
5. Yapıyı sergileyin ve övün`,
    materials: ['Lego', 'Yapı blokları', 'Yapı setleri'],
    estimatedDuration: 35,
  },
  {
    title: 'Hayvan Bakımı ve Gözlem',
    description: 'Hayvanları tanıma ve bakım aktivitesi. Empati ve sorumluluk duygusunu geliştirir.',
    category: 'Doğa ve Bilim',
    ageRange: { min: 4, max: 12 },
    difficulty: 'medium',
    instructions: `1. Evcil hayvan veya hayvanat bahçesi ziyareti
2. Hayvanları gözlemleyin
3. Özelliklerini tartışın
4. Bakım ihtiyaçlarını öğretin
5. Hayvan sevgisini pekiştirin`,
    materials: ['Hayvan kitapları', 'Gözlem defteri'],
    estimatedDuration: 40,
  },
  {
    title: 'Bilim Deneyleri',
    description: 'Basit bilim deneyleri yapma aktivitesi. Merak ve bilimsel düşünmeyi geliştirir.',
    category: 'Doğa ve Bilim',
    ageRange: { min: 6, max: 12 },
    difficulty: 'hard',
    instructions: `1. Güvenli bir deney seçin (volkan, renk karışımı)
2. Malzemeleri hazırlayın
3. Adım adım deneyi yapın
4. Sonuçları gözlemleyin ve tartışın
5. Bilimsel açıklamalar yapın`,
    materials: ['Deney malzemeleri', 'Güvenlik ekipmanları'],
    estimatedDuration: 45,
  },
  {
    title: 'Origami ve Kağıt Sanatı',
    description: 'Kağıt katlama sanatı aktivitesi. El becerisi ve sabır geliştirir.',
    category: 'Sanat ve Yaratıcılık',
    ageRange: { min: 5, max: 12 },
    difficulty: 'medium',
    instructions: `1. Basit origami modelleri seçin
2. Adım adım katlama yapın
3. Çocuğun takip etmesini sağlayın
4. Yardıma ihtiyaç duyduğunda destek olun
5. Tamamlanan eserleri sergileyin`,
    materials: ['Origami kağıdı', 'Tutorial videoları'],
    estimatedDuration: 30,
  },
  {
    title: 'Bahçe ve Bitki Yetiştirme',
    description: 'Bitki yetiştirme ve bakım aktivitesi. Sorumluluk ve doğa sevgisini geliştirir.',
    category: 'Doğa ve Bilim',
    ageRange: { min: 4, max: 12 },
    difficulty: 'easy',
    instructions: `1. Kolay yetişen bitkiler seçin (fasulye, marul)
2. Tohumları ekin
3. Düzenli sulama yapın
4. Büyümeyi gözlemleyin
5. Hasat zamanını bekleyin`,
    materials: ['Tohumlar', 'Toprak', 'Saksı', 'Su'],
    estimatedDuration: 60,
  },
  {
    title: 'Masa Oyunları',
    description: 'Strateji ve düşünme oyunları. Sosyal beceriler ve mantık geliştirir.',
    category: 'Zeka Oyunları',
    ageRange: { min: 5, max: 12 },
    difficulty: 'medium',
    instructions: `1. Yaşa uygun masa oyunu seçin
2. Kuralları açıklayın
3. Birlikte oynayın
4. Strateji geliştirmesine yardımcı olun
5. Kazanmayı ve kaybetmeyi öğretin`,
    materials: ['Masa oyunları', 'Oyun tahtası'],
    estimatedDuration: 40,
  },
  {
    title: 'Kukla Tiyatrosu',
    description: 'Kukla ile hikaye anlatma aktivitesi. Yaratıcılık ve iletişim becerilerini geliştirir.',
    category: 'Sanat ve Yaratıcılık',
    ageRange: { min: 4, max: 10 },
    difficulty: 'medium',
    instructions: `1. Kuklalar hazırlayın veya yapın
2. Basit bir hikaye seçin
3. Kuklalarla hikayeyi canlandırın
4. Çocuğun da kukla kullanmasını sağlayın
5. Kendi hikayesini oluşturmasını teşvik edin`,
    materials: ['Kuklalar', 'Kukla sahnesi', 'Hikaye kitapları'],
    estimatedDuration: 35,
  },
  {
    title: 'Harita ve Yön Bulma',
    description: 'Harita okuma ve yön bulma aktivitesi. Uzamsal düşünme ve problem çözme becerilerini geliştirir.',
    category: 'Zeka Oyunları',
    ageRange: { min: 6, max: 12 },
    difficulty: 'hard',
    instructions: `1. Basit bir harita hazırlayın
2. Yönleri öğretin (kuzey, güney, doğu, batı)
3. Haritada yer bulma oyunu oynayın
4. Hazine avı düzenleyin
5. Gerçek haritalar kullanın`,
    materials: ['Haritalar', 'Pusula', 'İşaretler'],
    estimatedDuration: 45,
  },
  {
    title: 'Müzik Aleti Çalma',
    description: 'Basit müzik aletleri çalma aktivitesi. Motor koordinasyon ve müzik algısını geliştirir.',
    category: 'Müzik ve Hareket',
    ageRange: { min: 4, max: 12 },
    difficulty: 'medium',
    instructions: `1. Basit müzik aleti seçin (davul, zil, flüt)
2. Temel notaları öğretin
3. Basit melodiler çalın
4. Çocuğun taklit etmesini sağlayın
5. Birlikte müzik yapın`,
    materials: ['Müzik aletleri', 'Nota kağıtları'],
    estimatedDuration: 30,
  },
  {
    title: 'Fotoğrafçılık',
    description: 'Fotoğraf çekme aktivitesi. Gözlem ve estetik algıyı geliştirir.',
    category: 'Sanat ve Yaratıcılık',
    ageRange: { min: 6, max: 12 },
    difficulty: 'medium',
    instructions: `1. Basit bir kamera veya telefon kullanın
2. Fotoğraf çekme tekniklerini öğretin
3. Farklı konular seçin (doğa, insanlar, nesneler)
4. Çekilen fotoğrafları inceleyin
5. En beğenilenleri sergileyin`,
    materials: ['Kamera', 'Telefon', 'Yazıcı'],
    estimatedDuration: 40,
  },
  {
    title: 'Yoga ve Nefes Egzersizleri',
    description: 'Yoga ve nefes çalışmaları. Denge, esneklik ve sakinleşme sağlar.',
    category: 'Spor ve Fiziksel Aktivite',
    ageRange: { min: 4, max: 12 },
    difficulty: 'easy',
    instructions: `1. Basit yoga pozisyonları seçin
2. Adım adım gösterin
3. Çocuğun taklit etmesini sağlayın
4. Nefes egzersizleri yapın
5. Sakinleştirici müzik kullanın`,
    materials: ['Yoga matı', 'Sakinleştirici müzik'],
    estimatedDuration: 25,
  },
  {
    title: 'Kodlama ve Programlama',
    description: 'Basit kodlama aktivitesi. Mantıksal düşünme ve problem çözme becerilerini geliştirir.',
    category: 'Teknoloji',
    ageRange: { min: 7, max: 12 },
    difficulty: 'hard',
    instructions: `1. Çocuklara uygun kodlama platformu seçin
2. Basit komutları öğretin
3. Küçük projeler yapın
4. Hataları birlikte düzeltin
5. Yaratıcı projeler geliştirin`,
    materials: ['Bilgisayar', 'Kodlama platformu', 'Tutorial'],
    estimatedDuration: 45,
  },
];

export const seedAutismActivities = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kiel-ai-full');
    console.log('MongoDB connected');

    // Find an admin or expert user to assign activities
    const adminUser = await User.findOne({ role: 'admin' });
    const expertUser = await User.findOne({ role: 'expert' });
    const createdBy = adminUser || expertUser;

    if (!createdBy) {
      console.log('No admin or expert user found. Creating activities without user assignment.');
    }

    let createdCount = 0;
    for (const activityData of autismActivities) {
      const existing = await Activity.findOne({ title: activityData.title });
      if (!existing) {
        await Activity.create({
          ...activityData,
          createdBy: createdBy?._id || new mongoose.Types.ObjectId(),
        });
        createdCount++;
        console.log(`Created activity: ${activityData.title}`);
      } else {
        console.log(`Activity already exists: ${activityData.title}`);
      }
    }

    console.log(`\n✅ Successfully seeded ${createdCount} autism activities!`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding activities:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedAutismActivities();
}




