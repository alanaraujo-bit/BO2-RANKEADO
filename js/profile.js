// BO2 RANKED - PROFILE PAGE MANAGEMENT

const ProfileManager = {
    currentFilter: 'all',
    matchesDisplayed: 10,
    matchesPerPage: 10,

    // Render complete profile
    async renderProfile() {
        const profileNotLoggedIn = document.getElementById('profileNotLoggedIn');
        const profileContent = document.getElementById('profileContent');

        if (!RankedData.currentUser) {
            profileNotLoggedIn.style.display = 'flex';
            profileContent.style.display = 'none';
            return;
        }

        profileNotLoggedIn.style.display = 'none';
        profileContent.style.display = 'block';

    // Force refresh to avoid stale cached data in Firebase mode (extra arg is ignored in LocalStorage mode)
    const player = await RankedData.getPlayer(RankedData.currentUser, true);
        if (!player) return;

        // 1️⃣ Update Basic Info
        this.updateBasicInfo(player);

        // 2️⃣ Update Stats
        this.updateStats(player);

        // 3️⃣ Update Match History
        this.updateMatchHistory(player);

        // 4️⃣ Update Achievements
        this.updateAchievements(player);
    },

    // 1️⃣ Update Basic Profile Info
    updateBasicInfo(player) {
        const container = document.getElementById('profileContent');
        const rank = RankSystem.getRank(player.mmr);
        const progress = RankSystem.getRankProgress(player.mmr);

        // Avatar
        container.querySelector('#profileAvatarIcon').textContent = rank.icon;

        // Level (based on total games)
        const level = Math.floor(player.gamesPlayed / 10) + 1;
    container.querySelector('#profileLevel').textContent = level;

        // Name and ID
    container.querySelector('#profileName').textContent = player.username;
    container.querySelector('#profileId').textContent = `#${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        // Rank
    container.querySelector('#profileRankIcon').textContent = rank.icon;
    container.querySelector('#profileRankName').textContent = rank.name;

        // MMR
    container.querySelector('#profileMMR').textContent = player.mmr;

        // Progress Bar
    const progressSection = container.querySelector('#rankProgressSection');
    const maxRankMessage = container.querySelector('#maxRankMessage');

        if (progress.next) {
            progressSection.style.display = 'block';
            maxRankMessage.style.display = 'none';

            container.querySelector('#nextRankName').textContent = progress.next.name;
            container.querySelector('#mmrNeeded').textContent = progress.mmrNeeded;
            container.querySelector('#progressPercentage').textContent = progress.progress + '%';
            container.querySelector('#progressBarFill').style.width = progress.progress + '%';
            // Use correct properties from RankSystem (min/max)
            container.querySelector('#currentRankMMR').textContent = (typeof rank.min !== 'undefined' ? rank.min : 0) + ' MMR';
            container.querySelector('#nextRankMMR').textContent = (typeof progress.next.min !== 'undefined' ? progress.next.min : 0) + ' MMR';
        } else {
            progressSection.style.display = 'none';
            maxRankMessage.style.display = 'flex';
        }
    },

    // 2️⃣ Update Stats
    updateStats(player) {
        // Escopo do perfil para evitar conflito com IDs iguais em outras páginas (ex.: Home)
        const container = document.getElementById('profileContent');
        // Helper para setar texto com segurança, priorizando busca dentro do container do perfil
        const setText = (id, value) => {
            let el = null;
            if (container) {
                el = container.querySelector(`#${id}`);
            }
            if (!el) {
                el = document.getElementById(id);
            }
            if (el) el.textContent = value;
        };
        // Fallback: se os contadores ainda não refletirem o histórico, recalcular a partir de matchHistory
        const hist = Array.isArray(player.matchHistory) ? player.matchHistory : [];
        let wins = player.wins || 0;
        let losses = player.losses || 0;
        let totalKills = player.totalKills || 0;
        let totalDeaths = player.totalDeaths || 0;
        let gamesPlayed = player.gamesPlayed || 0;

        const computed = hist.reduce((acc, m) => {
            if (m.result === 'win') acc.wins++;
            if (m.result === 'loss') acc.losses++;
            acc.kills += Number(m.kills) || 0;
            acc.deaths += Number(m.deaths) || 0;
            acc.games++;
            return acc;
        }, { wins: 0, losses: 0, kills: 0, deaths: 0, games: 0 });

        const countersLookEmpty = (wins + losses + gamesPlayed + totalKills + totalDeaths) === 0 && computed.games > 0;
        const countersInconsistent = computed.games > 0 && (gamesPlayed < computed.games || wins + losses < computed.games);

        if (countersLookEmpty || countersInconsistent) {
            wins = computed.wins;
            losses = computed.losses;
            totalKills = computed.kills;
            totalDeaths = computed.deaths;
            gamesPlayed = computed.games;

            // Persistir de forma assíncrona sem bloquear UI
            const updated = {
                ...player,
                wins,
                losses,
                totalKills,
                totalDeaths,
                gamesPlayed
            };
            if (typeof RankedData.updatePlayer === 'function') {
                Promise.resolve(RankedData.updatePlayer(player.username, updated)).catch(console.error);
            }
        }

        const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(0) : '0';
        const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);

    setText('statTotalGames', gamesPlayed);
    setText('statWins', wins);
    setText('statLosses', losses);
    setText('statWinRate', winRate + '%');
    setText('statTotalKills', totalKills);
    setText('statTotalDeaths', totalDeaths);
    setText('statKD', kd);
    setText('statBestStreak', player.bestStreak || 0);
    setText('statCurrentStreak', player.winStreak || 0);

        // Atualizar também o bloco de "Quick Stats" do topo do perfil, se existir
    setText('heroWins', wins);
    setText('heroLosses', losses);
    setText('heroKD', kd);

        // Atualizar nível baseado em total de partidas (1 a cada 10 jogos)
        const level = Math.floor(gamesPlayed / 10) + 1;
        setText('profileLevel', level);
    },

    // 3️⃣ Update Match History
    updateMatchHistory(player) {
        const matchesList = document.getElementById('profileMatchesList');
        
        if (!player.matchHistory || player.matchHistory.length === 0) {
            matchesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎮</div>
                    <p class="empty-text">Nenhuma partida jogada ainda</p>
                    <p class="empty-subtext">Registre sua primeira partida para ver seu histórico aqui</p>
                    <button class="btn-empty-action" onclick="showPage('play')">Jogar Agora</button>
                </div>
            `;
            return;
        }

        const matches = [...player.matchHistory].reverse();
        const filteredMatches = this.filterMatches(matches);
        const displayMatches = filteredMatches.slice(0, this.matchesDisplayed);

        matchesList.innerHTML = displayMatches.map(match => {
            const isWin = match.result === 'win';
            const kd = match.deaths > 0 ? (match.kills / match.deaths).toFixed(2) : match.kills.toFixed(2);
            const mmrChange = match.mmrChange || 0;
            const date = new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

            return `
                <div class="match-card">
                    <div class="match-result-icon">${isWin ? '✅' : '❌'}</div>
                    <div class="match-info">
                        <div class="match-opponent">vs ${match.opponent}</div>
                        <div class="match-details">${match.map} • ${match.gameMode} • ${date}</div>
                    </div>
                    <div class="match-stats">
                        <div class="match-stat">
                            <div class="match-stat-label">K/D</div>
                            <div class="match-stat-value">${kd}</div>
                        </div>
                        <div class="match-stat">
                            <div class="match-stat-label">KILLS</div>
                            <div class="match-stat-value">${match.kills}</div>
                        </div>
                        <div class="match-stat">
                            <div class="match-stat-label">DEATHS</div>
                            <div class="match-stat-value">${match.deaths}</div>
                        </div>
                    </div>
                    <div class="match-mmr-change ${mmrChange >= 0 ? 'positive' : 'negative'}">
                        ${mmrChange >= 0 ? '+' : ''}${mmrChange}
                    </div>
                </div>
            `;
        }).join('');

        // Show/hide "Load More" button
        const viewMoreBtn = document.getElementById('viewMoreMatches');
        if (filteredMatches.length > this.matchesDisplayed) {
            viewMoreBtn.style.display = 'block';
        } else {
            viewMoreBtn.style.display = 'none';
        }
    },

    // Filter matches
    filterMatches(matches) {
        let filtered = matches;

        // Filter by result
        if (this.currentFilter === 'win') {
            filtered = filtered.filter(m => m.result === 'win');
        } else if (this.currentFilter === 'loss') {
            filtered = filtered.filter(m => m.result === 'loss');
        }

        // Filter by map
        const mapFilter = document.getElementById('mapFilter');
        if (mapFilter && mapFilter.value !== 'all') {
            filtered = filtered.filter(m => m.map === mapFilter.value);
        }

        // Filter by game mode
        const gameModeFilter = document.getElementById('gameModeFilter');
        if (gameModeFilter && gameModeFilter.value !== 'all') {
            filtered = filtered.filter(m => m.gameMode === gameModeFilter.value);
        }

        return filtered;
    },

    // 4️⃣ Update Achievements
    updateAchievements(player) {
        const achievementsGrid = document.getElementById('achievementsGrid');

        const achievements = [
            {
                icon: '🎯',
                name: 'Primeira Vitória',
                description: 'Ganhe sua primeira partida ranqueada',
                unlocked: player.wins >= 1,
                progress: player.wins >= 1 ? 'Conquistado!' : '0/1'
            },
            {
                icon: '🔥',
                name: 'Sequência Quente',
                description: 'Ganhe 5 partidas seguidas',
                unlocked: player.bestStreak >= 5,
                progress: player.bestStreak >= 5 ? 'Conquistado!' : `${player.bestStreak}/5`
            },
            {
                icon: '💯',
                name: 'Centurião',
                description: 'Alcance 100 kills totais',
                unlocked: player.totalKills >= 100,
                progress: player.totalKills >= 100 ? 'Conquistado!' : `${player.totalKills}/100`
            },
            {
                icon: '🏆',
                name: 'Vencedor',
                description: 'Ganhe 10 partidas',
                unlocked: player.wins >= 10,
                progress: player.wins >= 10 ? 'Conquistado!' : `${player.wins}/10`
            },
            {
                icon: '⚔️',
                name: 'Guerreiro',
                description: 'Jogue 50 partidas ranqueadas',
                unlocked: player.gamesPlayed >= 50,
                progress: player.gamesPlayed >= 50 ? 'Conquistado!' : `${player.gamesPlayed}/50`
            },
            {
                icon: '💎',
                name: 'Diamante',
                description: 'Alcance o rank Diamante',
                unlocked: player.mmr >= 2500,
                progress: player.mmr >= 2500 ? 'Conquistado!' : `${player.mmr}/2500 MMR`
            },
            {
                icon: '👑',
                name: 'Mestre',
                description: 'Alcance o rank Mestre',
                unlocked: player.mmr >= 3000,
                progress: player.mmr >= 3000 ? 'Conquistado!' : `${player.mmr}/3000 MMR`
            },
            {
                icon: '⚡',
                name: 'Lenda',
                description: 'Alcance o rank Lenda',
                unlocked: player.mmr >= 3500,
                progress: player.mmr >= 3500 ? 'Conquistado!' : `${player.mmr}/3500 MMR`
            },
            {
                icon: '🎮',
                name: 'Dedicado',
                description: 'Jogue 100 partidas ranqueadas',
                unlocked: player.gamesPlayed >= 100,
                progress: player.gamesPlayed >= 100 ? 'Conquistado!' : `${player.gamesPlayed}/100`
            },
            {
                icon: '🌟',
                name: 'Elite',
                description: 'Mantenha 70% de win rate (mín. 20 partidas)',
                unlocked: player.gamesPlayed >= 20 && (player.wins / player.gamesPlayed) >= 0.7,
                progress: player.gamesPlayed >= 20 ? `${((player.wins / player.gamesPlayed) * 100).toFixed(0)}%` : `${player.gamesPlayed}/20 partidas`
            },
            {
                icon: '🔫',
                name: 'Assassino',
                description: 'Alcance K/D de 2.0 (mín. 20 partidas)',
                unlocked: player.gamesPlayed >= 20 && (player.totalKills / player.totalDeaths) >= 2.0,
                progress: player.totalDeaths > 0 ? `${(player.totalKills / player.totalDeaths).toFixed(2)} K/D` : '0 K/D'
            },
            {
                icon: '💪',
                name: 'Imparável',
                description: 'Ganhe 10 partidas seguidas',
                unlocked: player.bestStreak >= 10,
                progress: player.bestStreak >= 10 ? 'Conquistado!' : `${player.bestStreak}/10`
            }
        ];

        achievementsGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? '' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">${achievement.progress}</div>
                ${achievement.unlocked ? '<div class="achievement-unlocked-date">✓ Desbloqueado</div>' : ''}
            </div>
        `).join('');
    }
};

// Global functions for filters
function filterMatches(type) {
    ProfileManager.currentFilter = type;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === type) {
            btn.classList.add('active');
        }
    });

    // Re-render matches
    RankedData.getPlayer(RankedData.currentUser).then(player => {
        if (player) ProfileManager.updateMatchHistory(player);
    });
}

function filterByMap() {
    RankedData.getPlayer(RankedData.currentUser).then(player => {
        if (player) ProfileManager.updateMatchHistory(player);
    });
}

function filterByGameMode() {
    RankedData.getPlayer(RankedData.currentUser).then(player => {
        if (player) ProfileManager.updateMatchHistory(player);
    });
}

function loadMoreMatches() {
    ProfileManager.matchesDisplayed += ProfileManager.matchesPerPage;
    RankedData.getPlayer(RankedData.currentUser).then(player => {
        if (player) ProfileManager.updateMatchHistory(player);
    });
}
