import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import FileUpload from '../../components/Upload/FileUpload';
import './Activity.css';

const ActivityEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (id) {
      fetchActivity();
    }
  }, [id]);

  const fetchActivity = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get(`/activities/${id}`);
      const activity = response.data.data;
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        imageUrl: activity.imageUrl || '',
        category: activity.category || '',
        ageRange: activity.ageRange || { min: 0, max: 18 },
        difficulty: activity.difficulty || 'easy',
        instructions: activity.instructions || '',
        materials: activity.materials || [],
        estimatedDuration: activity.estimatedDuration || 30,
      });
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      alert('Aktivite yüklenirken bir hata oluştu.');
      navigate('/activities');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/activities/${id}`, formData);
      navigate(`/activities/${id}`);
    } catch (error) {
      console.error('Failed to update activity:', error);
      alert('Aktivite güncellenirken bir hata oluştu.');
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

  if (fetching) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="activity-create">
      <h1>Aktiviteyi Düzenle</h1>
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
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
          <button type="button" onClick={() => navigate(`/activities/${id}`)} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityEdit;


