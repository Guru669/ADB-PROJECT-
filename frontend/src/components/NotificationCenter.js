import React, { useState, useEffect } from 'react';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    // Load from localStorage for now
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const unread = messages.filter(m => !m.isRead).length;
    setUnreadCount(unread);
    setNotifications(messages.slice(-5)); // Last 5 messages
  };

  const markAsRead = (messageId) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updated = messages.map(m => 
      m.id === messageId ? { ...m, isRead: true } : m
    );
    localStorage.setItem('messages', JSON.stringify(updated));
    loadNotifications();
  };

  const styles = {
    container: {
      position: 'relative',
    },
    bell: {
      position: 'relative',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '10px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },
    badge: {
      position: 'absolute',
      top: '0',
      right: '0',
      background: '#dc3545',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    panel: {
      position: 'absolute',
      top: '50px',
      right: '0',
      width: '350px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000,
      animation: 'slideDown 0.3s ease',
    },
    header: {
      padding: '15px',
      borderBottom: '2px solid #f0f0f0',
      fontWeight: 'bold',
      color: '#1e5631',
    },
    notificationItem: {
      padding: '15px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    notificationItemUnread: {
      background: '#f0f7f0',
    },
    notificationContent: {
      fontSize: '13px',
      color: '#333',
    },
    notificationTime: {
      fontSize: '11px',
      color: '#999',
      marginTop: '5px',
    },
    empty: {
      padding: '20px',
      textAlign: 'center',
      color: '#999',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.bell}
        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <div style={styles.badge}>{unreadCount}</div>
        )}
      </div>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.header}>
            📬 Notifications ({unreadCount} unread)
          </div>
          {notifications.length === 0 ? (
            <div style={styles.empty}>No notifications yet</div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  ...styles.notificationItem,
                  ...(notif.isRead ? {} : styles.notificationItemUnread)
                }}
                onClick={() => {
                  markAsRead(notif.id);
                }}
              >
                <div style={styles.notificationContent}>
                  <strong>{notif.subject}</strong>
                  <p>{notif.content}</p>
                </div>
                <div style={styles.notificationTime}>
                  {new Date(notif.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
