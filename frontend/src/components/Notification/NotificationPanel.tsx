import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';
import { Notification } from '../../types';
import { RootState } from '../../store/store';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Her 30 saniyede bir kontrol et
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications?unreadOnly=true');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      setUnreadCount(response.data.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-panel">
      <button
        className="notification-button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
      >
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Bildirimler</h3>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">Yeni bildirim yok</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif._id)}
                >
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <span className="notification-time">
                    {new Date(notif.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

