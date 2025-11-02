// BO2 RANKED - PROFILE PAGE MANAGEMENT

// Expose renderProfile to window for UI.js to call
window.renderProfile = async function() {
    if (typeof ProfileManager !== 'undefined' && ProfileManager.renderProfile) {
        await ProfileManager.renderProfile();
    }
};

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

        // 5️⃣ Update Plutonium Name Section
        if (window.updateProfilePlutoniumSection) {
            window.updateProfilePlutoniumSection();
        }
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

        // Name and ID (use sequential playerNumber)
        container.querySelector('#profileName').textContent = player.username;
        const idStr = (typeof player.playerNumberStr === 'string' && player.playerNumberStr)
            ? player.playerNumberStr
            : (typeof player.playerNumber === 'number' && player.playerNumber > 0
                ? String(player.playerNumber).padStart(2, '0')
                : '00');
        container.querySelector('#profileId').textContent = `#${idStr}`;

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

// ============================================================================
// WEAPONS & ARSENAL SECTION
// ============================================================================

ProfileManager.weaponsFilter = 'all';

ProfileManager.filterWeapons = function(type) {
    this.weaponsFilter = type;
    
    // Update active button
    document.querySelectorAll('.weapons-filters-profile .filter-btn-profile').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === type) {
            btn.classList.add('active');
        }
    });

    // Re-render weapons
    RankedData.getPlayer(RankedData.currentUser, true).then(player => {
        if (player) this.updateWeaponsSection(player);
    });
};

