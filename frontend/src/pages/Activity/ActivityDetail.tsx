import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Activity } from '../../types';
import { RootState } from '../../store/store';
import './Activity.css';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchActivity();
    }
  }, [id]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/activities/${id}`);
      setActivity(response.data.data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Bu aktiviteyi tamamladınız mı?')) {
      return;
    }

    try {
      setCompleting(true);
      await axiosInstance.post(`/activities/${id}/complete`, {
        notes: '',
        rating: 5,
      });
      alert('Aktivite tamamlandı olarak işaretlendi!');
      navigate('/activities');
    } catch (error) {
      console.error('Failed to complete activity:', error);
      alert('Aktivite tamamlanırken bir hata oluştu.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!activity) {
    return <div>Aktivite bulunamadı.</div>;
  }

  const canEdit = user?.id === (typeof activity.createdBy === 'object' ? activity.createdBy.id : activity.createdBy) || user?.role === 'admin';

  return (
    <div className="activity-detail">
      <div className="activity-actions">
        <button onClick={() => navigate('/activities')} className="btn-secondary">
          ← Geri
        </button>
        {canEdit && (
          <Link to={`/activities/${id}/edit`} className="btn-primary">Düzenle</Link>
        )}
      </div>
      <article className="activity-article">
        <h1>{activity.title}</h1>
        {activity.imageUrl && (
          <div className="activity-image-container">
            <img src={activity.imageUrl} alt={activity.title} className="activity-image" />
          </div>
        )}
        <div className="activity-meta">
          <span>👶 {activity.ageRange.min}-{activity.ageRange.max} yaş</span>
          <span>📊 {activity.difficulty}</span>
          <span>⏱️ {activity.estimatedDuration} dakika</span>
          <span>📁 {activity.category}</span>
        </div>
        <div className="activity-description">
          <h3>Açıklama</h3>
          <p>{activity.description}</p>
        </div>
        <div className="activity-instructions">
          <h3>Talimatlar</h3>
          <p>{activity.instructions}</p>
        </div>
        {activity.materials && activity.materials.length > 0 && (
          <div className="activity-materials">
            <h3>Gerekli Malzemeler</h3>
            <ul>
              {activity.materials.map((material, idx) => (
                <li key={idx}>{material}</li>
              ))}
            </ul>
          </div>
        )}
        {user?.role === 'client' && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            {completing ? 'Tamamlanıyor...' : 'Aktiviteyi Tamamla'}
          </button>
        )}
      </article>
    </div>
  );
};

export default ActivityDetail;

