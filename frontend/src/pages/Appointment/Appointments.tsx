import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Appointment } from '../../types';
import { RootState } from '../../store/store';
import './Appointment.css';

interface Expert {
  _id: string;
  user: {
    _id: string;
    email: string;
    role: string;
  };
  firstName: string;
  lastName: string;
  specialization: string[];
  experience: number;
  bio?: string;
}

const Appointments = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    expert: '',
    scheduledAt: '',
    duration: 60,
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'client') {
      fetchExperts();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/appointments');
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    try {
      setExpertsLoading(true);
      const response = await axiosInstance.get('/users/experts');
      setExperts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
      alert('Uzmanlar yüklenirken bir hata oluştu.');
    } finally {
      setExpertsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/appointments', formData);
      setShowCreateForm(false);
      setFormData({
        expert: '',
        scheduledAt: '',
        duration: 60,
        notes: '',
      });
      fetchAppointments();
      alert('Randevu başarıyla oluşturuldu!');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      const errorMessage = error.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu.';
      alert(errorMessage);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Randevu durumu güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1>Randevular</h1>
        {user?.role === 'client' && (
          <button 
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              if (!showCreateForm && experts.length === 0) {
                fetchExperts();
              }
            }} 
            className="btn-primary"
          >
            Yeni Randevu
          </button>
        )}
      </div>

      {showCreateForm && user?.role === 'client' && (
        <form onSubmit={handleCreate} className="appointment-form">
          <div className="form-group">
            <label>Uzman Seçin</label>
            {expertsLoading ? (
              <p>Uzmanlar yükleniyor...</p>
            ) : experts.length === 0 ? (
              <p className="error-text">Uzman bulunamadı. Lütfen daha sonra tekrar deneyin.</p>
            ) : (
              <select
                value={formData.expert}
                onChange={(e) => setFormData({ ...formData, expert: e.target.value })}
                required
                className="form-select"
              >
                <option value="">Uzman seçin...</option>
                {experts.map((expert) => (
                  <option key={expert._id} value={expert.user._id}>
                    {expert.firstName} {expert.lastName}
                    {expert.specialization.length > 0 && ` - ${expert.specialization.join(', ')}`}
                    {expert.experience > 0 && ` (${expert.experience} yıl deneyim)`}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Tarih ve Saat</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Süre (dakika)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              min="15"
              step="15"
              required
            />
          </div>
          <div className="form-group">
            <label>Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Oluştur</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="appointments-list">
        {appointments.map((apt) => (
          <div key={apt._id} className="appointment-card">
            <div className="appointment-info">
              <h3>Randevu #{apt._id.slice(-6)}</h3>
              <p><strong>Tarih:</strong> {new Date(apt.scheduledAt).toLocaleString('tr-TR')}</p>
              <p><strong>Süre:</strong> {apt.duration} dakika</p>
              <p><strong>Durum:</strong> <span className={`status-${apt.status}`}>{apt.status}</span></p>
              {apt.notes && <p><strong>Notlar:</strong> {apt.notes}</p>}
            </div>
            {user?.role === 'expert' && apt.status === 'pending' && (
              <div className="appointment-actions">
                <button
                  onClick={() => handleStatusChange(apt._id, 'approved')}
                  className="btn-primary"
                >
                  Onayla
                </button>
                <button
                  onClick={() => handleStatusChange(apt._id, 'rejected')}
                  className="btn-danger"
                >
                  Reddet
                </button>
              </div>
            )}
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="no-content">Henüz randevu bulunmuyor.</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;

