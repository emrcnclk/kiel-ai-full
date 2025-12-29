import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { ExpertProfile, ClientProfile } from '../../types';
import { RootState } from '../../store/store';
import FileUpload from '../../components/Upload/FileUpload';
import './Profile.css';

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<ExpertProfile | ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      setProfile(response.data.data);
      setFormData(response.data.data || {});
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put('/users/profile', formData);
      setEditing(false);
      fetchProfile();
      alert('Profil güncellendi!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Profil güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!profile) {
    return <div>Profil bulunamadı.</div>;
  }

  const isExpert = user?.role === 'expert';
  const isClient = user?.role === 'client';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profil</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)} className="btn-primary">
          {editing ? 'Kaydet' : 'Düzenle'}
        </button>
      </div>
      <div className="profile-content">
        {editing ? (
          <form className="profile-form">
            <div className="form-group">
              <FileUpload
                uploadType="profile"
                onUploadSuccess={(url) => {
                  setFormData({ ...formData, profileImageUrl: url });
                }}
                currentImageUrl={formData.profileImageUrl}
                label="Profil Fotoğrafı"
              />
            </div>
            <div className="form-group">
              <label>Ad</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Soyad</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            {isExpert && (
              <>
                <div className="form-group">
                  <label>Uzmanlık Alanları (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.specialization) ? formData.specialization.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </div>
                <div className="form-group">
                  <label>Deneyim (Yıl)</label>
                  <input
                    type="number"
                    value={formData.experience || 0}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Biyografi</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                  />
                </div>
              </>
            )}
            {isClient && (
              <>
                <div className="form-group">
                  <label>Çocuk Yaşı</label>
                  <input
                    type="number"
                    value={formData.childAge || ''}
                    onChange={(e) => setFormData({ ...formData, childAge: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Çocuk İlgi Alanları (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.childInterests) ? formData.childInterests.join(', ') : ''}
                    onChange={(e) => setFormData({ ...formData, childInterests: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </div>
                <div className="form-group">
                  <label>Notlar</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={5}
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Telefon</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </form>
        ) : (
          <div className="profile-info">
            {profile.profileImageUrl && (
              <div className="profile-image-container">
                <img src={profile.profileImageUrl} alt="Profil" className="profile-image" />
              </div>
            )}
            <p><strong>Ad:</strong> {profile.firstName}</p>
            <p><strong>Soyad:</strong> {profile.lastName}</p>
            {isExpert && 'specialization' in profile && (
              <>
                <p><strong>Uzmanlık:</strong> {profile.specialization.join(', ')}</p>
                <p><strong>Deneyim:</strong> {profile.experience} yıl</p>
                {profile.bio && <p><strong>Biyografi:</strong> {profile.bio}</p>}
              </>
            )}
            {isClient && 'childAge' in profile && (
              <>
                {profile.childAge && <p><strong>Çocuk Yaşı:</strong> {profile.childAge}</p>}
                {profile.childInterests.length > 0 && (
                  <p><strong>İlgi Alanları:</strong> {profile.childInterests.join(', ')}</p>
                )}
                {profile.notes && <p><strong>Notlar:</strong> {profile.notes}</p>}
              </>
            )}
            {profile.phone && <p><strong>Telefon:</strong> {profile.phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

