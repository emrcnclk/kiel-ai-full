// MongoDB bağlantı test scripti
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kiel-ai-full';
    console.log('🔍 MongoDB bağlantısı test ediliyor...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***@')); // Şifreyi gizle
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 saniye timeout
    });
    
    console.log('✅ MongoDB bağlantısı başarılı!');
    console.log('📊 Veritabanı:', mongoose.connection.name);
    console.log('🔌 Durum:', mongoose.connection.readyState === 1 ? 'Bağlı' : 'Bağlı değil');
    
    // Basit bir test sorgusu
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Koleksiyonlar:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'Henüz koleksiyon yok');
    
    await mongoose.connection.close();
    console.log('✅ Test tamamlandı, bağlantı kapatıldı');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    console.error('\n💡 Kontrol edin:');
    console.error('   1. MongoDB servisi çalışıyor mu? (mongod)');
    console.error('   2. MongoDB URI doğru mu? (.env dosyasında MONGODB_URI)');
    console.error('   3. Firewall MongoDB portunu engelliyor mu? (varsayılan: 27017)');
    process.exit(1);
  }
};

testConnection();

