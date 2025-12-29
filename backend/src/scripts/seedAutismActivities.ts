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



