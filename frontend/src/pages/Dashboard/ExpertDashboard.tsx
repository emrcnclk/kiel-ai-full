import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import BlogViewsChart from '../../components/Charts/BlogViewsChart';
import ActivityCompletionsChart from '../../components/Charts/ActivityCompletionsChart';
import './Dashboard.css';

interface ExpertStats {
  blogs: {
    total: number;
    totalViews: number;
    viewsByDate: { date: string; views: number }[];
  };
  activities: {
    total: number;
    totalCompletions: number;
    completionsByDate: { date: string; count: number }[];
    topActivities: { activityId: string; title: string; completions: number }[];
  };
  appointments: {
    total: number;
    byStatus: { status: string; count: number }[];
  };
  period: string;
}

const ExpertDashboard = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    activities: 0,
    appointments: 0,
    messages: 0,
  });
  const [chartStats, setChartStats] = useState<ExpertStats | null>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartStats();
  }, [period]);

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

  const fetchChartStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/stats/expert?period=${period}`);
      setChartStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch chart stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        {chartStats && (
          <>
            <div className="stat-card">
              <h3>Toplam Blog Görüntülenme</h3>
              <p className="stat-number">{chartStats.blogs.totalViews}</p>
            </div>
            <div className="stat-card">
              <h3>Aktivite Tamamlanma</h3>
              <p className="stat-number">{chartStats.activities.totalCompletions}</p>
            </div>
          </>
        )}
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
            {chartStats.blogs.viewsByDate.length > 0 && (
              <BlogViewsChart 
                data={chartStats.blogs.viewsByDate} 
                period={chartStats.period} 
              />
            )}
            {chartStats.activities.completionsByDate.length > 0 && (
              <ActivityCompletionsChart 
                data={chartStats.activities.completionsByDate} 
                period={chartStats.period} 
              />
            )}
          </div>

          {chartStats.activities.topActivities.length > 0 && (
            <div className="top-activities">
              <h3>En Popüler Aktiviteler</h3>
              <div className="top-activities-list">
                {chartStats.activities.topActivities.map((activity, index) => (
                  <div key={activity.activityId} className="top-activity-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="title">{activity.title}</span>
                    <span className="completions">{activity.completions} tamamlanma</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && <p>İstatistikler yükleniyor...</p>}
    </div>
  );
};

export default ExpertDashboard;

