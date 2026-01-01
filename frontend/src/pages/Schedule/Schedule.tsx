import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axios';
import { TimeSlot } from '../../types';
import './Schedule.css';

const Schedule = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await axiosInstance.get('/schedules/my-schedule');
      if (response.data.data) {
        setTimeSlots(response.data.data.timeSlots || []);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/schedules', { timeSlots });
      alert('Takvim kaydedildi!');
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Takvim kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  return (
    <div className="schedule-page">
      <h1>Takvim Ayarları</h1>
      <div className="schedule-form">
        {timeSlots.map((slot, index) => (
          <div key={index} className="time-slot">
            <select
              value={slot.dayOfWeek}
              onChange={(e) => updateTimeSlot(index, 'dayOfWeek', parseInt(e.target.value))}
            >
              {days.map((day, idx) => (
                <option key={idx} value={idx}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={slot.startTime}
              onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
            />
            <span>-</span>
            <input
              type="time"
              value={slot.endTime}
              onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
            />
            <button onClick={() => removeTimeSlot(index)} className="btn-danger">Sil</button>
          </div>
        ))}
        <div className="schedule-actions">
          <button onClick={addTimeSlot} className="btn-secondary">Zaman Aralığı Ekle</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

