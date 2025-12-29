import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          KIEL-AI-FULL
        </Link>
        <div className="navbar-menu">
          <span className="navbar-user">{user?.email}</span>
          <button onClick={handleLogout} className="navbar-logout">
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

