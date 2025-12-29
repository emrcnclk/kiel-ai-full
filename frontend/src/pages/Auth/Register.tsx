import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client' as 'expert' | 'client',
    firstName: '',
    lastName: '',
    phone: '',
    // Expert fields
    specialization: [] as string[],
    experience: 0,
    certifications: [] as string[],
    bio: '',
    // Client fields
    childAge: undefined as number | undefined,
    childInterests: [] as string[],
    notes: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'specialization' || name === 'certifications' || name === 'childInterests') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(s => s.trim()).filter(s => s),
      }));
    } else if (name === 'experience' || name === 'childAge') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1>KIEL-AI-FULL</h1>
        <h2>Kayıt Ol</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="client">Müşteri</option>
              <option value="expert">Uzman</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Ad</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Soyad</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefon (Opsiyonel)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {formData.role === 'expert' && (
            <>
              <div className="form-group">
                <label htmlFor="specialization">Uzmanlık Alanları (virgülle ayırın)</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization.join(', ')}
                  onChange={handleChange}
                  placeholder="Örn: Çocuk Psikolojisi, Eğitim Danışmanlığı"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="experience">Deneyim (Yıl)</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="certifications">Sertifikalar (virgülle ayırın)</label>
                <input
                  type="text"
                  id="certifications"
                  name="certifications"
                  value={formData.certifications.join(', ')}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Biyografi</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {formData.role === 'client' && (
            <>
              <div className="form-group">
                <label htmlFor="childAge">Çocuk Yaşı</label>
                <input
                  type="number"
                  id="childAge"
                  name="childAge"
                  value={formData.childAge || ''}
                  onChange={handleChange}
                  min="0"
                  max="18"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="childInterests">Çocuk İlgi Alanları (virgülle ayırın)</label>
                <input
                  type="text"
                  id="childInterests"
                  name="childInterests"
                  value={formData.childInterests.join(', ')}
                  onChange={handleChange}
                  placeholder="Örn: Resim, Müzik, Spor"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notlar</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="auth-link">
          Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

