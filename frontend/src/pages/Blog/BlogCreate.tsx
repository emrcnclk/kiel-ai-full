import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import FileUpload from '../../components/Upload/FileUpload';
import './Blog.css';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    categories: [] as string[],
    tags: [] as string[],
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/blogs', formData);
      navigate('/blogs');
    } catch (error) {
      console.error('Failed to create blog:', error);
      alert('Blog oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'categories' || name === 'tags') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(s => s.trim()).filter(s => s),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="blog-create">
      <h1>Yeni Blog Yazısı</h1>
      <form onSubmit={handleSubmit} className="blog-form">
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
          <label>Özet</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <FileUpload
            uploadType="blog"
            onUploadSuccess={(url) => {
              setFormData(prev => ({ ...prev, imageUrl: url }));
            }}
            currentImageUrl={formData.imageUrl}
            label="Blog Görseli"
          />
        </div>
        <div className="form-group">
          <label>İçerik</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Kategoriler (virgülle ayırın)</label>
          <input
            type="text"
            name="categories"
            value={formData.categories.join(', ')}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Etiketler (virgülle ayırın)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              disabled={loading}
            />
            Yayınla
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button type="button" onClick={() => navigate('/blogs')} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogCreate;

