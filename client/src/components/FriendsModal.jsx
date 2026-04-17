import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function FriendsModal({ username, socket, onClose }) {
  const { t } = useLanguage();
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState('');
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [challengeDiff, setChallengeDiff] = useState('Normal');
  const [challengeRounds, setChallengeRounds] = useState(3);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${URL}/api/friends/${username}?t=${Date.now()}`);
      const data = await res.json();
      if (data.friendships) {
        setFriends(data.friendships);
        // Ask server for statuses of these friends
        const friendUsernames = data.friendships.map(f => f.requester === username ? f.receiver : f.requester);
        socket.emit('checkStatuses', friendUsernames);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFriends();
    
    const handleStatusesResult = (statuses) => {
      setOnlineStatuses(prev => ({...prev, ...statuses}));
    };
    const handleUserStatus = ({ username: uName, online }) => {
      setOnlineStatuses(prev => ({...prev, [uName]: online}));
    };

    const handleFriendRequestAccepted = () => {
      fetchFriends();
    };

    socket.on('statusesResult', handleStatusesResult);
    socket.on('userStatus', handleUserStatus);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);

    return () => {
      socket.off('statusesResult', handleStatusesResult);
      socket.off('userStatus', handleUserStatus);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
    };
  }, [username, socket]);

  const sendRequest = async () => {
    if (!newFriend.trim()) return;
    try {
      const response = await fetch(`${URL}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester: username, receiver: newFriend.trim() })
      });
      const data = await response.json();
      setNewFriend('');
      fetchFriends();

      if (data.status === 'accepted') {
        setFeedbackMsg(`You and ${newFriend} are now friends!`);
      } else {
        setFeedbackMsg(`Request sent to ${newFriend}!`);
      }
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch(e) { 
      setFeedbackMsg('Error sending request.'); 
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  // Pending requests moved to NotificationsModal

  const handleAction = async (actionUrl, targetUsername) => {
    if (!window.confirm(`Are you sure you want to ${actionUrl.split('/').pop()} ${targetUsername}?`)) return;
    try {
      await fetch(`${URL}${actionUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionUrl.includes('remove') 
          ? { user1: username, user2: targetUsername } 
          : { blocker: username, blocked: targetUsername }
        )
      });
      fetchFriends();
    } catch(e) { }
  };

  const handleChallenge = () => {
    if (!selectedFriend) return;
    socket.emit('inviteFriend', { 
      targetUsername: selectedFriend, 
      difficulty: challengeDiff, 
      roundsCount: challengeRounds 
    });
    setFeedbackMsg(`Challenge sent to ${selectedFriend}! Waiting for response...`);
    setTimeout(() => setFeedbackMsg(''), 4000);
    setSelectedFriend(null);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: '400px', backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--color-green)' }}>Friends</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        {feedbackMsg && (
          <div style={{ background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
            {feedbackMsg}
          </div>
        )}

        {/* Add Friend */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Username..." 
            value={newFriend} 
            onChange={e => setNewFriend(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #555', background: '#333', color: 'white' }}
          />
          <button className="btn-primary" onClick={sendRequest} style={{ padding: '0 15px' }}>Add</button>
        </div>

        {/* Pending Requests moved to Notification Bell */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <h4 style={{ color: '#aaa', marginBottom: '10px' }}>My Friends</h4>
          {friends.filter(f => f.status === 'accepted').length === 0 && <p style={{ color: '#555' }}>No friends yet.</p>}
          {friends.filter(f => f.status === 'accepted').map(f => {
            const friendName = f.requester === username ? f.receiver : f.requester;
            const isOnline = !!onlineStatuses[friendName];
            return (
              <div key={f.id || friendName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2c2c2e', padding: '10px', borderRadius: '8px', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isOnline ? 'var(--color-green)' : '#555' }} />
                  <span>{friendName}</span>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {isOnline && (
                    <button onClick={() => setSelectedFriend(friendName)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Challenge</button>
                  )}
                  <button onClick={() => handleAction('/api/friends/remove', friendName)} title="Unfriend" style={{ background: '#3f3f46', color: '#ffb3b3', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✖</button>
                  <button onClick={() => handleAction('/api/friends/block', friendName)} title="Block" style={{ background: '#7f1d1d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>🚫</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Challenge Configurator Popup */}
        {selectedFriend && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>Challenge {selectedFriend}</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <select value={challengeDiff} onChange={e => setChallengeDiff(e.target.value)} style={{ padding: '8px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', flex: 1 }}>
                <option value="Easy">Easy</option>
                <option value="Normal">Normal</option>
                <option value="Hard">Hard</option>
                <option value="Extreme">Extreme</option>
              </select>
              <select value={challengeRounds} onChange={e => setChallengeRounds(parseInt(e.target.value))} style={{ padding: '8px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', flex: 1 }}>
                <option value={1}>1 Round</option>
                <option value={3}>3 Rounds</option>
                <option value={5}>5 Rounds</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleChallenge} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Send</button>
              <button onClick={() => setSelectedFriend(null)} style={{ padding: '10px', background: '#444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
