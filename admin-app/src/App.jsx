import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('admin_url') || 'https://nordle-f65cecfv.b4a.run');
  const [apiKey, setApiKey] = useState(localStorage.getItem('admin_key') || '');
  const [isLogged, setIsLogged] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [banModalUser, setBanModalUser] = useState(null);
  const [banDuration, setBanDuration] = useState('1h');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${serverUrl}/api/admin/users`, {
        headers: { 'x-admin-key': apiKey }
      });
      if (!res.ok) throw new Error('Unauthorized or Server Error');
      const data = await res.json();
      setUsers(data);
      setIsLogged(true);
      localStorage.setItem('admin_url', serverUrl);
      localStorage.setItem('admin_key', apiKey);
    } catch (err) {
      setError(err.message);
      setIsLogged(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBanSubmit = async (e) => {
    e.preventDefault();
    let until = new Date();
    if (banDuration === '1h') until.setHours(until.getHours() + 1);
    else if (banDuration === '24h') until.setHours(until.getHours() + 24);
    else if (banDuration === '7d') until.setDate(until.getDate() + 7);
    else if (banDuration === 'perm') until.setFullYear(until.getFullYear() + 100);
    else if (banDuration === 'unban') until = null;

    try {
      const res = await fetch(`${serverUrl}/api/admin/ban`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': apiKey 
        },
        body: JSON.stringify({ username: banModalUser, untilTimestamp: until ? until.toISOString() : null })
      });
      if (!res.ok) throw new Error('Ban failed');
      setBanModalUser(null);
      fetchUsers(); // Refresh list
    } catch(err) {
      alert(err.message);
    }
  };

  if (!isLogged) {
    return (
      <div className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="card" style={{ width: 400 }}>
          <h2 style={{ color: 'var(--accent)' }}>Nordle Admin Login</h2>
          {error && <div style={{ color: 'var(--danger)', marginBottom: 15 }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <label>Server URL</label>
            <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} required />
            <label>Admin Secret Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? 'Connecting...' : 'Connect'}</button>
          </form>
        </div>
      </div>
    );
  }

  const activeBans = users.filter(u => u.banned_until && new Date(u.banned_until) > new Date()).length;

  return (
    <div className="container">
      <div className="sidebar">
        <h2 style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: 40 }}>Nordle Admin</h2>
        <button style={{ marginBottom: 10 }}>Dashboard</button>
        <button className="danger" onClick={() => setIsLogged(false)} style={{ marginTop: 'auto' }}>Logout</button>
      </div>
      
      <div className="main-content">
        <h1>Overview</h1>
        
        <div className="stat-grid" style={{ marginBottom: 30 }}>
          <div className="stat-card">
            <div>Total Players</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div>Active Bans</div>
            <div className="stat-value">{activeBans}</div>
          </div>
          <div className="stat-card">
            <div>Total Games Played</div>
            <div className="stat-value">{users.reduce((acc, u) => acc + (u.games_played || 0), 0)}</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Player Database</h2>
            <button onClick={fetchUsers}>Refresh Directory</button>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Score</th>
                <th>Offline Played / Won</th>
                <th>Online Matches</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isBanned = u.banned_until && new Date(u.banned_until) > new Date();
                return (
                  <tr key={u.username}>
                    <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                    <td>{u.total_score}</td>
                    <td>{u.games_played} / {u.games_won}</td>
                    <td>{u.online_matches_played}</td>
                    <td>
                      {isBanned ? (
                        <span style={{ color: 'var(--danger)' }}>Banned until {new Date(u.banned_until).toLocaleDateString()}</span>
                      ) : (
                        <span style={{ color: 'var(--accent)' }}>Active</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className={isBanned ? "" : "danger"} 
                        onClick={() => setBanModalUser(u.username)}>
                        {isBanned ? "Manage Ban" : "Ban Player"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {banModalUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Moderate Player: {banModalUser}</h3>
            <form onSubmit={handleBanSubmit}>
              <label>Select Action</label>
              <select value={banDuration} onChange={e => setBanDuration(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 20, background: '#111', color: '#fff' }}>
                <option value="1h">Ban for 1 Hour</option>
                <option value="24h">Ban for 24 Hours</option>
                <option value="7d">Ban for 7 Days</option>
                <option value="perm">Permanent Ban</option>
                <option value="unban">Revoke Existing Ban</option>
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="danger">Confirm Restrict</button>
                <button type="button" onClick={() => setBanModalUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
