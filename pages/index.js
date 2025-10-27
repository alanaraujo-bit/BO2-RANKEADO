
import Head from 'next/head';
import { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState('home');

  return (
    <>
      <Head>
        <title>BO2 Plutonium Ranked System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhana:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="particles" id="particles"></div>
      <nav className="navbar">
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
            <button className="btn-login" id="btnLogin">LOGIN</button>
          </div>
        </div>
      </nav>
      <div className="notifications-dropdown" id="notificationsDropdown">
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
      <div className="main-container">
        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <div id="home" className="page active">
            {/* ...existing code... */}
            <div className="hero-banner hero-improved">
              {/* ...existing code... */}
            </div>
            <div className="how-it-works-section section-card">
              {/* ...existing code... */}
            </div>
          </div>
        )}
        {/* Outras páginas (exemplo) */}
        {activeTab === 'play' && (
          <div id="play" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página JOGAR (em construção)</h2>
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div id="profile" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página PERFIL (em construção)</h2>
            </div>
          </div>
        )}
        {activeTab === 'friends' && (
          <div id="friends" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página AMIGOS (em construção)</h2>
            </div>
          </div>
        )}
        {activeTab === 'seasons' && (
          <div id="seasons" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página TEMPORADAS (em construção)</h2>
            </div>
          </div>
        )}
        {activeTab === 'ranks' && (
          <div id="ranks" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página RANKS (em construção)</h2>
            </div>
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <div id="leaderboard" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página RANKING (em construção)</h2>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div id="history" className="page active">
            <div className="hero-banner hero-improved">
              <h2 style={{color: '#fff'}}>Página HISTÓRICO (em construção)</h2>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
