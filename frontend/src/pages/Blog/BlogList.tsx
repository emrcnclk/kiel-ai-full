import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Blog } from '../../types';
import { RootState } from '../../store/store';
import './Blog.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/blogs?published=true');
      setBlogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="blog-list">
      <div className="blog-header">
        <h1>Blog Yazıları</h1>
        {(user?.role === 'expert' || user?.role === 'admin') && (
          <Link to="/blogs/create" className="btn-primary">
            Yeni Blog Yaz
          </Link>
        )}
      </div>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <Link key={blog._id} to={`/blogs/${blog._id}`} className="blog-card">
            {blog.imageUrl && (
              <div className="blog-card-image">
                <img src={blog.imageUrl} alt={blog.title} />
              </div>
            )}
            <h3>{blog.title}</h3>
            {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
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
          </Link>
        ))}
      </div>
      {blogs.length === 0 && (
        <p className="no-content">Henüz blog yazısı bulunmuyor.</p>
      )}
    </div>
  );
};

export default BlogList;

