import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './Dashboard.css';

const ExpertDashboard = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    activities: 0,
    appointments: 0,
    messages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogsRes, activitiesRes, appointmentsRes] = await Promise.all([
          axiosInstance.get('/blogs?author=me'),
          axiosInstance.get('/activities?createdBy=me'),
          axiosInstance.get('/appointments'),
        ]);

        setStats({
          blogs: blogsRes.data.data?.length || 0,
          activities: activitiesRes.data.data?.length || 0,
          appointments: appointmentsRes.data.data?.length || 0,
          messages: 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1>Uzman Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Blog Yazıları</h3>
          <p className="stat-number">{stats.blogs}</p>
          <Link to="/blogs/create" className="stat-link">Yeni Blog Yaz</Link>
        </div>
        <div className="stat-card">
          <h3>Aktiviteler</h3>
          <p className="stat-number">{stats.activities}</p>
          <Link to="/activities/create" className="stat-link">Yeni Aktivite Ekle</Link>
        </div>
        <div className="stat-card">
          <h3>Randevular</h3>
          <p className="stat-number">{stats.appointments}</p>
          <Link to="/appointments" className="stat-link">Randevuları Görüntüle</Link>
        </div>
        <div className="stat-card">
          <h3>Mesajlar</h3>
          <p className="stat-number">{stats.messages}</p>
          <Link to="/chat" className="stat-link">Mesajları Görüntüle</Link>
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;

