import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Blog } from '../../types';
import { RootState } from '../../store/store';
import './Blog.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/blogs/${id}`);
      setBlog(response.data.data);
    } catch (error) {
      console.error('Failed to fetch blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/blogs/${id}`);
      navigate('/blogs');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('Blog silinirken bir hata oluştu.');
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!blog) {
    return <div>Blog bulunamadı.</div>;
  }

  const canEdit = user?.id === (typeof blog.author === 'object' ? blog.author.id : blog.author) || user?.role === 'admin';

  return (
    <div className="blog-detail">
      <div className="blog-actions">
        <Link to="/blogs" className="btn-secondary">← Geri</Link>
        {canEdit && (
          <>
            <Link to={`/blogs/${id}/edit`} className="btn-primary">Düzenle</Link>
            <button onClick={handleDelete} className="btn-danger">Sil</button>
          </>
        )}
      </div>
      <article className="blog-article">
        <h1>{blog.title}</h1>
        {blog.imageUrl && (
          <div className="blog-image-container">
            <img src={blog.imageUrl} alt={blog.title} className="blog-image" />
          </div>
        )}
        <div className="blog-meta">
          <span>👁️ {blog.views} görüntüleme</span>
          <span>📅 {new Date(blog.createdAt).toLocaleDateString('tr-TR')}</span>
        </div>
        {blog.categories.length > 0 && (
          <div className="blog-categories">
            {blog.categories.map((cat, idx) => (
              <span key={idx} className="blog-category">{cat}</span>
            ))}
          </div>
        )}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>
    </div>
  );
};

export default BlogDetail;

