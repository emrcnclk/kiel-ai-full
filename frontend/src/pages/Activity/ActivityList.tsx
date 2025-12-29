import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Activity } from '../../types';
import { RootState } from '../../store/store';
import Pagination from '../../components/Pagination/Pagination';
import './Activity.css';

const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    age: '',
    search: '',
  });
  const { user } = useSelector((state: RootState) => state.auth);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    fetchActivities();
  }, [currentPage, searchParams]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.age) params.append('age', filters.age);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axiosInstance.get(`/activities?${params.toString()}`);
      setActivities(response.data.data || []);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const params = new URLSearchParams();
    params.set('page', '1');
    if (key === 'category' && value) params.set('category', value);
    if (key === 'difficulty' && value) params.set('difficulty', value);
    if (key === 'age' && value) params.set('age', value);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('page', '1');
    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }
    if (filters.category) params.set('category', filters.category);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.age) params.set('age', filters.age);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', difficulty: '', age: '', search: '' });
    const params = new URLSearchParams();
    params.set('page', '1');
    setSearchParams(params);
  };

  const categories = [...new Set(activities.map(a => a.category))];

  return (
    <div className="activity-list">
      <div className="activity-header">
        <h1>Aktiviteler / Oyunlar</h1>
        {(user?.role === 'expert' || user?.role === 'admin') && (
          <Link to="/activities/create" className="btn-primary">
            Yeni Aktivite Ekle
          </Link>
        )}
      </div>
      
      <form onSubmit={handleSearch} className="activity-search">
        <input
          type="text"
          placeholder="Aktivite ara..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="search-input"
        />
        <button type="submit" className="btn-primary">Ara</button>
      </form>

      {searchTerm && (
        <div className="search-results-info">
          <p>
            "{searchTerm}" için <strong>{pagination.totalCount}</strong> sonuç bulundu
          </p>
        </div>
      }
      
      <div className="activity-filters">
        <div className="filter-group">
          <label>Kategori:</label>
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Tümü</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Zorluk:</label>
          <select 
            value={filters.difficulty} 
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="">Tümü</option>
            <option value="easy">Basit</option>
            <option value="medium">Orta</option>
            <option value="hard">Zor</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Yaş:</label>
          <input 
            type="number" 
            min="0" 
            max="18"
            placeholder="Yaş girin"
            value={filters.age}
            onChange={(e) => handleFilterChange('age', e.target.value)}
          />
        </div>
        
        <button onClick={clearFilters} className="btn-secondary">
          Filtreleri Temizle
        </button>
      </div>
      
      <div className="activity-grid">
        {activities.map((activity) => (
          <Link key={activity._id} to={`/activities/${activity._id}`} className="activity-card">
            {activity.imageUrl && (
              <div className="activity-card-image">
                <img src={activity.imageUrl} alt={activity.title} />
              </div>
            )}
            <h3>{activity.title}</h3>
            <p className="activity-description">{activity.description}</p>
            <div className="activity-meta">
              <span>👶 {activity.ageRange.min}-{activity.ageRange.max} yaş</span>
              <span>📊 {activity.difficulty}</span>
              <span>⏱️ {activity.estimatedDuration} dk</span>
            </div>
            <div className="activity-category">{activity.category}</div>
          </Link>
        ))}
      </div>
      {activities.length === 0 && !loading && (
        <p className="no-content">
          {searchTerm || filters.category || filters.difficulty || filters.age
            ? 'Filtrelere uygun aktivite bulunamadı.' 
            : 'Henüz aktivite bulunmuyor.'}
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

export default ActivityList;

