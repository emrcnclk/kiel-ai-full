import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ExpertDashboard from './pages/Dashboard/ExpertDashboard';
import ClientDashboard from './pages/Dashboard/ClientDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BlogList from './pages/Blog/BlogList';
import BlogDetail from './pages/Blog/BlogDetail';
import BlogCreate from './pages/Blog/BlogCreate';
import BlogEdit from './pages/Blog/BlogEdit';
import ActivityList from './pages/Activity/ActivityList';
import ActivityDetail from './pages/Activity/ActivityDetail';
import ActivityCreate from './pages/Activity/ActivityCreate';
import ActivityEdit from './pages/Activity/ActivityEdit';
import Schedule from './pages/Schedule/Schedule';
import Appointments from './pages/Appointment/Appointments';
import Chat from './pages/Chat/Chat';
import AIChat from './pages/AI/AIChat';
import Profile from './pages/Profile/Profile';
import Badges from './pages/Badges/Badges';
import Certificate from './pages/Certificate/Certificate';
import ExpertList from './pages/Expert/ExpertList';
import ExpertDetail from './pages/Expert/ExpertDetail';
import Feedback from './pages/Feedback/Feedback';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
        <Route path="/dashboard" element={
          user?.role === 'expert' ? <ExpertDashboard /> :
          user?.role === 'client' ? <ClientDashboard /> :
          user?.role === 'admin' ? <AdminDashboard /> :
          <Navigate to="/login" />
        } />
        
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/blogs/create" element={<BlogCreate />} />
        <Route path="/blogs/:id/edit" element={<BlogEdit />} />
        
        <Route path="/activities" element={<ActivityList />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/activities/create" element={<ActivityCreate />} />
        <Route path="/activities/:id/edit" element={<ActivityEdit />} />
        
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/appointments" element={<Appointments />} />
        
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:partnerId" element={<Chat />} />
        
        <Route path="/ai-chat" element={<AIChat />} />
        
        <Route path="/badges" element={<Badges />} />
        <Route path="/certificate" element={<Certificate />} />
        
        <Route path="/experts" element={<ExpertList />} />
        <Route path="/experts/:id" element={<ExpertDetail />} />
        
        <Route path="/feedback" element={<Feedback />} />
        </Route>
      </Route>
      
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;

