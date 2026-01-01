import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import ActivityProgressChart from '../../components/Charts/ActivityProgressChart';
import CategoryChart from '../../components/Charts/CategoryChart';
import DifficultyChart from '../../components/Charts/DifficultyChart';
import ProgressChart from '../../components/Progress/ProgressChart';
import './Dashboard.css';

interface ClientStats {
  totalCompleted: number;
  averageRating: number;
  streak: number;
  dailyCompletions: { date: string; count: number }[];
  categoryStats: { category: string; count: number }[];
  difficultyStats: { difficulty: string; count: number }[];
  period: string;
}

const ClientDashboard = () => {
  const [stats, setStats] = useState({
    completedActivities: 0,
    appointments: 0,
    recommendations: 0,
  });
  const [chartStats, setChartStats] = useState<ClientStats | null>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartStats();
  }, [period]);

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

  const fetchChartStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/stats/client?period=${period}`);
      setChartStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch chart stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Müşteri Dashboard</h1>
      
      {chartStats && chartStats.streak > 0 && (
        <div className="streak-banner">
          <div className="streak-content">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <h2>{chartStats.streak} Günlük Seri!</h2>
              <p>Harika gidiyorsunuz! Seriyi bozmamaya devam edin.</p>
            </div>
          </div>
        </div>
      )}

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
        {chartStats && (
          <>
            <div className="stat-card">
              <h3>Ortalama Puan</h3>
              <p className="stat-number">{chartStats.averageRating.toFixed(1)} ⭐</p>
            </div>
            <div className="stat-card">
              <h3>Günlük Seri</h3>
              <p className="stat-number">{chartStats.streak} 🔥</p>
            </div>
            <div className="stat-card">
              <h3>Rozetler</h3>
              <p className="stat-number">
                <Link to="/badges" className="stat-link">Rozetlerim</Link>
              </p>
            </div>
          </>
        )}
      </div>

      <div className="quick-links">
        <Link to="/badges" className="quick-link-btn">
          🏆 Rozetlerim
        </Link>
        <Link to="/certificate" className="quick-link-btn">
          🎓 Sertifikam
        </Link>
      </div>

      {chartStats && (
        <div className="charts-section">
          <div className="period-selector">
            <label>Zaman Aralığı: </label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="week">Son 7 Gün</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>
          </div>

          <div className="charts-grid">
            {chartStats.dailyCompletions.length > 0 && (
              <ActivityProgressChart 
                data={chartStats.dailyCompletions} 
                period={chartStats.period} 
              />
            )}
            {chartStats.categoryStats.length > 0 && (
              <CategoryChart data={chartStats.categoryStats} />
            )}
            {chartStats.difficultyStats.length > 0 && (
              <DifficultyChart data={chartStats.difficultyStats} />
            )}
          </div>
        </div>
      )}

      <div className="progress-section">
        <ProgressChart />
      </div>

      {loading && <p>İstatistikler yükleniyor...</p>}
    </div>
  );
};

export default ClientDashboard;

