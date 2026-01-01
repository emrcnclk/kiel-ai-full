import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Activity } from '../../types';
import { RootState } from '../../store/store';
import ColorMatching from '../../components/ActivityGames/ColorMatching';
import ShapeSorting from '../../components/ActivityGames/ShapeSorting';
import EmotionMatching from '../../components/ActivityGames/EmotionMatching';
import './Activity.css';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionData, setCompletionData] = useState({
    notes: '',
    rating: 5,
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [steps, setSteps] = useState<string[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchActivity();
      if (user?.role === 'client') {
        checkCompletionStatus();
      }
    }
  }, [id, user]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/activities/${id}`);
      const activityData = response.data.data;
      setActivity(activityData);
      
      // Parse instructions into steps
      if (activityData?.instructions) {
        const parsedSteps = parseInstructions(activityData.instructions);
        setSteps(parsedSteps);
      }
      
      // Load saved progress from localStorage
      if (user?.role === 'client' && id) {
        const savedProgress = localStorage.getItem(`activity-progress-${id}`);
        if (savedProgress) {
          try {
            const progress = JSON.parse(savedProgress);
            setCompletedSteps(new Set(progress.completedSteps || []));
          } catch (e) {
            console.error('Failed to parse saved progress:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseInstructions = (instructions: string): string[] => {
    // Split by numbered lines (1., 2., etc.) or newlines
    const lines = instructions.split(/\n/).filter(line => line.trim());
    const steps: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // Remove leading numbers and dots (e.g., "1. ", "2. ")
      const cleaned = trimmed.replace(/^\d+\.\s*/, '').trim();
      if (cleaned) {
        steps.push(cleaned);
      }
    });
    
    return steps.length > 0 ? steps : [instructions]; // Fallback to original if no steps found
  };

  const toggleStep = (stepIndex: number) => {
    if (isCompleted) return; // Don't allow changes if already completed
    
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      
      // Save to localStorage
      if (id && user?.role === 'client') {
        localStorage.setItem(`activity-progress-${id}`, JSON.stringify({
          completedSteps: Array.from(newSet),
        }));
      }
      
      return newSet;
    });
  };

  const getProgressPercentage = (): number => {
    if (steps.length === 0) return 0;
    return Math.round((completedSteps.size / steps.length) * 100);
  };

  const checkCompletionStatus = async () => {
    try {
      const response = await axiosInstance.get('/activities/completed');
      const completedActivities = response.data.data || [];
      const completed = completedActivities.some(
        (completion: any) => 
          (typeof completion.activity === 'object' ? completion.activity._id : completion.activity) === id
      );
      setIsCompleted(completed);
    } catch (error) {
      console.error('Failed to check completion status:', error);
    }
  };

  const handleComplete = async () => {
    if (isCompleted) {
      alert('Bu aktivite zaten tamamlanmış!');
      return;
    }

    if (!showCompletionForm) {
      setShowCompletionForm(true);
      return;
    }

    try {
      setCompleting(true);
      await axiosInstance.post(`/activities/${id}/complete`, {
        notes: completionData.notes,
        rating: completionData.rating,
      });
      alert('Aktivite tamamlandı olarak işaretlendi!');
      setIsCompleted(true);
      setShowCompletionForm(false);
    } catch (error: any) {
      console.error('Failed to complete activity:', error);
      const errorMessage = error.response?.data?.message || 'Aktivite tamamlanırken bir hata oluştu.';
      alert(errorMessage);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Adım Adım Talimatlar</h3>
            {steps.length > 0 && (
              <div style={{ 
                backgroundColor: '#e8f4f8', 
                padding: '8px 15px', 
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#2c3e50'
              }}>
                İlerleme: {completedSteps.size} / {steps.length} ({getProgressPercentage()}%)
              </div>
            )}
          </div>
          
          {steps.length > 0 ? (
            <div className="activity-steps">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(index);
                return (
                  <div
                    key={index}
                    onClick={() => user?.role === 'client' && !isCompleted && toggleStep(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '15px',
                      marginBottom: '10px',
                      backgroundColor: isCompleted ? '#d4edda' : '#f8f9fa',
                      border: `2px solid ${isCompleted ? '#28a745' : '#dee2e6'}`,
                      borderRadius: '8px',
                      cursor: user?.role === 'client' && !isCompleted ? 'pointer' : 'default',
                      transition: 'all 0.3s',
                      opacity: isCompleted ? 0.8 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (user?.role === 'client' && !isCompleted) {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (user?.role === 'client' && !isCompleted) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{
                      minWidth: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#28a745' : '#fff',
                      border: `2px solid ${isCompleted ? '#28a745' : '#dee2e6'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      flexShrink: 0,
                      fontSize: '18px',
                    }}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div style={{ flex: 1, lineHeight: '1.6' }}>
                      <p style={{ margin: 0, textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? '#6c757d' : '#2c3e50' }}>
                        {step}
                      </p>
                      {user?.role === 'client' && !isCompleted && (
                        <small style={{ color: '#6c757d', fontStyle: 'italic' }}>
                          (Tamamlamak için tıklayın)
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {steps.length > 0 && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#e8f4f8', 
                  borderRadius: '8px',
                  border: '2px solid #3498db'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ flex: 1, height: '10px', backgroundColor: '#dee2e6', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${getProgressPercentage()}%`,
                        backgroundColor: '#28a745',
                        transition: 'width 0.3s',
                        borderRadius: '5px',
                      }} />
                    </div>
                    <span style={{ marginLeft: '15px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {getProgressPercentage()}%
                    </span>
                  </div>
                  {completedSteps.size === steps.length && !isCompleted && (
                    <p style={{ margin: 0, color: '#28a745', fontWeight: 'bold', textAlign: 'center' }}>
                      🎉 Tüm adımları tamamladınız! Aşağıdan aktiviteyi tamamlayabilirsiniz.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '16px' }}>
              {activity.instructions}
            </div>
          )}
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
        
        {/* Interactive Games */}
        {activity.title === 'Renk Eşleştirme Oyunu' && (
          <div style={{ marginTop: '30px' }}>
            <ColorMatching onComplete={() => setGameCompleted(true)} />
          </div>
        )}
        
        {activity.title === 'Şekil Sıralama' && (
          <div style={{ marginTop: '30px' }}>
            <ShapeSorting onComplete={() => setGameCompleted(true)} />
          </div>
        )}
        
        {activity.title === 'Duygu Tanıma Kartları' && (
          <div style={{ marginTop: '30px' }}>
            <EmotionMatching onComplete={() => setGameCompleted(true)} />
          </div>
        )}
        
        {gameCompleted && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '2px solid #28a745',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#28a745', margin: 0 }}>🎉 Oyunu Tamamladınız!</h3>
            <p style={{ margin: '10px 0 0 0', color: '#155724' }}>
              Harika iş çıkardınız! Şimdi aktiviteyi tamamlayabilirsiniz.
            </p>
          </div>
        )}
        {user?.role === 'client' && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            {isCompleted ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Aktivite Tamamlandı!</h3>
                <p style={{ color: '#666' }}>Bu aktiviteyi zaten tamamladınız.</p>
              </div>
            ) : (
              <>
                {!showCompletionForm ? (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="btn-primary"
                    style={{ width: '100%', padding: '15px', fontSize: '18px' }}
                  >
                    🎯 Aktiviteyi Tamamla
                  </button>
                ) : (
                  <div>
                    <h3 style={{ marginBottom: '15px' }}>Aktiviteyi Tamamla</h3>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Değerlendirme (1-5 yıldız):
                      </label>
                      <select
                        value={completionData.rating}
                        onChange={(e) => setCompletionData({ ...completionData, rating: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Mükemmel)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Çok İyi)</option>
                        <option value={3}>⭐⭐⭐ (3 - İyi)</option>
                        <option value={2}>⭐⭐ (2 - Orta)</option>
                        <option value={1}>⭐ (1 - Zayıf)</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Notlar (İsteğe bağlı):
                      </label>
                      <textarea
                        value={completionData.notes}
                        onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                        placeholder="Aktivite hakkında notlarınızı yazın..."
                        rows={4}
                        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="btn-primary"
                        style={{ flex: 1, padding: '12px', fontSize: '16px' }}
                      >
                        {completing ? 'Tamamlanıyor...' : '✅ Tamamla ve Kaydet'}
                      </button>
                      <button
                        onClick={() => {
                          setShowCompletionForm(false);
                          setCompletionData({ notes: '', rating: 5 });
                        }}
                        className="btn-secondary"
                        style={{ padding: '12px', fontSize: '16px' }}
                        disabled={completing}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </article>
    </div>
  );
};

export default ActivityDetail;

