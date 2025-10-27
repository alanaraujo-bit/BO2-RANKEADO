
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
                <div className="empty-state">
                  <div className="empty-icon">🎮</div>
                  <p className="empty-text">Nenhuma batalha registrada</p>
                  <p className="empty-subtext">Faça login e registre seu primeiro combate para ver seu histórico aqui</p>
                  <button className="btn-empty-action" onClick={() => setActiveTab('play')}>Entrar em Combate</button>
                </div>
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
                  {/* Will be populated by JS */}
                </div>
              </div>
              <div className="top-players-list" id="topPlayersPreview">
                {/* Will be populated by JS */}
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
                    <select className="field-input-bo2" required>
                      <option value="">Selecione o oponente...</option>
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
