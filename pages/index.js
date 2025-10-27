import Head from 'next/head';

export default function Home() {
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
            <li><a href="#home" className="nav-link active">🏠 HOME</a></li>
            <li><a href="#play" className="nav-link">🎮 JOGAR</a></li>
            <li><a href="#profile" className="nav-link">👤 PERFIL</a></li>
            <li><a href="#friends" className="nav-link">👥 AMIGOS</a></li>
            <li><a href="#seasons" className="nav-link">🏆 TEMPORADAS</a></li>
            <li><a href="#ranks" className="nav-link">🎖️ RANKS</a></li>
            <li><a href="#leaderboard" className="nav-link">🏆 RANKING</a></li>
            <li><a href="#history" className="nav-link">📜 HISTÓRICO</a></li>
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
              {/* Player Current Rank (if logged in) */}
              <div className="hero-player-card" id="heroPlayerCard" style={{display: 'none'}}>
                <div className="player-rank-display">
                  <div className="rank-icon-large" id="heroRankIcon">🥉</div>
                  <div className="rank-info">
                    <div className="rank-label">SUA PATENTE ATUAL</div>
                    <div className="rank-name-large" id="heroRankName">BRONZE</div>
                    <div className="rank-mmr-display">
                      <span className="mmr-value" id="heroMMR">0</span>
                      <span className="mmr-label">MMR</span>
                    </div>
                  </div>
                </div>
                <div className="player-quick-stats">
                  <div className="quick-stat">
                    <span className="stat-label">V/D</span>
                    <span className="stat-value" id="heroWinRate">0%</span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-label">K/D</span>
                    <span className="stat-value" id="heroKD">0.00</span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-label">BATALHAS</span>
                    <span className="stat-value" id="heroMatches">0</span>
                  </div>
                </div>
              </div>
              <div className="hero-actions">
                <button className="btn-hero-primary">
                  <span className="btn-icon">🎮</span>
                  <span className="btn-text">REGISTRAR BATALHA</span>
                </button>
                <button className="btn-hero-secondary">
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
        </div>
      </div>
    </>
  );
}
