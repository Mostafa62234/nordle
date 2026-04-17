import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function NotificationsModal({ username, socket, onClose, setUnreadCount, systemAlerts = [], setSystemAlerts }) {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);

  const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${URL}/api/friends/${username}?t=${Date.now()}`);
      const data = await res.json();
      if (data.friendships) {
        const pending = data.friendships.filter(f => f.status === 'pending' && f.receiver === username);
        setRequests(pending);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    
    const handleRefresh = () => fetchPendingRequests();
    
    // We clear unread count since we opened it
    setUnreadCount(0);

    socket.on('friendRequestReceived', handleRefresh);
    
    return () => {
      socket.off('friendRequestReceived', handleRefresh);
    };
  }, [username, socket]);

  const acceptRequest = async (requester) => {
    try {
      await fetch(`${URL}/api/friends/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester, receiver: username })
      });
      fetchPendingRequests();
    } catch(e) { console.error(e); }
  };

  const declineRequest = async (requester) => {
    try {
      // Unfriend/remove is basically identical to declining a request
      await fetch(`${URL}/api/friends/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1: requester, user2: username })
      });
      fetchPendingRequests();
    } catch(e) { console.error(e); }
  };

  const dismissAlert = (idx) => {
    setSystemAlerts(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ position: 'absolute', top: '70px', right: '20px', width: '320px', backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '15px', zIndex: 9999, border: '1px solid #333', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: 'white' }}>Inbox</h3>
        <button onClick={onClose} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
        {requests.length === 0 && systemAlerts.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', padding: '10px 0' }}>No new notifications</div>
        )}

        {systemAlerts.map((alert, idx) => (
          <div key={`alert-${idx}`} style={{ backgroundColor: '#4a1111', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '10px', borderLeft: '4px solid var(--color-red)' }}>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>{alert}</span>
            <button onClick={() => dismissAlert(idx)} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
          </div>
        ))}

        {requests.map(req => (
          <div key={req.id} style={{ backgroundColor: '#2a2a2c', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>
              <strong style={{ color: 'var(--color-yellow)' }}>{req.requester}</strong> sent you a friend request!
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => acceptRequest(req.requester)}
                style={{ flex: 1, padding: '6px', background: 'var(--color-green)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Accept
              </button>
              <button 
                onClick={() => declineRequest(req.requester)}
                style={{ flex: 1, padding: '6px', background: '#3f3f46', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