ProfileManager.updateWeaponsSection = async function(player) {
    const weaponsList = document.getElementById('profileWeaponsList');
    const emptyState = document.getElementById('weaponsEmptyState');
    
    if (!weaponsList) return;

    // Get weapons data from player stats
    const weapons = player.weaponsUsed || {};
    const weaponsArray = Object.entries(weapons).map(([name, stats]) => ({
        name,
        kills: stats.kills || 0,
        headshots: stats.headshots || 0,
        damage: stats.damage || 0,
        ...stats
    })).filter(w => w.kills > 0);

    if (weaponsArray.length === 0) {
        weaponsList.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Sort by kills
    weaponsArray.sort((a, b) => b.kills - a.kills);

    // Filter by type
    let filteredWeapons = weaponsArray;
    if (this.weaponsFilter !== 'all') {
        filteredWeapons = weaponsArray.filter(w => this.getWeaponType(w.name) === this.weaponsFilter);
    }

    // Render weapon cards
    weaponsList.innerHTML = filteredWeapons.map((weapon, index) => {
        const headshotRate = weapon.kills > 0 ? ((weapon.headshots / weapon.kills) * 100).toFixed(1) : '0';
        const avgDamage = weapon.kills > 0 ? (weapon.damage / weapon.kills).toFixed(0) : '0';
        const icon = this.getWeaponIcon(weapon.name);
        const type = this.getWeaponType(weapon.name);
        const progress = Math.min(100, (weapon.kills / 100) * 100); // Progress to 100 kills

        return `
            <div class="weapon-card-profile" style="animation-delay: ${index * 0.1}s">
                <div class="weapon-card-header-profile">
                    <span class="weapon-icon-profile">${icon}</span>
                    <div class="weapon-info-profile">
                        <h4>${weapon.name}</h4>
                        <span class="weapon-type-profile">${type}</span>
                    </div>
                </div>
                <div class="weapon-stats-profile">
                    <div class="weapon-stat-item-profile">
                        <span class="weapon-stat-label-profile">Kills</span>
                        <span class="weapon-stat-value-profile">${weapon.kills}</span>
                    </div>
                    <div class="weapon-stat-item-profile">
                        <span class="weapon-stat-label-profile">Headshots</span>
                        <span class="weapon-stat-value-profile">${weapon.headshots}</span>
                    </div>
                    <div class="weapon-stat-item-profile">
                        <span class="weapon-stat-label-profile">HS Rate</span>
                        <span class="weapon-stat-value-profile">${headshotRate}%</span>
                    </div>
                    <div class="weapon-stat-item-profile">
                        <span class="weapon-stat-label-profile">Avg Dmg</span>
                        <span class="weapon-stat-value-profile">${avgDamage}</span>
                    </div>
                </div>
                <div class="weapon-progress-profile">
                    <div class="weapon-progress-label-profile">
                        <span>Progresso</span>
                        <span>${weapon.kills}/100</span>
                    </div>
                    <div class="weapon-progress-bar-profile">
                        <div class="weapon-progress-fill-profile" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

ProfileManager.getWeaponIcon = function(weaponName) {
    const name = weaponName.toLowerCase();
    if (name.includes('sniper') || name.includes('dsr') || name.includes('ballista')) return '🎯';
    if (name.includes('ar') || name.includes('assault') || name.includes('m8') || name.includes('an94')) return '🔫';
    if (name.includes('smg') || name.includes('skorpion') || name.includes('pdw')) return '💨';
    if (name.includes('lmg') || name.includes('lsat')) return '⚡';
    if (name.includes('shotgun') || name.includes('r870')) return '💥';
    if (name.includes('pistol') || name.includes('tac45')) return '🔪';
    if (name.includes('knife') || name.includes('combat')) return '🗡️';
    if (name.includes('grenade') || name.includes('lethal')) return '💣';
    return '🔫';
};

ProfileManager.getWeaponType = function(weaponName) {
    const name = weaponName.toLowerCase();
    if (name.includes('sniper') || name.includes('dsr') || name.includes('ballista')) return 'primary';
    if (name.includes('ar') || name.includes('assault') || name.includes('m8') || name.includes('an94')) return 'primary';
    if (name.includes('smg') || name.includes('skorpion') || name.includes('pdw')) return 'primary';
    if (name.includes('lmg') || name.includes('lsat')) return 'primary';
    if (name.includes('shotgun') || name.includes('r870')) return 'primary';
    if (name.includes('pistol') || name.includes('tac45')) return 'secondary';
    if (name.includes('knife') || name.includes('combat')) return 'secondary';
    if (name.includes('grenade') || name.includes('lethal')) return 'special';
    return 'primary';
};

// ============================================================================
// PERFORMANCE & ANALYTICS SECTION
// ============================================================================

ProfileManager.updatePerformanceSection = function(player) {
    // Calculate advanced metrics
    const totalKills = player.totalKills || 0;
    const totalDeaths = player.totalDeaths || 0;
    const gamesPlayed = player.gamesPlayed || 0;
    const headshots = player.totalHeadshots || 0;
    const assists = player.totalAssists || 0;
    const damage = player.totalDamage || 0;
    
    // Accuracy metrics
    const headshotRate = totalKills > 0 ? ((headshots / totalKills) * 100).toFixed(1) : '0';
    const accuracy = player.accuracy || '0';
    
    // Combat metrics
    const avgDamage = gamesPlayed > 0 ? (damage / gamesPlayed).toFixed(0) : '0';
    
    // Survival metrics
    const avgDeaths = gamesPlayed > 0 ? (totalDeaths / gamesPlayed).toFixed(1) : '0';
    const avgLifetime = player.avgLifetime || '0';
    const revengeRate = player.revengeRate || '0';
    
    // Consistency metrics
    const currentStreak = player.winStreak || 0;
    const bestStreak = player.bestStreak || 0;

    // Update DOM elements
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    // Accuracy
    setText('statHeadshots', headshots);
    setText('statHeadshotRate', headshotRate + '%');
    setText('statAccuracy', accuracy + '%');
    
    // Combat
    setText('statAssists', assists);
    setText('statTotalDamage', damage);
    setText('statAvgDamage', avgDamage);
    
    // Survival
    setText('statAvgDeaths', avgDeaths);
    setText('statAvgLifetime', avgLifetime + 's');
    setText('statRevengeRate', revengeRate + '%');
    
    // Consistency
    setText('statCurrentStreak', currentStreak);
    setText('statBestStreakPerf', bestStreak);
    setText('statTotalGamesPerf', gamesPlayed);

    // Update progress bars
    const setProgressBar = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.style.width = Math.min(100, value) + '%';
    };

    setProgressBar('accuracyBarFill', parseFloat(headshotRate));
    setProgressBar('combatBarFill', Math.min(100, avgDamage / 50)); // Assuming 5000 is max avg damage
    setProgressBar('survivalBarFill', Math.max(0, 100 - (parseFloat(avgDeaths) * 10))); // Inverse deaths
    setProgressBar('streakBarFill', Math.min(100, (currentStreak / 10) * 100)); // Progress to 10 streak

    // Update hit heatmap
    this.updateHitHeatmap(player);

    // Update K/D chart
    this.updateKDChart(player);
};

ProfileManager.updateHitHeatmap = function(player) {
    const hitLocations = player.hitLocations || {};
    
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
            const countEl = el.querySelector('.hit-count');
            if (countEl) countEl.textContent = value;
        }
    };

    setText('heatmapHead', hitLocations.head || 0);
    setText('heatmapTorso', hitLocations.torso || 0);
    setText('heatmapArms', hitLocations.arms || 0);
    setText('heatmapLegs', hitLocations.legs || 0);
};

ProfileManager.updateKDChart = function(player) {
    const chartBody = document.getElementById('kdChart');
    if (!chartBody) return;

    const matches = (player.matchHistory || []).slice(-10).reverse();
    
    if (matches.length === 0) {
        chartBody.innerHTML = '<div style="text-align: center; color: var(--neutral-400); padding: 40px;">Nenhuma partida para exibir</div>';
        return;
    }

    const maxKD = Math.max(...matches.map(m => {
        const kd = m.deaths > 0 ? m.kills / m.deaths : m.kills;
        return kd;
    }), 3); // Min max of 3

    chartBody.innerHTML = matches.map((match, index) => {
        const kd = match.deaths > 0 ? (match.kills / match.deaths).toFixed(2) : match.kills.toFixed(2);
        const height = ((parseFloat(kd) / maxKD) * 100).toFixed(1);
        const isPositive = parseFloat(kd) >= 1;

        return `
            <div class="chart-bar ${isPositive ? 'positive' : 'negative'}" style="height: ${height}%">
                <span class="chart-bar-value">${kd}</span>
            </div>
        `;
    }).join('');
};

// ===============================================================================
// RIVALS & NEMESIS SECTION
// ===============================================================================

ProfileManager.updateRivalsSection = function(player) {
    // Get victims and killedBy data
    const victims = player.victims || {};
    const killedBy = player.killedBy || {};
    
    // Find top rival (quem você mais matou)
    let topRival = null;
    let topRivalKills = 0;
    for (const [name, kills] of Object.entries(victims)) {
        if (kills > topRivalKills) {
            topRivalKills = kills;
            topRival = name;
        }
    }
    
    // Find top nemesis (quem mais te matou)
    let topNemesis = null;
    let topNemesisDeaths = 0;
    for (const [name, deaths] of Object.entries(killedBy)) {
        if (deaths > topNemesisDeaths) {
            topNemesisDeaths = deaths;
            topNemesis = name;
        }
    }
    
    // Update Rival Card
    if (topRival) {
        const rivalInfo = document.querySelector('#rivalPlayerInfo .rival-player-name');
        const rivalKills = document.getElementById('rivalKills');
        const rivalDominanceBar = document.getElementById('rivalDominanceBar');
        const rivalDominance = document.getElementById('rivalDominance');
        
        if (rivalInfo) rivalInfo.textContent = topRival;
        if (rivalKills) rivalKills.textContent = topRivalKills;
        
        // Calculate dominance (percentage vs total interactions)
        const totalDeaths = killedBy[topRival] || 0;
        const totalInteractions = topRivalKills + totalDeaths;
        const dominancePercent = totalInteractions > 0 ? ((topRivalKills / totalInteractions) * 100).toFixed(0) : 0;
        
        if (rivalDominanceBar) rivalDominanceBar.style.width = dominancePercent + '%';
        if (rivalDominance) rivalDominance.textContent = dominancePercent + '%';
    }
    
    // Update Nemesis Card
    if (topNemesis) {
        const nemesisInfo = document.querySelector('#nemesisPlayerInfo .rival-player-name');
        const nemesisDeaths = document.getElementById('nemesisDeaths');
        const nemesisDominanceBar = document.getElementById('nemesisDominanceBar');
        const nemesisDominance = document.getElementById('nemesisDominance');
        
        if (nemesisInfo) nemesisInfo.textContent = topNemesis;
        if (nemesisDeaths) nemesisDeaths.textContent = topNemesisDeaths;
        
        // Calculate dominance (percentage vs total interactions)
        const totalKills = victims[topNemesis] || 0;
        const totalInteractions = topNemesisDeaths + totalKills;
        const dominancePercent = totalInteractions > 0 ? ((topNemesisDeaths / totalInteractions) * 100).toFixed(0) : 0;
        
        if (nemesisDominanceBar) nemesisDominanceBar.style.width = dominancePercent + '%';
        if (nemesisDominance) nemesisDominance.textContent = dominancePercent + '%';
    }
    
    // Update Top 5 Victims List
    const topVictimsList = document.getElementById('topVictimsList');
    if (topVictimsList) {
        const sortedVictims = Object.entries(victims)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (sortedVictims.length === 0) {
            topVictimsList.innerHTML = '<div style="text-align: center; color: var(--neutral-400); padding: 20px;">Nenhum dado ainda</div>';
        } else {
            topVictimsList.innerHTML = sortedVictims.map(([name, kills], index) => `
                <div class="rival-list-item">
                    <div class="rival-list-item-info">
                        <span class="rival-list-position">#${index + 1}</span>
                        <span class="rival-list-name">${name}</span>
                    </div>
                    <span class="rival-list-count">${kills}</span>
                </div>
            `).join('');
        }
    }
    
    // Update Top 5 Killers List
    const topKillersList = document.getElementById('topKillersList');
    if (topKillersList) {
        const sortedKillers = Object.entries(killedBy)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (sortedKillers.length === 0) {
            topKillersList.innerHTML = '<div style="text-align: center; color: var(--neutral-400); padding: 20px;">Nenhum dado ainda</div>';
        } else {
            topKillersList.innerHTML = sortedKillers.map(([name, deaths], index) => `
                <div class="rival-list-item">
                    <div class="rival-list-item-info">
                        <span class="rival-list-position">#${index + 1}</span>
                        <span class="rival-list-name">${name}</span>
                    </div>
                    <span class="rival-list-count">${deaths}</span>
                </div>
            `).join('');
        }
    }
};

// Update main renderProfile to include new sections
const originalRenderProfile = ProfileManager.renderProfile;
ProfileManager.renderProfile = async function() {
    await originalRenderProfile.call(this);
    
    if (!RankedData.currentUser) return;
    
    const player = await RankedData.getPlayer(RankedData.currentUser, true);
    if (!player) return;

    // Update new sections
    this.updateRivalsSection(player);
    this.updateWeaponsSection(player);
    this.updatePerformanceSection(player);
};
