import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import FriendsModal from '../components/FriendsModal';
import NotificationsModal from '../components/NotificationsModal';

const NavItem = ({ iconPaths, label, onClick, iconBgColor, iconColor }) => {
  return (
    <button 
      onClick={onClick}
      className="nav-item"
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: iconBgColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '20px'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {iconPaths}
        </svg>
      </div>
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{label}</span>
    </button>
  );
};

export default function Home({ navigate, username, socket }) {
  const { t, lang, setLang } = useLanguage();
  const [showFriends, setShowFriends] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Check for unread notifications
  React.useEffect(() => {
    if (!username) return;
    const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    
    const fetchUnread = () => {
      fetch(`${URL}/api/friends/${username}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            if (data.friendships) {
              const pending = data.friendships.filter(f => f.status === 'pending' && f.receiver === username);
              setUnreadCount(pending.length);
            }
        }).catch(() => {});
    };

    fetchUnread();

    if (socket) {
      socket.on('friendRequestReceived', fetchUnread);
      socket.on('systemAlert', (msg) => {
        setSystemAlerts(prev => [msg, ...prev]);
        setUnreadCount(c => c + 1);
      });
      return () => {
        socket.off('friendRequestReceived', fetchUnread);
        socket.off('systemAlert');
      };
    }
  }, [username, socket]);
  
  const handleRestrictedAction = (action) => {
    if (!username) {
      alert("You must log in to access this feature.");
      navigate('login');
      return;
    }
    if (typeof action === 'function') action();
    else navigate(action);
  };

  return (
    <div className="fade-slide-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '80px', backgroundColor: 'var(--bg-color)' }}>
      {/* Top Bar for Guest Status and Language Toggle */}
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          style={{
            background: 'transparent',
            border: '1px solid #555',
            color: 'var(--text-color)',
            padding: '4px 12px',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          {lang === 'en' ? 'عربي' : 'EN'}
        </button>
        <button 
          onClick={() => setShowHowToPlay(true)}
          style={{
            background: 'transparent',
            border: '1px solid #555',
            color: 'var(--text-color)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ?
        </button>
      </div>

      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: '15px' }}>
        {username && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none'
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            {unreadCount > 0 && (
              <div style={{ 
                position: 'absolute', top: '-5px', right: '-5px', 
                backgroundColor: 'red', color: 'white', fontSize: '0.7rem', 
                fontWeight: 'bold', width: '18px', height: '18px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {unreadCount}
              </div>
            )}
          </div>
        )}
        <div style={{ color: '#aaa', fontSize: '1rem', fontWeight: 'bold' }}>
          {username || 'Guest'}
        </div>
      </div>
      
      {showNotifications && (
        <NotificationsModal 
           username={username} socket={socket} 
           onClose={() => setShowNotifications(false)}
           setUnreadCount={setUnreadCount} 
           systemAlerts={systemAlerts}
           setSystemAlerts={setSystemAlerts}
        />
      )}
      
      {/* Title */}
      <h1 dir="ltr" style={{ direction: 'ltr', fontSize: '4.5rem', marginBottom: '10px', display: 'flex', gap: '2px', fontWeight: '900', letterSpacing: '1px' }}>
        <span style={{color: '#1dd05d'}}>N</span>
        <span style={{color: '#facb3d'}}>O</span>
        <span style={{color: 'var(--text-color)'}}>R</span>
        <span style={{color: '#1dd05d'}}>D</span>
        <span style={{color: 'var(--text-color)'}}>L</span>
        <span style={{color: '#facb3d'}}>E</span>
      </h1>
      
      {/* Subtitle */}
      <div style={{ fontSize: '0.9rem', letterSpacing: '4px', color: '#777', marginBottom: '40px', fontWeight: '600' }}>
        {t('subtitle')}
      </div>

      <div style={{ width: '100%', padding: '0 20px', maxWidth: '380px' }}>
        <NavItem 
          onClick={() => navigate('difficultySelect')}
          label={t('play_offline')}
          iconBgColor="#113322"
          iconColor="#1dd05d"
          iconPaths={
            <>
              <line x1="6" y1="12" x2="10" y2="12" />
              <line x1="8" y1="10" x2="8" y2="14" />
              <line x1="15" y1="13" x2="15.01" y2="13" />
              <line x1="18" y1="11" x2="18.01" y2="11" />
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </>
          }
        />

        <NavItem 
          onClick={() => handleRestrictedAction('difficultySelectOnline')}
          label={t('play_online')}
          iconBgColor="#332200"
          iconColor="#facb3d"
          iconPaths={
            <>
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </>
          }
        />

        <NavItem 
          onClick={() => handleRestrictedAction(() => setShowFriends(true))}
          label="Friends"
          iconBgColor="#3b0764"
          iconColor="#d8b4fe"
          iconPaths={
            <>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
          }
        />

        <NavItem 
          onClick={() => handleRestrictedAction('metrics')}
          label={t('metrics')}
          iconBgColor="#0b1e36"
          iconColor="#3b82f6"
          iconPaths={
            <>
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </>
          }
        />

        <NavItem 
          onClick={() => navigate('settings')}
          label={t('settings')}
          iconBgColor="#2c2c2e"
          iconColor="#aaa"
          iconPaths={
            <>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </>
          }
        />
      </div>

      {/* Dots Indicator */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '40px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1dd05d' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#facb3d' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#555' }} />
      </div>

      {showFriends && (
        <FriendsModal 
          username={username} 
          socket={socket} 
          onClose={() => setShowFriends(false)} 
        />
      )}

      {showHowToPlay && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: '400px', backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <h2 style={{ color: 'var(--color-yellow)', marginBottom: '15px' }}>{t('htp_title')}</h2>
            <ul style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.5', paddingInlineStart: '20px' }}>
              <li style={{ marginBottom: '10px' }}>{t('htp_step1')}</li>
              <li style={{ marginBottom: '10px' }}>{t('htp_step2')}</li>
              <li style={{ marginBottom: '10px' }}>{t('htp_step3')}</li>
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--color-green)', borderRadius: '4px', flexShrink: 0 }}></div>
                <span style={{ color: '#fff' }}>{t('htp_green')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--color-yellow)', borderRadius: '4px', flexShrink: 0 }}></div>
                <span style={{ color: '#fff' }}>{t('htp_yellow')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#3f3f46', borderRadius: '4px', flexShrink: 0 }}></div>
                <span style={{ color: '#fff' }}>{t('htp_gray')}</span>
              </div>
            </div>
            <button onClick={() => setShowHowToPlay(false)} style={{ marginTop: '25px', background: 'var(--color-green)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
