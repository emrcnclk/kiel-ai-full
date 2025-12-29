import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import FileUpload from '../../components/Upload/FileUpload';
import './Activity.css';

const ActivityCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    ageRange: { min: 0, max: 18 },
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    instructions: '',
    materials: [] as string[],
    estimatedDuration: 30,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/activities', formData);
      navigate('/activities');
    } catch (error) {
      console.error('Failed to create activity:', error);
      alert('Aktivite oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'ageMin' || name === 'ageMax') {
      setFormData(prev => ({
        ...prev,
        ageRange: {
          ...prev.ageRange,
          [name === 'ageMin' ? 'min' : 'max']: parseInt(value) || 0,
        },
      }));
    } else if (name === 'materials') {
      setFormData(prev => ({
        ...prev,
        materials: value.split(',').map(s => s.trim()).filter(s => s),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="activity-create">
      <h1>Yeni Aktivite</h1>
      <form onSubmit={handleSubmit} className="activity-form">
        <div className="form-group">
          <label>Başlık</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Açıklama</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <FileUpload
            uploadType="activity"
            onUploadSuccess={(url) => {
              setFormData(prev => ({ ...prev, imageUrl: url }));
            }}
            currentImageUrl={formData.imageUrl}
            label="Aktivite Görseli"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Kategori</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Zorluk</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="easy">Kolay</option>
              <option value="medium">Orta</option>
              <option value="hard">Zor</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Min Yaş</label>
            <input
              type="number"
              name="ageMin"
              value={formData.ageRange.min}
              onChange={handleChange}
              required
              min="0"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Max Yaş</label>
            <input
              type="number"
              name="ageMax"
              value={formData.ageRange.max}
              onChange={handleChange}
              required
              min="0"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Süre (dakika)</label>
            <input
              type="number"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              required
              min="1"
              disabled={loading}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Talimatlar</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={8}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Malzemeler (virgülle ayırın)</label>
          <input
            type="text"
            name="materials"
            value={formData.materials.join(', ')}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button type="button" onClick={() => navigate('/activities')} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityCreate;

