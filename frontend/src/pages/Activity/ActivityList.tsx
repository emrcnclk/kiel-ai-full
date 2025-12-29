import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Activity } from '../../types';
import { RootState } from '../../store/store';
import './Activity.css';

const ActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    age: '',
  });
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.age) params.append('age', filters.age);
      
      const response = await axiosInstance.get(`/activities?${params.toString()}`);
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];
    
    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }
    
    if (filters.difficulty) {
      filtered = filtered.filter(a => a.difficulty === filters.difficulty);
    }
    
    if (filters.age) {
      const ageNum = parseInt(filters.age);
      filtered = filtered.filter(a => 
        ageNum >= a.ageRange.min && ageNum <= a.ageRange.max
      );
    }
    
    setFilteredActivities(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', difficulty: '', age: '' });
    fetchActivities();
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  const displayActivities = filteredActivities.length > 0 ? filteredActivities : activities;
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
        {displayActivities.map((activity) => (
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
      {displayActivities.length === 0 && (
        <p className="no-content">
          {activities.length === 0 
            ? 'Henüz aktivite bulunmuyor.' 
            : 'Filtrelere uygun aktivite bulunamadı.'}
        </p>
      )}
    </div>
  );
};

export default ActivityList;

