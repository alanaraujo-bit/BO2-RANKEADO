import React, { useEffect, useState } from 'react';
import useRankedData from '../hooks/useRankedData';

export default function FriendsPanel({ setActiveTab, setCurrentUser }) {
  const rd = useRankedData(3000);
  const [data, setData] = useState(rd.state || {});
  const [currentUser, setCU] = useState(null);
  const [userData, setUserData] = useState(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Use adapter hook for reads/saves
  const readData = () => rd.read();
  const saveData = (newData) => rd.save(newData);

  const refresh = () => {
    const d = readData();
    if (!d) return;
    setData(d);
    setCU(d.currentUser || null);
    setUserData(d.players && d.currentUser ? d.players[d.currentUser] : null);
  };

  useEffect(() => {
    refresh();
    const unsubscribe = rd.subscribe((newState) => {
      setData(newState || {});
    });
    const id = setInterval(refresh, 3000);
    return () => { clearInterval(id); unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const all = data.players ? Object.values(data.players) : [];
    const q = search.toLowerCase().trim();
    const matches = all
      .filter(p => p.username && p.username.toLowerCase().includes(q) && p.username !== currentUser)
      .slice(0, 10)
      .map(p => ({ username: p.username, mmr: p.mmr || 999 }));
    setSearchResults(matches);
  }, [search, data, currentUser]);

  // Friend actions operate on localStorage shape similar to RankedData
  const sendFriendRequest = (target) => {
    const me = rd.getPlayer(currentUser) || (data.players && data.players[currentUser]) || { friendRequests: { sent: [], received: [] }, friends: [] };
    const them = rd.getPlayer(target) || (data.players && data.players[target]) || { friendRequests: { sent: [], received: [] }, friends: [] };
    me.friendRequests = me.friendRequests || { sent: [], received: [] };
    them.friendRequests = them.friendRequests || { sent: [], received: [] };
    if ((me.friends || []).includes(target)) return alert('Você já é amigo deste jogador');
    if ((me.friendRequests.sent || []).some(r => r.to === target)) return alert('Solicitação já enviada');
    me.friendRequests.sent.push({ to: target, timestamp: Date.now() });
    them.friendRequests.received.push({ from: currentUser, timestamp: Date.now() });
    rd.updatePlayer(currentUser, me);
    rd.updatePlayer(target, them);
    rd.save && rd.save();
    refresh();
    alert(`✅ Solicitação enviada para ${target}`);
  };

  const acceptFriendRequest = (from) => {
    const me = rd.getPlayer(currentUser) || (data.players && data.players[currentUser]) || { friends: [], friendRequests: { sent: [], received: [] } };
    const them = rd.getPlayer(from) || (data.players && data.players[from]) || { friends: [], friendRequests: { sent: [], received: [] } };
    me.friends = me.friends || [];
    them.friends = them.friends || [];
    me.friendRequests = me.friendRequests || { sent: [], received: [] };
    them.friendRequests = them.friendRequests || { sent: [], received: [] };
    if (!me.friends.includes(from)) me.friends.push(from);
    if (!them.friends.includes(currentUser)) them.friends.push(currentUser);
    me.friendRequests.received = (me.friendRequests.received || []).filter(r => r.from !== from);
    them.friendRequests.sent = (them.friendRequests.sent || []).filter(r => r.to !== currentUser);
    rd.updatePlayer(currentUser, me);
    rd.updatePlayer(from, them);
    rd.save && rd.save();
    refresh();
    alert(`✅ Agora você é amigo de ${from}`);
  };

  const rejectFriendRequest = (from) => {
    const me = rd.getPlayer(currentUser) || (data.players && data.players[currentUser]) || { friendRequests: { sent: [], received: [] } };
    const them = rd.getPlayer(from) || (data.players && data.players[from]) || { friendRequests: { sent: [], received: [] } };
    me.friendRequests = me.friendRequests || { sent: [], received: [] };
    them.friendRequests = them.friendRequests || { sent: [], received: [] };
    me.friendRequests.received = (me.friendRequests.received || []).filter(r => r.from !== from);
    them.friendRequests.sent = (them.friendRequests.sent || []).filter(r => r.to !== currentUser);
    rd.updatePlayer(currentUser, me);
    rd.updatePlayer(from, them);
    rd.save && rd.save();
    refresh();
    alert(`❌ Solicitação de ${from} rejeitada`);
  };

  const removeFriend = (username) => {
    if (!confirm(`Remover ${username} dos seus amigos?`)) return;
    const me = rd.getPlayer(currentUser) || (data.players && data.players[currentUser]) || { friends: [] };
    const them = rd.getPlayer(username) || (data.players && data.players[username]) || { friends: [] };
    me.friends = (me.friends || []).filter(f => f !== username);
    them.friends = (them.friends || []).filter(f => f !== currentUser);
    rd.updatePlayer(currentUser, me);
    rd.updatePlayer(username, them);
    rd.save && rd.save();
    refresh();
    alert(`❌ ${username} removido dos seus amigos`);
  };

  const openPlayerProfile = (username) => {
    if (typeof setCurrentUser === 'function') setCurrentUser(username);
    if (typeof setActiveTab === 'function') setActiveTab('profile');
  };

  // helper lists
  const friendsList = userData && userData.friends ? userData.friends : [];
  const requestsReceived = userData && userData.friendRequests && userData.friendRequests.received ? userData.friendRequests.received : [];
  const requestsSent = userData && userData.friendRequests && userData.friendRequests.sent ? userData.friendRequests.sent : [];

  const allPlayers = data.players ? Object.values(data.players) : [];
  const suggested = allPlayers
    .filter(p => p.username && p.username !== currentUser && !(friendsList || []).includes(p.username))
    .sort((a, b) => Math.abs((a.mmr || 999) - (userData?.mmr || 999)) - Math.abs((b.mmr || 999) - (userData?.mmr || 999)))
    .slice(0, 6);

  return (
    <div>
      {!currentUser && (
        <div className="empty-state" style={{padding: 24}}>
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-text">Nenhum usuário logado</div>
          <div className="empty-state-hint">Vá para o seu perfil e defina o usuário atual</div>
        </div>
      )}

      {currentUser && (
        <div>
          <div style={{marginBottom: 12}}>
            <input
              className="form-input"
              placeholder="Buscar jogador (min 2 caracteres)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{position: 'relative'}}>
              {searchResults && searchResults.length > 0 && (
                <div className="search-results" style={{position: 'absolute', zIndex: 10, background: 'var(--surface)', width: '100%'}}>
                  {searchResults.map(r => (
                    <div key={r.username} className="search-result-card" style={{display: 'flex', justifyContent: 'space-between', padding: 8}}>
                      <div style={{display: 'flex', gap: 8}}>
                        <div style={{fontWeight: 800}}>{r.username}</div>
                        <div style={{color: 'var(--text-secondary)'}}>{r.mmr} MMR</div>
                      </div>
                      <div>
                        <button className="btn-friend-add" onClick={() => sendFriendRequest(r.username)}>➕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{marginBottom: 18}}>
            <h4>📬 Solicitações recebidas</h4>
            {requestsReceived.length === 0 && <div className="empty-state">Nenhuma solicitação pendente</div>}
            {requestsReceived.map(req => (
              <div key={req.from} className="friend-card" style={{display: 'flex', justifyContent: 'space-between', padding: 8}}>
                <div style={{display: 'flex', gap: 8}}>
                  <div style={{fontWeight: 800}}>{req.from}</div>
                  <div style={{color: 'var(--text-secondary)'}}>{new Date(req.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <button className="btn-accept" onClick={() => acceptFriendRequest(req.from)}>✅</button>
                  <button className="btn-reject" onClick={() => rejectFriendRequest(req.from)}>❌</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginBottom: 18}}>
            <h4>✅ Meus amigos ({(friendsList || []).length})</h4>
            {(friendsList || []).length === 0 && <div className="empty-state">Você ainda não tem amigos</div>}
            {(friendsList || []).map(u => (
              <div key={u} className="friend-card" style={{display: 'flex', justifyContent: 'space-between', padding: 8}}>
                <div style={{display: 'flex', gap: 8}}>
                  <div style={{fontWeight: 800}}>{u}</div>
                </div>
                <div>
                  <button className="btn-view-profile" onClick={() => openPlayerProfile(u)}>👁️</button>
                  <button className="btn-remove" onClick={() => removeFriend(u)}>❌</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginBottom: 18}}>
            <h4>💡 Sugestões</h4>
            {suggested.length === 0 && <div className="empty-state">Nenhuma sugestão disponível</div>}
            <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
              {suggested.map(p => (
                <div key={p.username} className="friend-card" style={{padding: 8, minWidth: 180}}>
                  <div style={{fontWeight: 800}}>{p.username}</div>
                  <div style={{color: 'var(--text-secondary)'}}>{p.mmr} MMR</div>
                  <div style={{marginTop: 8}}>
                    <button className="btn-friend-add-small" onClick={() => sendFriendRequest(p.username)}>➕ Adicionar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
