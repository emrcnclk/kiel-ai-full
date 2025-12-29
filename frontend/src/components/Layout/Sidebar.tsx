import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const expertMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profil', icon: '👤' },
    { path: '/blogs', label: 'Blog Yazıları', icon: '📝' },
    { path: '/blogs/create', label: 'Yeni Blog', icon: '➕' },
    { path: '/activities', label: 'Aktiviteler', icon: '🎮' },
    { path: '/activities/create', label: 'Yeni Aktivite', icon: '➕' },
    { path: '/schedule', label: 'Takvim', icon: '📅' },
    { path: '/appointments', label: 'Randevular', icon: '📋' },
    { path: '/chat', label: 'Mesajlar', icon: '💬' },
    { path: '/ai-chat', label: 'AI Asistan', icon: '🤖' },
  ];

  const clientMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profil', icon: '👤' },
    { path: '/blogs', label: 'Blog Yazıları', icon: '📝' },
    { path: '/activities', label: 'Aktiviteler', icon: '🎮' },
    { path: '/appointments', label: 'Randevular', icon: '📋' },
    { path: '/chat', label: 'Mesajlar', icon: '💬' },
    { path: '/ai-chat', label: 'AI Asistan', icon: '🤖' },
  ];

  const adminMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/blogs', label: 'Blog Yazıları', icon: '📝' },
    { path: '/activities', label: 'Aktiviteler', icon: '🎮' },
    { path: '/appointments', label: 'Randevular', icon: '📋' },
  ];

  const menu = user?.role === 'expert' ? expertMenu :
                user?.role === 'client' ? clientMenu :
                adminMenu;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

