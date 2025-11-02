
import Head from 'next/head';
import Script from 'next/script';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import FriendsPanel from '../components/FriendsPanel';

const ClientOnly = dynamic(() => import('../components/ClientOnly'), { ssr: false });

const TABS = [
  { id: 'home', label: '🏠 HOME' },
  { id: 'play', label: '🎮 JOGAR' },
  { id: 'profile', label: '👤 PERFIL' },
  { id: 'friends', label: '👥 AMIGOS' },
  { id: 'seasons', label: '🏆 TEMPORADAS' },
  { id: 'ranks', label: '🎖️ RANKS' },
  { id: 'leaderboard', label: '🏆 RANKING' },
  { id: 'history', label: '📜 HISTÓRICO' },
];

export default function Home() {
  const contentRef = useRef(null);
  const [activeTab, setActiveTab] = useState('home');
  const [topPlayers, setTopPlayers] = useState([]);
  const [top3, setTop3] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [opponents, setOpponents] = useState([]);
  const [pendingMatchesState, setPendingMatchesState] = useState([]);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Prevent React from touching the DOM after scripts load
  useEffect(() => {
    if (contentRef.current && scriptsLoaded) {
      // Mark this node as "hands off" for React
      contentRef.current.__reactInternalInstance = null;
    }
  }, [scriptsLoaded]);

  // Load scripts sequentially to ensure proper order
  useEffect(() => {
    const loadScriptsSequentially = async () => {
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => {
            console.log(`✅ Loaded: ${src}`);
            resolve();
          };
          script.onerror = reject;
          document.body.appendChild(script);
        });
      };

      try {
        // Firebase SDK first
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        
        // Then firebase config
        await loadScript('/js/firebase-config.js');
        
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Then other scripts
        await loadScript('/js/ranks.js');
        await loadScript('/js/mmr.js');
        await loadScript('/js/anti-abuse.js');
        await loadScript('/js/data-firebase.js');
        await loadScript('/js/friends.js');
        await loadScript('/js/seasons.js');
        await loadScript('/js/seasons-ui.js');
        await loadScript('/js/matches.js');
        await loadScript('/js/match-registration.js');
        await loadScript('/js/profile.js');
        await loadScript('/js/ui.js');
        await loadScript('/js/main.js');
        
        console.log('✅ All scripts loaded successfully');
        setScriptsLoaded(true);
      } catch (error) {
        console.error('❌ Error loading scripts:', error);
      }
    };

    loadScriptsSequentially();
  }, []);

  // Simple localStorage-backed leaderboard reader (fallback to data format used by original app)
  const loadLeaderboardFromStorage = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bo2ranked') : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const playersObj = parsed.players || {};
      const players = Object.values(playersObj || {}).map(p => ({
        username: p.username,
        mmr: typeof p.mmr === 'number' ? p.mmr : Number(p.mmr) || 0,
        wins: p.wins || 0,
        losses: p.losses || 0,
        totalKills: p.totalKills || 0,
        totalDeaths: p.totalDeaths || 0,
        gamesPlayed: p.gamesPlayed || 0
      }));
      players.sort((a, b) => (b.mmr || 0) - (a.mmr || 0));
      return players;
    } catch (e) {
      console.error('Error reading leaderboard from storage', e);
      return [];
    }
  };

  useEffect(() => {
    // Initial load and periodic refresh
    const refresh = () => {
      const lb = loadLeaderboardFromStorage();
      setTopPlayers(lb.slice(0, 5));
      setTop3(lb.slice(0, 3));
    };

    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  

  

  const loadMatchesFromStorage = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bo2ranked') : null;
      if (!raw) return { recent: [], history: [] };
      const parsed = JSON.parse(raw);
      const matches = parsed.matches || [];
      const currentUser = parsed.currentUser || null;

      if (!currentUser) return { recent: [], history: [] };

      // Normalize and filter matches involving currentUser
      const playerMatches = matches
        .filter(m => {
          if (Array.isArray(m.players)) return m.players.includes(currentUser);
          return m.playerA === currentUser || m.playerB === currentUser || (m.winner && (m.playerA === currentUser || m.playerB === currentUser));
        })
        .map(m => {
          const opponent = m.playerA === currentUser ? m.playerB : m.playerB === currentUser ? m.playerA : (m.opponent || 'Desconhecido');
          const kills = Number(m.kills) || Number(m.killsReported) || 0;
          const deaths = Number(m.deaths) || Number(m.deathsReported) || 0;
          const kd = (deaths > 0 ? (kills / deaths) : kills).toFixed(2);
          const isWinner = m.winner === currentUser || m.result === 'win' || (m.reporter === currentUser && m.confirmed === true && m.winner === currentUser);
          const mmrChange = (m.mmrDelta && m.mmrDelta.winner) ? (isWinner ? (m.mmrDelta.winner.change || 0) : (m.mmrDelta.loser?.change || 0)) : (m.mmrChange || 0);
          const date = new Date(m.timestamp || m.date || Date.now()).toLocaleString('pt-BR');
          return {
            id: m.id || m.matchId || Math.random().toString(36).slice(2, 9),
            opponent,
            map: m.map || m.mapName || 'Mapa',
            mode: m.mode || m.gameMode || '',
            kills,
            deaths,
            kd,
            isWinner,
            mmrChange,
            date,
            confirmed: !!m.confirmed
          };
        })
        .sort((a, b) => 0); // keep original order for now

      return {
        recent: playerMatches.slice(0, 5),
        history: playerMatches
      };
    } catch (e) {
      console.error('Error reading matches from storage', e);
      return { recent: [], history: [] };
    }
  };

  useEffect(() => {
    const refresh = () => {
      const { recent, history } = loadMatchesFromStorage();
      setRecentMatches(recent);
      setMatchHistory(history);
    };

    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  // Load current player info from storage and keep in state
  const loadCurrentPlayerFromStorage = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bo2ranked') : null;
      if (!raw) return { currentUser: null, player: null };
      const parsed = JSON.parse(raw);
      const cu = parsed.currentUser || null;
      const players = parsed.players || {};
      const player = cu && players[cu] ? players[cu] : null;
      return { currentUser: cu, player };
    } catch (e) {
      console.error('Error reading current player from storage', e);
      return { currentUser: null, player: null };
    }
  };

  useEffect(() => {
    const refresh = () => {
      const { currentUser: cu, player } = loadCurrentPlayerFromStorage();
      setCurrentUser(cu);
      setCurrentPlayer(player);
    };

    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  // Load opponents list and pending matches
  const loadOpponentsAndPending = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bo2ranked') : null;
      if (!raw) return { opponents: [], pending: [] };
      const parsed = JSON.parse(raw);
      const playersObj = parsed.players || {};
      const playersArr = Object.values(playersObj || {}).map(p => p.username).filter(Boolean);
      const opps = playersArr.filter(u => u !== parsed.currentUser).sort((a,b)=> a.localeCompare(b));
      const pending = parsed.pendingConfirmations || parsed.pending || parsed.pendingMatches || [];
      return { opponents: opps, pending };
    } catch (e) {
      console.error('Error reading opponents/pending from storage', e);
      return { opponents: [], pending: [] };
    }
  };

  useEffect(() => {
    const refresh = () => {
      const { opponents: opps, pending } = loadOpponentsAndPending();
      setOpponents(opps);
      setPendingMatchesState(pending || []);
    };
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  const RecentMatches = ({ matches }) => {
    if (!matches || matches.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🎮</div>
          <p className="empty-text">Nenhuma partida jogada ainda</p>
          <p className="empty-subtext">Registre sua primeira partida ranqueada para ver seu histórico</p>
          <button className="btn-empty-action" onClick={() => setActiveTab('play')}>Jogar Agora</button>
        </div>
      );
    }

    return (
      <div>
        {matches.map((m) => (
          <div key={m.id} className="match-card">
            <div className="match-result-icon">{m.isWinner ? '✅' : '❌'}</div>
            <div className="match-info">
              <div className="match-opponent">vs {m.opponent}</div>
              <div className="match-details">{m.map} • {m.mode} • {m.date}</div>
            </div>
            <div className="match-stats">
              <div className="match-stat">
                <div className="match-stat-label">K/D</div>
                <div className="match-stat-value">{m.kd}</div>
              </div>
              <div className="match-stat">
                <div className="match-stat-label">KILLS</div>
                <div className="match-stat-value">{m.kills}</div>
              </div>
              <div className="match-stat">
                <div className="match-stat-label">DEATHS</div>
                <div className="match-stat-value">{m.deaths}</div>
              </div>
            </div>
            <div className={`match-mmr-change ${m.mmrChange >= 0 ? 'positive' : 'negative'}`}>
              {m.mmrChange >= 0 ? '+' : ''}{m.mmrChange}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const MatchHistoryList = ({ matches }) => {
    if (!matches || matches.length === 0) {
      return <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Nenhuma partida jogada ainda.</p>;
    }

    return (
      <div>
        {matches.map(m => (
          <div key={m.id} style={{background: 'linear-gradient(135deg, rgba(10,10,10,0.9), rgba(20,20,20,0.9))', padding: 16, borderRadius: 10, marginBottom: 12}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: 16, fontWeight: 700, color: m.isWinner ? 'var(--success)' : 'var(--error)'}}>{m.isWinner ? 'VITÓRIA' : 'DERROTA'}</div>
                <div style={{color: 'var(--text-secondary)', marginTop: 6}}>vs {m.opponent} • {m.map} • {m.mode}</div>
                <div style={{color: 'var(--text-muted)', fontSize: 12, marginTop: 6}}>{m.date}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 18, fontWeight: 800, color: 'var(--primary-orange)'}}>{m.kills}/{m.deaths}</div>
                <div style={{color: 'var(--neon-blue)'}}>K/D: {m.kd}</div>
                <div style={{marginTop: 6, color: m.confirmed ? 'var(--success)' : 'var(--warning)'}}>{m.confirmed ? 'Confirmado' : 'Pendente'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Small presentational components
  // Rank definitions (shared between helper and grid)
  const RANKS = [
    { name: 'Bronze I', min: 999, max: 1099, icon: '🥉', color: '#CD7F32' },
    { name: 'Bronze II', min: 1100, max: 1199, icon: '🥉', color: '#CD7F32' },
    { name: 'Bronze III', min: 1200, max: 1299, icon: '🥉', color: '#CD7F32' },
    { name: 'Prata I', min: 1300, max: 1399, icon: '🥈', color: '#C0C0C0' },
    { name: 'Prata II', min: 1400, max: 1499, icon: '🥈', color: '#C0C0C0' },
    { name: 'Prata III', min: 1500, max: 1599, icon: '🥈', color: '#C0C0C0' },
    { name: 'Ouro I', min: 1600, max: 1699, icon: '🥇', color: '#FFD700' },
    { name: 'Ouro II', min: 1700, max: 1799, icon: '🥇', color: '#FFD700' },
    { name: 'Ouro III', min: 1800, max: 1899, icon: '🥇', color: '#FFD700' },
    { name: 'Platina I', min: 1900, max: 1999, icon: '💎', color: '#E5E4E2' },
    { name: 'Platina II', min: 2000, max: 2099, icon: '💎', color: '#E5E4E2' },
    { name: 'Platina III', min: 2100, max: 2199, icon: '💎', color: '#E5E4E2' },
    { name: 'Diamante I', min: 2200, max: 2299, icon: '💠', color: '#B9F2FF' },
    { name: 'Diamante II', min: 2300, max: 2399, icon: '💠', color: '#B9F2FF' },
    { name: 'Diamante III', min: 2400, max: 2499, icon: '💠', color: '#B9F2FF' },
    { name: 'Mestre', min: 2500, max: 2999, icon: '👑', color: '#9370DB' },
    { name: 'Lenda', min: 3000, max: Infinity, icon: '⚡', color: '#FF1493' }
  ];

  // Lightweight rank helper (keeps parity with js/ranks.js ranges)
  const getRankForMMR = (mmr = 999) => {
    mmr = Number(mmr) || 999;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      const r = RANKS[i];
      if (mmr >= r.min && mmr <= r.max) return r;
    }
    return RANKS[0];
  };

  const Podium = ({ players }) => {
    if (!players || players.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p className="empty-text">Seja o primeiro no ranking!</p>
        </div>
      );
    }

    // Build visual order: second, first, third for a podium layout
    const layout = [players[1], players[0], players[2]];

    return (
      <div className="podium-grid" style={{display: 'flex', gap: 16, alignItems: 'end', justifyContent: 'center'}}>
        {layout.map((player, i) => {
          if (!player) return <div key={i} className="podium-place" style={{flex: 1}} />;
          const rank = getRankForMMR(player.mmr);
          const place = i === 0 ? '2º' : i === 1 ? '1º' : '3º';
          const height = i === 1 ? 220 : i === 0 ? 170 : 140;
          return (
            <div
              key={player.username}
              className={`podium-place podium-${i}`}
              onClick={() => setActiveTab('leaderboard')}
              style={{
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(26,26,26,0.9), rgba(10,10,10,0.9))',
                border: `2px solid ${rank.color}`,
                borderRadius: 12,
                padding: 16,
                width: 200,
                height,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: `0 8px 30px ${rank.color}33`
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{fontSize: 28}}>{rank.icon}</div>
                <div>
                  <div style={{fontWeight: 800, color: rank.color, fontSize: 18}}>{player.username}</div>
                  <div style={{color: 'var(--text-secondary)', fontSize: 13}}>{rank.name}</div>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 700, color: 'var(--primary-orange)', fontSize: 20}}>{player.mmr} MMR</div>
                <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>{place}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

    // Leaderboard table component (reads from localStorage periodically)
    const LeaderboardTable = () => {
      const [players, setPlayers] = useState([]);

      useEffect(() => {
        const refresh = () => {
          const lb = loadLeaderboardFromStorage();
          setPlayers(lb);
        };
        refresh();
        const id = setInterval(refresh, 5000);
        return () => clearInterval(id);
      }, []);

      if (!players || players.length === 0) {
        return (
          <div className="empty-state" style={{padding: '40px 0', textAlign: 'center'}}>
            <div className="empty-state-icon">🏆</div>
            <div className="empty-state-text">Nenhum dado disponível</div>
            <div className="empty-state-hint">O ranking será exibido aqui quando houver jogadores registrados.</div>
          </div>
        );
      }

      return (
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jogador</th>
                <th>MMR</th>
                <th>V</th>
                <th>D</th>
                <th>K/D</th>
              </tr>
            </thead>
            <tbody>
            {players.map((p, idx) => {
              const rank = getRankForMMR(p.mmr);
              const kd = p.totalDeaths > 0 ? (p.totalKills / p.totalDeaths).toFixed(2) : (p.totalKills || 0).toFixed(2);
              return (
                <tr
                  key={p.username}
                  onClick={() => {
                    // set the current profile and switch to profile tab
                    try { setCurrentUser && setCurrentUser(p.username); } catch (e) { /* ignore */ }
                    try { setActiveTab && setActiveTab('profile'); } catch (e) { /* ignore */ }
                  }}
                  style={{cursor: 'pointer'}}
                >
                  <td>{idx + 1}</td>
                  <td style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{fontSize: 18}}>{rank.icon}</span>
                    <span>{p.username}</span>
                  </td>
                  <td style={{color: rank.color}}>{p.mmr}</td>
                  <td>{p.wins || 0}</td>
                  <td>{p.losses || 0}</td>
                  <td>{kd}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      );
    };

    // Ranks grid component
    const RanksGrid = () => {
      return (
        <div className="ranks-grid-cards" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12}}>
          {RANKS.map((r, i) => (
            <div key={r.name} className="rank-card" style={{background: 'linear-gradient(135deg, rgba(10,10,10,0.9), rgba(20,20,20,0.9))', padding: 12, borderRadius: 8, border: `2px solid ${r.color}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{fontSize: 22}}>{r.icon}</div>
                <div>
                  <div style={{fontWeight: 800}}>{r.name}</div>
                  <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>{r.min} - {r.max === Infinity ? '+' : r.max} MMR</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

  const TopPlayersPreview = ({ players }) => {
    if (!players || players.length === 0) {
      return <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Nenhum jogador ainda. Seja o primeiro!</p>;
    }

    return (
      <div className="top-players-grid">
        {players.map((player, index) => {
          const position = index + 1;
          const kd = player.totalDeaths > 0 ? (player.totalKills / player.totalDeaths).toFixed(2) : (player.totalKills || 0).toFixed(2);
          const winRate = player.gamesPlayed > 0 ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) : '0.0';
          return (
            <div key={player.username} className="top-player-card" onClick={() => setActiveTab('leaderboard')}>
              <div className="top-player-medal">{position <= 3 ? (position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉') : `#${position}`}</div>
              <div className="top-player-info">
                <div className="top-player-name">{player.username}</div>
                <div className="top-player-sub">{player.mmr} MMR • {player.wins}W • {kd} K/D</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const PendingMatches = ({ pending }) => {
    if (!pending || pending.length === 0) {
      return null;
    }

    return (
      <div id="pendingSection" className="pending-section section-card">
        <div className="section-header">
          <span className="section-badge">⏳</span>
          <h2 className="section-title">PARTIDAS PENDENTES</h2>
          <p className="section-subtitle">Partidas que aguardam confirmação do adversário</p>
        </div>
        <div id="pendingMatches" className="pending-matches-list">
          {pending.map((p, idx) => {
            const match = p.matchData || p;
            const reporter = p.reporter || match.reporter || 'Relator';
            const map = match.map || match.mapName || 'Desconhecido';
            const mode = match.mode || match.gameMode || '';
            return (
              <div key={idx} className="pending-card">
                <div className="pending-info">
                  <div className="pending-title">Partida reportada por {reporter}</div>
                  <div className="pending-meta">{map} • {mode}</div>
                </div>
                <div className="pending-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const matchId = p.matchId || match.id;
                      // Prefer RankedData API
                      if (typeof window !== 'undefined' && window.RankedData && typeof window.RankedData.confirmMatch === 'function') {
                        try {
                          window.RankedData.confirmMatch(matchId);
                          window.RankedData.save && window.RankedData.save();
                        } catch (e) {
                          console.error('Error confirming via RankedData', e);
                        }
                      } else {
                        try {
                          const raw = localStorage.getItem('bo2ranked');
                          if (raw) {
                            const parsed = JSON.parse(raw);
                            parsed.pendingConfirmations = (parsed.pendingConfirmations || []).filter(pc => (pc.matchId || pc.matchId === 0 ? pc.matchId : pc.match?.id) !== matchId);
                            // mark match confirmed if exists
                            if (Array.isArray(parsed.matches)) {
                              const mi = parsed.matches.findIndex(m => m.id === matchId || m.matchId === matchId);
                              if (mi !== -1) parsed.matches[mi].confirmed = true;
                            }
                            localStorage.setItem('bo2ranked', JSON.stringify(parsed));
                          }
                        } catch (e) {
                          console.error('Error confirming via localStorage', e);
                        }
                      }

                      // Refresh React state
                      try {
                        const { opponents: opps, pending } = loadOpponentsAndPending();
                        setOpponents(opps);
                        setPendingMatchesState(pending || []);
                      } catch (e) { /* ignore */ }
                      try {
                        const { recent, history } = loadMatchesFromStorage();
                        setRecentMatches(recent);
                        setMatchHistory(history);
                      } catch (e) { /* ignore */ }
                      alert('Partida confirmada');
                    }}
                  >
                    CONFIRMAR
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const matchId = p.matchId || match.id;
                      if (typeof window !== 'undefined' && window.RankedData && typeof window.RankedData.pendingConfirmations !== 'undefined') {
                        try {
                          // remove pending via RankedData
                          const rd = window.RankedData;
                          rd.pendingConfirmations = (rd.pendingConfirmations || []).filter(pc => (pc.matchId || pc.match?.id) !== matchId);
                          rd.save && rd.save();
                        } catch (e) {
                          console.error('Error rejecting via RankedData', e);
                        }
                      } else {
                        try {
                          const raw = localStorage.getItem('bo2ranked');
                          if (raw) {
                            const parsed = JSON.parse(raw);
                            parsed.pendingConfirmations = (parsed.pendingConfirmations || []).filter(pc => (pc.matchId || pc.matchId === 0 ? pc.matchId : pc.match?.id) !== matchId);
                            localStorage.setItem('bo2ranked', JSON.stringify(parsed));
                          }
                        } catch (e) {
                          console.error('Error rejecting via localStorage', e);
                        }
                      }

                      // Refresh React state
                      try {
                        const { opponents: opps, pending } = loadOpponentsAndPending();
                        setOpponents(opps);
                        setPendingMatchesState(pending || []);
                      } catch (e) { /* ignore */ }

                      alert('Partida rejeitada');
                    }}
                  >
                    REJEITAR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const HeroPlayerCard = ({ player }) => {
    if (!player) return null;
    const rank = getRankForMMR(player.mmr);
    const winRate = player.gamesPlayed > 0 ? Math.round((player.wins / player.gamesPlayed) * 100) + '%' : '0%';
    const kd = player.totalDeaths > 0 ? (player.totalKills / player.totalDeaths).toFixed(2) : (player.totalKills || 0).toFixed(2);
    const matchesCount = player.gamesPlayed || 0;

    return (
      <div style={{display: 'flex', gap: 20, alignItems: 'center'}}>
        <div className="player-rank-display">
          <div className="rank-icon-large" id="heroRankIcon" style={{fontSize: 48}}>{rank.icon}</div>
          <div className="rank-info">
            <div className="rank-label">SUA PATENTE ATUAL</div>
            <div className="rank-name-large" id="heroRankName" style={{color: rank.color}}>{rank.name}</div>
            <div className="rank-mmr-display">
              <span className="mmr-value" id="heroMMR">{player.mmr}</span>
              <span className="mmr-label">MMR</span>
            </div>
          </div>
        </div>
        <div className="player-quick-stats">
          <div className="quick-stat">
            <span className="stat-label">V/D</span>
            <span className="stat-value" id="heroWinRate">{winRate}</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">K/D</span>
            <span className="stat-value" id="heroKD">{kd}</span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">BATALHAS</span>
            <span className="stat-value" id="heroMatches">{matchesCount}</span>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div suppressHydrationWarning key="app-root">
      <Head>
        <title>BO2 Plutonium Ranked System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhana:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
  {/* Scripts are loaded sequentially via useEffect to ensure proper order */}
      <div ref={contentRef} className="particles" id="particles" suppressHydrationWarning key="particles"></div>
      <nav className="navbar" suppressHydrationWarning key="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-text">BO2</span>
            <span className="logo-ranked">RANKED</span>
          </div>
          <ul className="nav-menu" id="navMenu">
            {TABS.map(tab => (
              <li key={tab.id}>
                <a
                  href="#"
                  className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
                  onClick={e => { e.preventDefault(); setActiveTab(tab.id); }}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-user">
            <div className="notification-bell" id="notificationBell" style={{display: 'none'}}>
              🔔
              <span className="notification-badge" id="notificationBadge">0</span>
            </div>
            <span className="user-name" id="currentUserName">Visitante</span>
            <button
              className="btn-login"
              id="btnLogin"
              onClick={() => {
                if (typeof window !== 'undefined' && typeof window.showLoginModal === 'function') {
                  try { window.showLoginModal(); } catch (e) { console.error('Erro ao abrir modal de login:', e); }
                } else if (typeof window !== 'undefined' && window.UI && typeof window.UI.showLoginModal === 'function') {
                  try { window.UI.showLoginModal(); } catch (e) { console.error('Erro ao abrir modal de login via UI:', e); }
                } else {
                  // Fallback: try to dispatch a custom event so legacy scripts can hook
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('bo2:request-login'));
                  }
                  // As last resort, show a friendly message
                  setTimeout(() => {
                    if (typeof document !== 'undefined' && !document.querySelector('#loginModal.active')) {
                      alert('A funcionalidade de login não está disponível no momento. Abra o console para mais detalhes.');
                    }
                  }, 200);
                }
              }}
            >LOGIN</button>
          </div>
        </div>
      </nav>
      <div className="notifications-dropdown" id="notificationsDropdown" suppressHydrationWarning>
        <div className="notifications-header">
          <h3>🔔 Notificações</h3>
          <button style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2em'}}>✕</button>
        </div>
        <div className="notifications-content" id="notificationsContent">
          <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: 20}}>
            Nenhuma notificação
          </p>
        </div>
      </div>
      <div className="main-container" suppressHydrationWarning>
        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <div id="home" className="page active">
            {/* HERO / BANNER PRINCIPAL */}
            <div className="hero-banner hero-improved">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">SISTEMA OFICIAL DE RANQUEADAS</span>
                </div>
                <h1 className="hero-title">
                  <span className="title-highlight">DOMINE O CAMPO DE BATALHA</span>
                  <span className="title-main">BLACK OPS 2 RANKED</span>
                </h1>
                <p className="hero-description">
                  Entre no combate competitivo. Registre suas vitórias, suba de patente e prove que você é o melhor operador do BO2.
                </p>
                <div className="hero-player-card" id="heroPlayerCard" style={{display: 'none'}}>
                  <HeroPlayerCard player={currentPlayer} />
                </div>
                <div className="hero-actions">
                  <button className="btn-hero-primary" onClick={() => setActiveTab('play')}>
                    <span className="btn-icon">🎮</span>
                    <span className="btn-text">REGISTRAR BATALHA</span>
                  </button>
                  <button className="btn-hero-secondary" onClick={() => setActiveTab('leaderboard')}>
                    <span className="btn-icon">🏆</span>
                    <span className="btn-text">VER CLASSIFICAÇÃO</span>
                  </button>
                </div>
                <div className="hero-stats-bar">
                  <div className="stat-item">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value" id="totalPlayers">0</div>
                      <div className="stat-label">Operadores Ativos</div>
                    </div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-icon">⚔️</div>
                    <div className="stat-content">
                      <div className="stat-value" id="totalMatches">0</div>
                      <div className="stat-label">Combates Registrados</div>
                    </div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <div className="stat-value" id="activeSeason">S1</div>
                      <div className="stat-label">Temporada de Guerra</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="rank-showcase">
                  <div className="showcase-ring"></div>
                  <div className="showcase-icon" id="showcaseRankIcon">⚡</div>
                </div>
              </div>
            </div>
            {/* COMO FUNCIONA / INTRODUÇÃO */}
            <div className="how-it-works-section section-card">
              <div className="section-header">
                <span className="section-badge">🎖️</span>
                <h2 className="section-title">SUA PATENTE ESPERA – SUBA NO RANKED</h2>
                <p className="section-subtitle">Cada kill conta. Cada vitória importa. Domine o campo de batalha e alcance a glória máxima!</p>
              </div>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">01</div>
                  <div className="step-icon">⚔️</div>
                  <h3 className="step-title">Entre em Combate</h3>
                  <p className="step-description">Desafie outros operadores em partidas ranqueadas intensas. Só os melhores sobrevivem.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">02</div>
                  <div className="step-icon">🎮</div>
                  <h3 className="step-title">Registre sua Batalha</h3>
                  <p className="step-description">Após cada combate, registre o resultado com kills, deaths e screenshot do placar final.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">03</div>
                  <div className="step-icon">📈</div>
                  <h3 className="step-title">Ganhe MMR</h3>
                  <p className="step-description">Vitórias aumentam seu MMR. Sua performance (K/D) também influencia nos ganhos de pontos.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">04</div>
                  <div className="step-icon">🏆</div>
                  <h3 className="step-title">Suba de Patente</h3>
                  <p className="step-description">Acumule MMR e evolua: Bronze → Prata → Ouro → Platina → Diamante → Mestre → Lenda.</p>
                </div>
              </div>
              <div className="rank-progression-visual">
                <div className="progression-track">
                  <div className="progression-step bronze">
                    <div className="step-icon-mini">🥉</div>
                    <div className="step-name">BRONZE</div>
                  </div>
                  <div className="progression-line"></div>
                  <div className="progression-step silver">
                    <div className="step-icon-mini">🥈</div>
                    <div className="step-name">PRATA</div>
                  </div>
                  <div className="progression-line"></div>
                  <div className="progression-step gold">
                    <div className="step-icon-mini">🥇</div>
                    <div className="step-name">OURO</div>
                  </div>
                  <div className="progression-line"></div>
                  <div className="progression-step platinum">
                    <div className="step-icon-mini">💎</div>
                    <div className="step-name">PLATINA</div>
                  </div>
                  <div className="progression-line"></div>
                  <div className="progression-step diamond">
                    <div className="step-icon-mini">💠</div>
                    <div className="step-name">DIAMANTE</div>
                  </div>
                  <div className="progression-line"></div>
                  <div className="progression-step master">
                    <div className="step-icon-mini">👑</div>
                    <div className="step-name">MESTRE</div>
                  </div>
                  <div className="progression-line"></div>
                  <div className="progression-step legend">
                    <div className="step-icon-mini">⚡</div>
                    <div className="step-name">LENDA</div>
                  </div>
                </div>
              </div>
            </div>
            {/* ÚLTIMAS PARTIDAS */}
            <div className="recent-matches-section section-card">
              <div className="section-header">
                <span className="section-badge">⚔️</span>
                <h2 className="section-title">SUAS ÚLTIMAS BATALHAS</h2>
                <p className="section-subtitle">Analise seu desempenho recente e identifique pontos de melhoria no campo de batalha</p>
              </div>
              <div id="recentMatchesContainer" className="recent-matches-container">
                <RecentMatches matches={recentMatches} />
              </div>
            </div>
            {/* TOP JOGADORES / DESTAQUES */}
            <div className="top-players-section section-card">
              <div className="section-header">
                <span className="section-badge">🏆</span>
                <h2 className="section-title">ELITE DO BO2 RANKED</h2>
                <p className="section-subtitle">Os melhores operadores estão aqui. Quem vai dominar a classificação hoje?</p>
              </div>
              <div className="podium-container">
                <div id="podiumDisplay" className="podium-display">
                  <Podium players={top3} />
                </div>
              </div>
              <div className="top-players-list" id="topPlayersPreview">
                <TopPlayersPreview players={topPlayers} />
              </div>
              <div className="view-all-container">
                <button className="btn-view-all" onClick={() => setActiveTab('leaderboard')}>
                  <span>VER RANKING COMPLETO</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
            {/* CALL TO ACTION / ENGAJAMENTO */}
            <div className="cta-section">
              <div className="cta-background">
                <div className="cta-glow"></div>
              </div>
              <div className="cta-content">
                <div className="cta-icon">⚡</div>
                <h2 className="cta-title">MISSÃO: DOMINAR O RANKED</h2>
                <p className="cta-description">Seu objetivo está claro: suba de patente, domine o combate e conquiste a glória. Registre sua próxima batalha agora!</p>
                <div className="cta-actions">
                  <button className="btn-cta-primary" onClick={() => setActiveTab('play')}>
                    <span className="btn-icon">🎯</span>
                    <span className="btn-text">REGISTRAR BATALHA</span>
                    <span className="btn-shine"></span>
                  </button>
                  <button className="btn-cta-secondary" onClick={() => setActiveTab('friends')}>
                    <span className="btn-icon">👥</span>
                    <span className="btn-text">DESAFIAR OPERADORES</span>
                  </button>
                </div>
                <div className="cta-stats">
                  <div className="cta-stat">
                    <span className="cta-stat-icon">🔥</span>
                    <span className="cta-stat-text">Proteção Anti-Trapaça em Operação</span>
                  </div>
                  <div className="cta-stat">
                    <span className="cta-stat-icon">✅</span>
                    <span className="cta-stat-text">Verificação Dupla de Resultados</span>
                  </div>
                  <div className="cta-stat">
                    <span className="cta-stat-icon">📸</span>
                    <span className="cta-stat-text">Confirmação Visual Obrigatória</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Outras páginas (exemplo) */}
        {activeTab === 'play' && (
          <div id="play" className="page active">
            {/* HERO / BANNER JOGAR */}
            <div className="match-hero">
              <div className="match-hero-content">
                <div className="match-badge">
                  <span className="badge-icon">⚔️</span>
                  <span className="badge-text">REGISTRO DE COMBATE</span>
                </div>
                <h1 className="match-hero-title">
                  <span className="title-highlight">REGISTRE SUA BATALHA</span>
                  <span className="title-main">E ATUALIZE SEU RANK</span>
                </h1>
                <p className="match-hero-description">
                  Cada vitória, cada kill, cada derrota conta! Registre seus combates, atualize seu MMR e suba de patente no ranking.
                </p>
              </div>
            </div>
            {/* FORMULÁRIO DE REGISTRO */}
            <div className="match-form-section">
              {/* Pending matches (if any) */}
              <PendingMatches pending={pendingMatchesState} />
              <div className="section-header">
                <span className="section-badge">📋</span>
                <h2 className="section-title">DADOS DA PARTIDA</h2>
                <p className="section-subtitle">Preencha os detalhes do seu combate ranqueado</p>
              </div>
              <form className="match-form-bo2">
                <div className="form-grid-bo2">
                  {/* Adversário */}
                  <div className="form-field-bo2">
                    <label className="field-label-bo2">
                      <span className="label-icon">👥</span>
                      <span className="label-text">ADVERSÁRIO</span>
                      <span className="label-required">*</span>
                    </label>
                    <select id="opponentSelect" className="field-input-bo2" required>
                      <option value="">Selecione o oponente...</option>
                      {opponents && opponents.length > 0 ? opponents.map(o => (
                        <option key={o} value={o}>{o}</option>
                      )) : null}
                    </select>
                    <div className="field-hint">Escolha contra quem você batalhou</div>
                  </div>
                  {/* Modo de Jogo */}
                  <div className="form-field-bo2">
                    <label className="field-label-bo2">
                      <span className="label-icon">🎯</span>
                      <span className="label-text">MODO DE JOGO</span>
                      <span className="label-required">*</span>
                    </label>
                    <select className="field-input-bo2" required>
                      <option value="">Selecione o modo...</option>
                      <option value="TDM">Team Deathmatch</option>
                      <option value="DOM">Domination</option>
                      <option value="SND">Search and Destroy</option>
                      <option value="HP">Hardpoint</option>
                      <option value="CTF">Capture the Flag</option>
                      <option value="KC">Kill Confirmed</option>
                    </select>
                    <div className="field-hint">Tipo de combate ranqueado</div>
                  </div>
                  {/* Mapa */}
                  <div className="form-field-bo2">
                    <label className="field-label-bo2">
                      <span className="label-icon">🗺️</span>
                      <span className="label-text">CAMPO DE BATALHA</span>
                      <span className="label-required">*</span>
                    </label>
                    <select className="field-input-bo2" required>
                      <option value="">Selecione o mapa...</option>
                      <option value="Nuketown">📍 Nuketown 2025</option>
                      <option value="Raid">📍 Raid</option>
                      <option value="Standoff">📍 Standoff</option>
                      <option value="Slums">📍 Slums</option>
                      <option value="Hijacked">📍 Hijacked</option>
                      <option value="Express">📍 Express</option>
                      <option value="Yemen">📍 Yemen</option>
                      <option value="Carrier">📍 Carrier</option>
                      <option value="Meltdown">📍 Meltdown</option>
                      <option value="Plaza">📍 Plaza</option>
                    </select>
                    <div className="field-hint">Localização do combate</div>
                  </div>
                  {/* Resultado */}
                  <div className="form-field-bo2">
                    <label className="field-label-bo2">
                      <span className="label-icon">🏆</span>
                      <span className="label-text">RESULTADO</span>
                      <span className="label-required">*</span>
                    </label>
                    <div className="result-buttons">
                      <button type="button" className="result-btn result-win">
                        <span className="result-icon">✅</span>
                        <span className="result-text">VITÓRIA</span>
                      </button>
                      <button type="button" className="result-btn result-loss">
                        <span className="result-icon">❌</span>
                        <span className="result-text">DERROTA</span>
                      </button>
                    </div>
                    <input type="hidden" required />
                    <div className="field-hint">Qual foi o desfecho da batalha?</div>
                  </div>
                </div>
                {/* Stats Grid */}
                <div className="stats-input-grid">
                  <div className="form-field-bo2">
                    <label className="field-label-bo2">
                      <span className="label-icon">🔫</span>
                      <span className="label-text">KILLS</span>
                      <span className="label-required">*</span>
                    </label>
                    <input type="number" className="field-input-bo2 input-number" min="0" max="999" placeholder="0" required />
                    <div className="field-hint">Abates confirmados</div>
                  </div>
                  <div className="form-field-bo2">
                    <label className="field-label-bo2">
                      <span className="label-icon">💀</span>
                      <span className="label-text">DEATHS</span>
                      <span className="label-required">*</span>
                    </label>
                    <input type="number" className="field-input-bo2 input-number" min="0" max="999" placeholder="0" required />
                    <div className="field-hint">Baixas sofridas</div>
                  </div>
                  <div className="kd-display">
                    <div className="kd-label">K/D RATIO</div>
                    <div className="kd-value">0.00</div>
                  </div>
                </div>
                {/* Notas Estratégicas */}
                <div className="form-field-bo2 form-field-full">
                  <label className="field-label-bo2">
                    <span className="label-icon">📝</span>
                    <span className="label-text">NOTAS ESTRATÉGICAS</span>
                    <span className="label-optional">(Opcional)</span>
                  </label>
                  <textarea className="field-textarea-bo2" placeholder="Ex: Dominamos B e C no início, flank pela direita funcionou bem..." maxLength={500} rows={4}></textarea>
                  <div className="field-hint">Observações sobre táticas, loadouts ou momentos chave</div>
                </div>
                {/* Screenshot */}
                <div className="form-field-bo2 form-field-full">
                  <label className="field-label-bo2">
                    <span className="label-icon">📸</span>
                    <span className="label-text">SCREENSHOT DO PLACAR</span>
                    <span className="label-optional">(Opcional)</span>
                  </label>
                  <div className="file-upload-bo2">
                    <input type="file" className="file-input-hidden" accept="image/*" />
                    <label className="file-upload-label">
                      <span className="upload-icon">📤</span>
                      <span className="upload-text">Clique para enviar screenshot</span>
                      <span className="upload-hint">PNG, JPG até 5MB</span>
                    </label>
                    <div className="file-preview-bo2"></div>
                  </div>
                  <div className="field-hint">Evidência visual do resultado para verificação</div>
                </div>
                {/* Botões de Ação */}
                <div className="form-actions-bo2">
                  <button type="button" className="btn-form-secondary">
                    <span className="btn-icon">🔄</span>
                    <span>LIMPAR CAMPOS</span>
                  </button>
                  <button type="submit" className="btn-form-primary">
                    <span className="btn-icon">💥</span>
                    <span>CONFIRMAR BATALHA</span>
                    <span className="btn-shine-effect"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div id="profile" className="page active">
            {/* Empty State (Not Logged In) */}
            <div id="profileNotLoggedIn" className="profile-empty-state">
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <p className="empty-text">Você precisa estar logado</p>
                <p className="empty-subtext">Faça login para ver seu perfil e acompanhar suas estatísticas</p>
                <button className="btn-empty-action">Fazer Login</button>
              </div>
            </div>
            {/* Profile Content (Logged In) - Exemplo visual */}
            <div id="profileContent" className="profile-container" style={{display: 'none'}}>
              <div className="profile-hero-section">
                <div className="profile-hero-bg">
                  <div className="hero-scanline"></div>
                </div>
                <div className="profile-hero-content">
                  <div className="profile-avatar-wrapper">
                    <div className="avatar-ring"></div>
                    <div className="profile-avatar-large" id="profileAvatar">
                      <span className="avatar-icon-large" id="profileAvatarIcon">🎮</span>
                    </div>
                    <div className="avatar-level-badge" id="profileLevelBadge">
                      <span className="level-text">LV <span id="profileLevel">1</span></span>
                    </div>
                  </div>
                  <div className="profile-hero-info">
                    <div className="player-identity">
                      <h1 className="player-name-hero" id="profileName">Jogador</h1>
                      <span className="player-id-hero" id="profileId">#0000</span>
                    </div>
                    <div className="rank-mmr-container">
                      <div className="rank-display-hero">
                        <span className="rank-icon-hero" id="profileRankIcon">🥉</span>
                        <div className="rank-text-hero">
                          <span className="rank-label-hero">RANK ATUAL</span>
                          <span className="rank-name-hero" id="profileRankName">BRONZE III</span>
                        </div>
                      </div>
                      <div className="mmr-display-hero">
                        <div className="mmr-value-hero" id="profileMMR">1000</div>
                        <div className="mmr-label-hero">MMR Points</div>
                      </div>
                    </div>
                    <div className="rank-progress-hero" id="rankProgressSection">
                      <div className="progress-info">
                        <span className="progress-text">Próximo Rank: <strong id="nextRankName">PRATA III</strong></span>
                        <span className="progress-remaining"><span id="mmrNeeded">200</span> MMR faltam</span>
                      </div>
                      <div className="progress-bar-hero">
                        <div className="progress-fill-hero" id="progressBarFill" style={{width: '0%'}}>
                          <span className="progress-glow"></span>
                        </div>
                        <span className="progress-percentage-hero" id="progressPercentage">0%</span>
                      </div>
                      <div className="progress-range">
                        <span id="currentRankMMR">0</span>
                        <span id="nextRankMMR">1000</span>
                      </div>
                    </div>
                    <div className="max-rank-badge" id="maxRankMessage" style={{display: 'none'}}>
                      <span className="max-rank-icon">⚡</span>
                      <span className="max-rank-text">RANK MÁXIMO ATINGIDO - LENDA!</span>
                    </div>
                    <div className="hero-quick-stats">
                      <div className="quick-stat-item">
                        <span className="quick-stat-value" id="heroWins">0</span>
                        <span className="quick-stat-label">Vitórias</span>
                      </div>
                      <div className="stat-divider-hero"></div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-value" id="heroLosses">0</span>
                        <span className="quick-stat-label">Derrotas</span>
                      </div>
                      <div className="stat-divider-hero"></div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-value" id="heroKD">0.00</span>
                        <span className="quick-stat-label">K/D</span>
                      </div>
                    </div>
                    <div className="hero-actions">
                      <button className="btn-hero-primary-profile" onClick={() => setActiveTab('play')}>
                        <span className="btn-icon">⚔️</span>
                        <span>JOGAR AGORA</span>
                      </button>
                      <button className="btn-hero-secondary-profile" onClick={() => setActiveTab('friends')}>
                        <span className="btn-icon">👥</span>
                        <span>AMIGOS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Estatísticas Gerais */}
              <div className="profile-stats-section">
                <div className="section-header-profile">
                  <div className="section-title-wrapper">
                    <span className="section-icon-profile">📊</span>
                    <h2 className="section-title-profile">Estatísticas Gerais</h2>
                  </div>
                  <p className="section-subtitle-profile">Seu desempenho em números</p>
                </div>
                <div className="stats-grid-profile">
                  <div className="stat-card-profile stat-win-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">✅</span>
                      <span className="stat-label-profile">Vitórias</span>
                    </div>
                    <div className="stat-value-profile" id="statWins">0</div>
                    <div className="stat-trend-profile">
                      <span className="trend-icon">↗</span>
                      <span className="trend-text">Subindo!</span>
                    </div>
                  </div>
                  <div className="stat-card-profile stat-loss-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">❌</span>
                      <span className="stat-label-profile">Derrotas</span>
                    </div>
                    <div className="stat-value-profile" id="statLosses">0</div>
                  </div>
                  <div className="stat-card-profile stat-highlight-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">📈</span>
                      <span className="stat-label-profile">Taxa de Vitória</span>
                    </div>
                    <div className="stat-value-profile" id="statWinRate">0%</div>
                  </div>
                  <div className="stat-card-profile stat-highlight-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">⚔️</span>
                      <span className="stat-label-profile">K/D Ratio</span>
                    </div>
                    <div className="stat-value-profile" id="statKD">0.00</div>
                  </div>
                  <div className="stat-card-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">🔫</span>
                      <span className="stat-label-profile">Total Kills</span>
                    </div>
                    <div className="stat-value-profile" id="statTotalKills">0</div>
                  </div>
                  <div className="stat-card-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">💀</span>
                      <span className="stat-label-profile">Total Deaths</span>
                    </div>
                    <div className="stat-value-profile" id="statTotalDeaths">0</div>
                  </div>
                  <div className="stat-card-profile stat-special-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">🔥</span>
                      <span className="stat-label-profile">Melhor Streak</span>
                    </div>
                    <div className="stat-value-profile" id="statBestStreak">0</div>
                  </div>
                  <div className="stat-card-profile">
                    <div className="stat-card-header">
                      <span className="stat-icon-profile">🎮</span>
                      <span className="stat-label-profile">Total Partidas</span>
                    </div>
                    <div className="stat-value-profile" id="statTotalGames">0</div>
                  </div>
                </div>
              </div>
              {/* Últimas Partidas */}
              <div className="profile-matches-section">
                <div className="section-header-profile">
                <div className="section-title-wrapper">
                  <span className="section-icon-profile">⚔️</span>
                  <h2 className="section-title-profile">Últimas Partidas</h2>
                </div>
                <p className="section-subtitle-profile">Reviva seus últimos combates</p>
              </div>
              <div id="matchHistory">
                <MatchHistoryList matches={matchHistory} />
              </div>
                <div className="matches-filters-profile">
                  <button className="filter-btn-profile active">
                    <span>📋 Todas</span>
                  </button>
                  <button className="filter-btn-profile">
                    <span>✅ Vitórias</span>
                  </button>
                  <button className="filter-btn-profile">
                    <span>❌ Derrotas</span>
                  </button>
                </div>
                <div className="matches-grid-profile" id="profileMatchesList">
                  {/* Será preenchido via JavaScript */}
                </div>
                <div className="view-more-profile" id="viewMoreMatches" style={{display: 'none'}}>
                  <button className="btn-view-more-profile">
                    <span>Ver Mais Partidas</span>
                    <span className="btn-icon">↓</span>
                  </button>
                </div>
              </div>
              {/* Conquistas */}
              <div className="profile-achievements-section">
                <div className="section-header-profile">
                  <div className="section-title-wrapper">
                    <span className="section-icon-profile">🏅</span>
                    <h2 className="section-title-profile">Conquistas</h2>
                  </div>
                  <p className="section-subtitle-profile">Suas glórias e medalhas de guerra</p>
                </div>
                <div className="achievements-grid-profile" id="achievementsGrid">
                  {/* Será preenchido via JavaScript */}
                </div>
              </div>
              {/* Call to Action */}
              <div className="profile-cta-section">
                <div className="cta-bg-profile">
                  <div className="cta-scanline-profile"></div>
                </div>
                <div className="cta-content-profile">
                  <span className="cta-icon-profile">⚡</span>
                  <h2 className="cta-title-profile">Continue Sua Escalada</h2>
                  <p className="cta-description-profile">
                    Você está no caminho certo! Registre mais partidas e alcance novos ranks.
                  </p>
                  <div className="cta-buttons-profile">
                    <button className="btn-cta-primary-profile" onClick={() => setActiveTab('play')}>
                      <span className="btn-icon">⚔️</span>
                      <span>JOGAR AGORA</span>
                    </button>
                    <button className="btn-cta-secondary-profile" onClick={() => setActiveTab('leaderboard')}>
                      <span className="btn-icon">🏆</span>
                      <span>VER RANKING</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'friends' && (
          <div id="friends" className="page active">
            <div className="section">
              <h2 className="section-title">👥 AMIGOS & REDE SOCIAL</h2>
              <FriendsPanel setActiveTab={setActiveTab} setCurrentUser={setCurrentUser} />
            </div>
          </div>
        )}
        {activeTab === 'seasons' && (
          <div id="seasons" className="page active">
            {/* Active Season Hero */}
            <div className="season-hero">
              <div className="season-hero-content">
                <div className="season-badge">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-text">TEMPORADA RANQUEADA</span>
                </div>
                <div className="season-status-row">
                  <span className="season-status-pill" id="seasonStatusPill">AO VIVO</span>
                  <span className="season-dates" id="seasonDates">--/--/---- • --/--/----</span>
                </div>
                <h1 className="season-hero-title" id="activeSeasonName">
                  <span className="title-highlight">SEASON 1:</span>
                  <span className="title-main">GENESIS</span>
                </h1>
                <p className="season-hero-description" id="activeSeasonDescription">
                  A primeira temporada ranqueada. Prove seu valor e conquiste seu lugar no topo!
                </p>
                <div className="season-timer" id="seasonTimer">
                  <div className="timer-icon">⏰</div>
                  <div className="timer-content">
                    <div className="timer-label">Tempo Restante</div>
                    <div className="timer-value" id="timerValue">45 dias</div>
                  </div>
                </div>
                <div className="season-hero-actions" style={{marginTop:12, display:'flex', gap:12, flexWrap:'wrap'}}>
                  <button className="btn-hero-secondary" onClick={() => setActiveTab('leaderboard')}>
                    <span className="btn-icon">🏆</span>
                    <span className="btn-text">VER RANKING DA TEMPORADA</span>
                  </button>
                  <button className="btn-hero-primary" onClick={() => setActiveTab('play')}>
                    <span className="btn-icon">🎮</span>
                    <span className="btn-text">REGISTRAR PARTIDA</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Player Rank Progress (placeholder) */}
            <div className="player-rank-progress" id="playerRankProgress" style={{display: 'none'}}>
              <div className="section-header">
                <span className="section-badge">📊</span>
                <h2 className="section-title">SEU PROGRESSO ATUAL</h2>
                <p className="section-subtitle">Acompanhe sua evolução rumo ao topo</p>
              </div>

              <div className="current-rank-display">
                <div className="current-rank-card">
                  <div className="rank-icon-large" id="currentRankIcon">🥉</div>
                  <div className="rank-info-large">
                    <div className="rank-label-large">PATENTE ATUAL</div>
                    <div className="rank-name-huge" id="currentRankName">BRONZE I</div>
                    <div className="rank-mmr-large">
                      <span className="mmr-value-large" id="currentMMRValue">150</span>
                      <span className="mmr-label-large">MMR</span>
                    </div>
                  </div>
                </div>

                <div className="progress-arrow">➜</div>

                <div className="next-rank-card">
                  <div className="rank-icon-medium" id="nextRankIcon">🥈</div>
                  <div className="rank-info-medium">
                    <div className="rank-label-medium">PRÓXIMA PATENTE</div>
                    <div className="rank-name-medium" id="nextRankName">PRATA I</div>
                    <div className="mmr-needed-display">
                      <span id="mmrNeededValue">150</span> MMR restantes
                    </div>
                  </div>
                </div>
              </div>

              <div className="progress-bar-section">
                <div className="progress-labels">
                  <span className="progress-current" id="progressCurrentMMR">0 MMR</span>
                  <span className="progress-percentage-display" id="progressPercentageDisplay">0%</span>
                  <span className="progress-target" id="progressTargetMMR">300 MMR</span>
                </div>
                <div className="progress-bar-container-large">
                  <div className="progress-bar-fill-large" id="progressBarFillLarge" style={{width: '0%'}}>
                    <div className="progress-shine-effect"></div>
                    <div className="progress-stripes"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranks Overview */}
            <div className="ranks-table-section">
              <div className="section-header">
                <span className="section-badge">🎖️</span>
                <h2 className="section-title">TODAS AS PATENTES</h2>
                <p className="section-subtitle">Conheça todos os ranks e seus requisitos de MMR</p>
              </div>

              <RanksGrid />
            </div>

            {/* Tips */}
            <div className="ranks-tips-section">
              <div className="section-header">
                <span className="section-badge">💡</span>
                <h2 className="section-title">DICAS PARA EVOLUIR MAIS RÁPIDO</h2>
                <p className="section-subtitle">Estratégias comprovadas para dominar o ranked</p>
              </div>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">🎯</div>
                  <h3 className="tip-title">Foque em Objetivos</h3>
                  <p className="tip-description">Em modos como Domination e Hardpoint, capture pontos estrategicamente. Kills não valem nada sem controle de mapa.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🔫</div>
                  <h3 className="tip-title">Domine Seu Loadout</h3>
                  <p className="tip-description">Use armas e perks que complementam seu estilo. AN-94, MSMC e DSR-50 são meta. Hardline e Toughness são essenciais.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🗺️</div>
                  <h3 className="tip-title">Conheça os Mapas</h3>
                  <p className="tip-description">Estude spawn points, rotas de flank e power positions. Conhecimento de mapa é metade da vitória.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">👥</div>
                  <h3 className="tip-title">Jogue em Equipe</h3>
                  <p className="tip-description">Comunique-se, cubra companheiros e coordene streaks. Trabalho em equipe vence partidas ranqueadas.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">📊</div>
                  <h3 className="tip-title">Analise Seus Erros</h3>
                  <p className="tip-description">Revise partidas perdidas. Identifique padrões de morte e ajuste seu posicionamento e timing.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">⏱️</div>
                  <h3 className="tip-title">Consistência &gt; Grind</h3>
                  <p className="tip-description">Melhor jogar 3 partidas focado que 10 cansado. Mantenha performance constante para subir ranks.</p>
                </div>
              </div>
            </div>

            {/* Ranks CTA */}
            <div className="ranks-cta">
              <div className="ranks-cta-content">
                <div className="cta-icon-large">⚔️</div>
                <h2 className="cta-title-large">PRONTO PARA A BATALHA?</h2>
                <p className="cta-description-large">Coloque seu treinamento em prática. Registre suas vitórias e comece sua jornada rumo ao topo.</p>
                <div className="cta-buttons-large">
                  <button className="btn-cta-primary-large" onClick={() => setActiveTab('play')}>
                    <span className="btn-icon">🎮</span>
                    <span>REGISTRAR BATALHA</span>
                  </button>
                  <button className="btn-cta-secondary-large" onClick={() => setActiveTab('profile')}>
                    <span className="btn-icon">📊</span>
                    <span>VER MEU PERFIL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'ranks' && (
          <div id="ranks" className="page active">
            {/* RANKS HERO */}
            <div className="ranks-hero">
              <div className="ranks-hero-content">
                <div className="ranks-badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">SISTEMA DE PROGRESSÃO</span>
                </div>
                <h1 className="ranks-hero-title">
                  <span className="title-highlight">SUBA DE PATENTE</span>
                  <span className="title-main">E DOMINE O CAMPO DE BATALHA</span>
                </h1>
                <p className="ranks-hero-description">
                  Cada partida conta! Ganhe MMR, evolua nas patentes e mostre quem é o melhor operador do BO2 Ranked.
                </p>
              </div>
            </div>

            {/* Player Progress Placeholder */}
            <div className="player-rank-progress" id="playerRankProgress" style={{display: 'none'}}>
              <div className="section-header">
                <span className="section-badge">📊</span>
                <h2 className="section-title">SEU PROGRESSO ATUAL</h2>
                <p className="section-subtitle">Acompanhe sua evolução rumo ao topo</p>
              </div>
              <div className="current-rank-display">
                <div className="current-rank-card">
                  <div className="rank-icon-large" id="currentRankIcon">🥉</div>
                  <div className="rank-info-large">
                    <div className="rank-label-large">PATENTE ATUAL</div>
                    <div className="rank-name-huge" id="currentRankName">BRONZE I</div>
                    <div className="rank-mmr-large">
                      <span className="mmr-value-large" id="currentMMRValue">150</span>
                      <span className="mmr-label-large">MMR</span>
                    </div>
                  </div>
                </div>
                <div className="progress-arrow">➜</div>
                <div className="next-rank-card">
                  <div className="rank-icon-medium" id="nextRankIcon">🥈</div>
                  <div className="rank-info-medium">
                    <div className="rank-label-medium">PRÓXIMA PATENTE</div>
                    <div className="rank-name-medium" id="nextRankName">PRATA I</div>
                    <div className="mmr-needed-display">
                      <span id="mmrNeededValue">150</span> MMR restantes
                    </div>
                  </div>
                </div>
              </div>
              <div className="progress-bar-section">
                <div className="progress-labels">
                  <span className="progress-current" id="progressCurrentMMR">0 MMR</span>
                  <span className="progress-percentage-display" id="progressPercentageDisplay">0%</span>
                  <span className="progress-target" id="progressTargetMMR">300 MMR</span>
                </div>
                <div className="progress-bar-container-large">
                  <div className="progress-bar-fill-large" id="progressBarFillLarge" style={{width: '0%'}}>
                    <div className="progress-shine-effect"></div>
                    <div className="progress-stripes"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranks Table */}
            <div className="ranks-table-section">
              <div className="section-header">
                <span className="section-badge">🎖️</span>
                <h2 className="section-title">TODAS AS PATENTES</h2>
                <p className="section-subtitle">Conheça todos os ranks e seus requisitos de MMR</p>
              </div>
              <RanksGrid />
            </div>

            {/* Tips */}
            <div className="ranks-tips-section">
              <div className="section-header">
                <span className="section-badge">💡</span>
                <h2 className="section-title">DICAS PARA EVOLUIR MAIS RÁPIDO</h2>
                <p className="section-subtitle">Estratégias comprovadas para dominar o ranked</p>
              </div>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">🎯</div>
                  <h3 className="tip-title">Foque em Objetivos</h3>
                  <p className="tip-description">Em modos como Domination e Hardpoint, capture pontos estrategicamente. Kills não valem nada sem controle de mapa.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🔫</div>
                  <h3 className="tip-title">Domine Seu Loadout</h3>
                  <p className="tip-description">Use armas e perks que complementam seu estilo. AN-94, MSMC e DSR-50 são meta. Hardline e Toughness são essenciais.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🗺️</div>
                  <h3 className="tip-title">Conheça os Mapas</h3>
                  <p className="tip-description">Estude spawn points, rotas de flank e power positions. Conhecimento de mapa é metade da vitória.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">👥</div>
                  <h3 className="tip-title">Jogue em Equipe</h3>
                  <p className="tip-description">Comunique-se, cubra companheiros e coordene streaks. Trabalho em equipe vence partidas ranqueadas.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">📊</div>
                  <h3 className="tip-title">Analise Seus Erros</h3>
                  <p className="tip-description">Revise partidas perdidas. Identifique padrões de morte e ajuste seu posicionamento e timing.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">⏱️</div>
                  <h3 className="tip-title">Consistência &gt; Grind</h3>
                  <p className="tip-description">Melhor jogar 3 partidas focado que 10 cansado. Mantenha performance constante para subir ranks.</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="ranks-cta">
              <div className="ranks-cta-content">
                <div className="cta-icon-large">⚔️</div>
                <h2 className="cta-title-large">PRONTO PARA A BATALHA?</h2>
                <p className="cta-description-large">Coloque seu treinamento em prática. Registre suas vitórias e comece sua jornada rumo ao topo.</p>
                <div className="cta-buttons-large">
                  <button className="btn-cta-primary-large" onClick={() => setActiveTab('play')}>
                    <span className="btn-icon">🎮</span>
                    <span>REGISTRAR BATALHA</span>
                  </button>
                  <button className="btn-cta-secondary-large" onClick={() => setActiveTab('profile')}>
                    <span className="btn-icon">📊</span>
                    <span>VER MEU PERFIL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <div id="leaderboard" className="page active">
            <div className="section">
              <h2 className="section-title">🏆 RANKING GLOBAL</h2>
              <div className="leaderboard-filters">
                <button className="filter-btn active" onClick={() => { /* filtro global */ }}>🌍 GLOBAL</button>
                <button className="filter-btn" onClick={() => { /* filtro temporada */ }}>📅 TEMPORADA</button>
              </div>
              <div id="leaderboardTable">
                <LeaderboardTable />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div id="history" className="page active">
            <div className="section">
              <h2 className="section-title">📜 HISTÓRICO DE PARTIDAS</h2>
              <div id="matchHistory">
                <MatchHistoryList matches={matchHistory} />
              </div>
            </div>

            {/* Perfil - histórico recente (últimas 10 partidas) visual */}
            <div className="profile-history-section">
              <h3 className="profile-section-title">📜 HISTÓRICO RECENTE (Últimas 10 partidas)</h3>
              <div id="profileMatchHistory" className="profile-matches-list empty-state-centered">Nenhuma partida registrada</div>
            </div>
          </div>
        )}
      </div>

      {/* Legacy Login/Register Modal (migrated from static index.html) */}
      <div className="modal-overlay" id="loginModal">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">ENTRAR / REGISTRAR</h2>
            <button className="modal-close" onClick={() => {
              if (typeof window !== 'undefined' && window.closeLoginModal) return window.closeLoginModal();
              const modal = document.getElementById('loginModal'); if (modal) modal.classList.remove('active');
            }}>×</button>
          </div>
          <form id="loginForm" className="modal-form" onSubmit={(e) => {
            e.preventDefault();
            if (typeof window !== 'undefined' && window.handleLogin) return window.handleLogin(e);
            // fallback: try to trigger submit event for legacy scripts
            const ev = new Event('submit', { bubbles: true, cancelable: true });
            e.target.dispatchEvent(ev);
          }}>
            <div className="form-group">
              <label className="form-label">NOME DE USUARIO</label>
              <input type="text" className="form-input" id="usernameInput" required maxLength={20} />
            </div>
            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input type="email" className="form-input" id="emailInput" required />
            </div>
            <div className="form-group">
              <label className="form-label">SENHA</label>
              <input type="password" className="form-input" id="passwordInput" required minLength={6} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => {
                if (typeof window !== 'undefined' && window.closeLoginModal) return window.closeLoginModal();
                const modal = document.getElementById('loginModal'); if (modal) modal.classList.remove('active');
              }}>CANCELAR</button>
              <button type="submit" className="btn-primary">ENTRAR/REGISTRAR</button>
            </div>
          </form>

          <div style={{textAlign: 'center', margin: '20px 0', color: 'var(--text-secondary)'}}>
            <div style={{display: 'flex', alignItems: 'center', margin: '20px 0'}}>
              <div style={{flex: 1, height: 1, background: 'var(--text-muted)'}}></div>
              <span style={{padding: '0 15px'}}>OU</span>
              <div style={{flex: 1, height: 1, background: 'var(--text-muted)'}}></div>
            </div>
          </div>

          <button onClick={() => { if (typeof window !== 'undefined' && window.loginWithGoogle) window.loginWithGoogle(); }} className="btn-google" style={{width: '100%', padding: 15, background: 'white', color: '#444', border: '2px solid #ddd', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.3s'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" style={{marginRight: 8}}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>
        </div>
      </div>

    </div>
  );
}
