import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './Dashboard.css';

const ClientDashboard = () => {
  const [stats, setStats] = useState({
    completedActivities: 0,
    appointments: 0,
    recommendations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [activitiesRes, appointmentsRes, recommendationsRes] = await Promise.all([
          axiosInstance.get('/activities/completed'),
          axiosInstance.get('/appointments'),
          axiosInstance.get('/ai/recommendations'),
        ]);

        setStats({
          completedActivities: activitiesRes.data.data?.length || 0,
          appointments: appointmentsRes.data.data?.length || 0,
          recommendations: recommendationsRes.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1>Müşteri Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tamamlanan Aktiviteler</h3>
          <p className="stat-number">{stats.completedActivities}</p>
          <Link to="/activities" className="stat-link">Aktiviteleri Görüntüle</Link>
        </div>
        <div className="stat-card">
          <h3>Randevular</h3>
          <p className="stat-number">{stats.appointments}</p>
          <Link to="/appointments" className="stat-link">Randevuları Görüntüle</Link>
        </div>
        <div className="stat-card">
          <h3>Önerilen Aktiviteler</h3>
          <p className="stat-number">{stats.recommendations}</p>
          <Link to="/activities" className="stat-link">Aktiviteleri Görüntüle</Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

