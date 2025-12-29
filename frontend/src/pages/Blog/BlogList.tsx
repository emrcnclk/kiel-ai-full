import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Blog } from '../../types';
import { RootState } from '../../store/store';
import Pagination from '../../components/Pagination/Pagination';
import './Blog.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('published', 'true');
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await axiosInstance.get(`/blogs?${params.toString()}`);
      setBlogs(response.data.data || []);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('page', '1');
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    setSearchParams(params);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
      
      <form onSubmit={handleSearch} className="blog-search">
        <input
          type="text"
          placeholder="Blog ara..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="btn-primary">Ara</button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              const params = new URLSearchParams();
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="btn-secondary"
          >
            Temizle
          </button>
        )}
      </form>

      {searchTerm && (
        <div className="search-results-info">
          <p>
            "{searchTerm}" için <strong>{pagination.totalCount}</strong> sonuç bulundu
          </p>
        </div>
      )}

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
      {blogs.length === 0 && !loading && (
        <p className="no-content">
          {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz blog yazısı bulunmuyor.'}
        </p>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      )}
    </div>
  );
};

export default BlogList;

