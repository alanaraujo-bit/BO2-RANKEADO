// Lightweight compatibility shim for legacy main.js
// Deploy trigger: Força novo deploy Vercel em 28/10/2025
// Atualização forçada em 28/10/2025 para commit/push
// Purpose: avoid parse errors and provide minimal functions expected by legacy HTML.

// ...existing code...
// Remove all duplicate blocks below and keep only one copy of each function, event listener, and global definition.
// The file should start with the IIFE wrapper and end with its closing.

(function(window){
    // If the real main.js already loaded, do nothing
    if (window.__BO2_MAIN_LOADED__) return;
    window.__BO2_MAIN_LOADED__ = true;

    // Minimal RankedData stub (if real RankedData exists, we keep it)
    if (typeof window.RankedData === 'undefined') {
        window.RankedData = {
            currentUser: null,
            currentUserId: null,
            players: {},
            init: async function(){ return true; },
}
})(window);

// BO2 RANKED - MAIN APPLICATION

// Global wrapper functions for compatibility between Firebase and LocalStorage
async function getUserData(username) {
    try {
        return await RankedData.getPlayer(username);
}
}
        preview.innerHTML = '';
    }
}

// Update user display in navbar
function updateUserDisplay() {
    const userNameEl = document.getElementById('currentUserName');
    const btnLogin = document.getElementById('btnLogin');
    
    if (RankedData.currentUser) {
        const player = RankedData.getPlayer(RankedData.currentUser);
        if (player) {
            const rank = RankSystem.getRank(player.mmr);
            userNameEl.textContent = `${rank.icon} ${RankedData.currentUser}`;
            userNameEl.style.cursor = 'pointer';
            userNameEl.onclick = () => showPage('profile');
        }
        btnLogin.textContent = 'SAIR';
        btnLogin.onclick = logout;
        
        // Update notifications
        updateNotifications();
        
        // Update hero section when user logs in
        UI.updateHeroSection();
        UI.updateRecentMatches();
    } else {
        userNameEl.textContent = 'Visitante';
        userNameEl.style.cursor = 'default';
        userNameEl.onclick = null;
        btnLogin.textContent = 'LOGIN';
        btnLogin.onclick = showLoginModal;
        
        // Hide notification bell
        const bell = document.getElementById('notificationBell');
        if (bell) bell.style.display = 'none';
        
        // Reset hero section
        UI.updateHeroSection();
        UI.updateRecentMatches();
    }
}

// Logout
async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        await RankedData.logout();
        updateUserDisplay();
        showPage('home');
        await UI.updateAllViews();
        UI.showNotification('Ate logo!', 'info');
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('usernameInput').focus();
        
        // Adicionar texto terminal ao modal
        addTerminalEffect();
    }
}

// Adicionar efeito terminal ao modal de login
function addTerminalEffect() {
    const modalForm = document.querySelector('#loginModal .modal-form');
    
    // Verificar se já tem o texto terminal
    if (!modalForm.querySelector('.terminal-text')) {
        const terminalText = document.createElement('div');
        terminalText.className = 'terminal-text';
        terminalText.innerHTML = `
            SYSTEM INITIALIZING...<br>
            PLUTONIUM RANKED NETWORK v2.0<br>
            ENTER CREDENTIALS TO ACCESS<br>
            <span class="terminal-cursor"></span>
        `;
        
        // Inserir antes do formulário
        const formGroup = modalForm.querySelector('.form-group');
        modalForm.insertBefore(terminalText, formGroup);
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('loginForm').reset();
    }
}

// Mostrar "ACCESS GRANTED" ao fazer login com sucesso
function showAccessGranted() {
    const accessGranted = document.getElementById('accessGranted');
    if (accessGranted) {
        accessGranted.classList.add('active');
        
        // Remover após 1.5s
        setTimeout(() => {
            accessGranted.classList.remove('active');
        }, 1500);
    }
}


// Close confirm modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ...existing code...

// Show page (called from HTML) - Make it explicitly global
window.showPage = function(pageId) {
    UI.showPage(pageId);
};

// Also expose as regular function
function showPage(pageId) {
    UI.showPage(pageId);
}

// Filter leaderboard (called from HTML)
async function filterLeaderboard(type) {
    await UI.renderLeaderboard(type);
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modals
    if (event.key === 'Escape') {
        closeLoginModal();
        closeConfirmModal();
    }
});

// Dev tools (remove in production)
window.devTools = {
    reset: () => RankedData.reset(),
    addTestPlayers: async () => {
        const testPlayers = ['Gabriel', 'Alan', 'Filipe', 'Pedro', 'Lucas'];
        testPlayers.forEach(name => {
            if (!RankedData.getPlayer(name)) {
                RankedData.createPlayer(name);
                const player = RankedData.getPlayer(name);
                // Keep player MMR stable (do not randomize) to maintain clear progression from 999 upwards
                player.mmr = player.mmr || 999;
                player.wins = Math.floor(Math.random() * 20);
                player.losses = Math.floor(Math.random() * 20);
                player.totalKills = Math.floor(Math.random() * 500);
                player.totalDeaths = Math.floor(Math.random() * 500);
                player.gamesPlayed = player.wins + player.losses;
                player.rank = RankSystem.getRank(player.mmr).name;
                RankedData.updatePlayer(name, player);
            }
        });
        RankedData.save();
        await UI.updateAllViews();
        console.log('Test players added');
    },
    getData: () => {
        console.log('Current Data:', {
            currentUser: RankedData.currentUser,
            players: RankedData.players,
            matches: RankedData.matches,
            pending: RankedData.pendingConfirmations
        });
    }
};

console.log('Dev Tools available: window.devTools');
console.log('   - devTools.reset() - Reset all data');
console.log('   - devTools.addTestPlayers() - Add test players');
console.log('   - devTools.getData() - View current data');

// ===== NOTIFICATION SYSTEM =====

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('active');
    
    if (dropdown.classList.contains('active')) {
        updateNotifications();
    }
}

async function updateNotifications() {
    const content = document.getElementById('notificationsContent');
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');
    
    if (!RankedData.currentUser) {
        bell.style.display = 'none';
        return;
    }
    
    const pending = await MatchSystem.getPendingMatches();
    
    if (pending.length === 0) {
        bell.style.display = 'none';
        content.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 20px;">
                Nenhuma notificação
            </p>
        `;
        return;
    }
    
    // Show bell with badge
    bell.style.display = 'block';
    badge.textContent = pending.length;
    
    // Render notifications
    content.innerHTML = pending.map(p => {
        const match = p.matchData;
        const isWinner = match.winner === RankedData.currentUser;
        const resultText = isWinner ? '🏆 VOCÊ VENCEU' : '💀 VOCÊ PERDEU';
        const resultColor = isWinner ? 'var(--success)' : 'var(--error)';
        const kdRatio = (match.kills / Math.max(1, match.deaths)).toFixed(2);
        const opponentName = p.reporter;
        
        // Calculate estimated MMR change
        const estimatedChange = isWinner ? '+25 a +35 MMR' : '-20 a -30 MMR';
        const changeColor = isWinner ? 'var(--success)' : 'var(--error)';
        
        return `
}
}

async function confirmMatchNotification(matchId, confirm) {
    console.log('confirmMatchNotification called:', { matchId, confirm });
    
    try {
        const success = await MatchSystem.confirmMatch(matchId, confirm);
        console.log('confirmMatch result:', success);
        
        if (success || !confirm) {
            await updateNotifications();
            await UI.updateAllViews();
        }
    } catch (error) {
        console.error('Error in confirmMatchNotification:', error);
        UI.showNotification('Erro ao processar confirmação: ' + error.message, 'error');
    }
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora mesmo';
}
}

// Global function to open player profile (works with both Firebase and LocalStorage)
async function openPlayerProfile(username) {
    try {
        // Check if friendsSystem is available (LocalStorage mode)
        if (typeof friendsSystem !== 'undefined' && friendsSystem.openPlayerProfile) {
            await friendsSystem.openPlayerProfile(username);
            return;
        }
        
        // Fallback: Open profile modal manually (Firebase mode or when friendsSystem not loaded)
        console.log('Opening profile for:', username);
        
        // Get player data using RankedData
        const playerData = await RankedData.getPlayer(username);
        if (!playerData) {
            alert('Jogador não encontrado!');
            return;
        }

    const rankData = RankSystem.getRank(playerData.mmr || 999);
        const winrate = playerData.wins && playerData.gamesPlayed
            ? ((playerData.wins / playerData.gamesPlayed) * 100).toFixed(1)
            : '0';

        // Update modal content
        const modalTitle = document.getElementById('profileModalTitle');
        const profileUsername = document.getElementById('profileUsername');
        const profileRankBadge = document.getElementById('profileRankBadge');
        const profileRankIcon = document.getElementById('profileRankIcon');
        const profileMMR = document.getElementById('profileMMR');
        const profileTotalMatches = document.getElementById('profileTotalMatches');
        const profileWins = document.getElementById('profileWins');
        const profileLosses = document.getElementById('profileLosses');
        const profileWinrate = document.getElementById('profileWinrate');
        
    if (modalTitle) modalTitle.textContent = `PERFIL DE ${username.toUpperCase()}`;
        if (profileUsername) profileUsername.textContent = username;
    const idStr = (playerData.playerNumberStr || (typeof playerData.playerNumber === 'number' && playerData.playerNumber > 0 ? String(playerData.playerNumber).padStart(2, '0') : '00'));
    const profileUserId = document.getElementById('profileUserId');
    if (profileUserId) profileUserId.textContent = `#${idStr}`;
        if (profileRankBadge) profileRankBadge.textContent = rankData.name;
        if (profileRankIcon) profileRankIcon.textContent = rankData.icon;
    if (profileMMR) profileMMR.textContent = playerData.mmr || 999;
        if (profileTotalMatches) profileTotalMatches.textContent = playerData.gamesPlayed || 0;
        if (profileWins) profileWins.textContent = playerData.wins || 0;
        if (profileLosses) profileLosses.textContent = playerData.losses || 0;
        if (profileWinrate) profileWinrate.textContent = winrate + '%';

        // Fill stat chips
        const modalRankName = document.getElementById('modalRankName');
        const modalMMR = document.getElementById('modalMMR');
        const modalKD = document.getElementById('modalKD');
        const modalWR = document.getElementById('modalWR');
        const modalMatches = document.getElementById('modalMatches');
        if (modalRankName) modalRankName.textContent = rankData.name;
        if (modalMMR) modalMMR.textContent = playerData.mmr || 999;
        const kd = playerData.totalDeaths > 0 ? (playerData.totalKills / playerData.totalDeaths).toFixed(2) : (playerData.totalKills || 0).toFixed(2);
        if (modalKD) modalKD.textContent = kd;
        if (modalWR) modalWR.textContent = winrate + '%';
        if (modalMatches) modalMatches.textContent = playerData.gamesPlayed || 0;

        // Rank progress (fallback path)
        const progress = RankSystem.getRankProgress(playerData.mmr || 999);
        const progText = progress.next
            ? `${progress.current.name} → ${progress.next.name} • ${progress.progress}% (faltam ${progress.mmrNeeded} MMR)`
            : `${progress.current.name} • Máximo`;
        const modalRankProgressText = document.getElementById('modalRankProgressText');
        const modalRankProgressValue = document.getElementById('modalRankProgressValue');
        const modalRankProgressBar = document.getElementById('modalRankProgressBar');
        if (modalRankProgressText) modalRankProgressText.textContent = progText;
        if (modalRankProgressValue) modalRankProgressValue.textContent = `${progress.progress}%`;
        if (modalRankProgressBar) modalRankProgressBar.style.width = `${progress.progress}%`;

        // Action buttons
        const actionButtons = document.getElementById('profileActionButtons');
        const currentUser = RankedData.currentUser;
        
        if (actionButtons) {
            if (username === currentUser) {
                actionButtons.innerHTML = '<button class="btn-primary" onclick="showPage(\'profile\'); closePlayerProfile();">📝 EDITAR PERFIL</button>';
            } else {
                actionButtons.innerHTML = `<button class="btn-primary" onclick="alert(\'Sistema de amigos em desenvolvimento!\')">➕ ADICIONAR AMIGO</button>`;
            }
        }

        // Load match history
        await loadPlayerMatchHistory(username);

        // Show modal
        const modal = document.getElementById('playerProfileModal');
        if (modal) {
            modal.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error opening player profile:', error);
        alert('Erro ao carregar perfil: ' + error.message);
    }
}

// Load player match history for profile modal
async function loadPlayerMatchHistory(username) {
    try {
        // Use RankedData.getPlayerMatches for Firebase compatibility
        const playerMatches = await RankedData.getPlayerMatches(username, 10);

        const historyDiv = document.getElementById('profileMatchHistory');
        
        if (playerMatches.length === 0) {
            historyDiv.innerHTML = '<div class="empty-state">Nenhuma partida registrada</div>';
            return;
        }

        historyDiv.innerHTML = playerMatches.map(match => {
            // Firebase structure uses winner/loser fields
            const isWinner = match.winner === username;
            const opponent = isWinner ? match.loser : match.winner;
            
            // Calculate MMR change (25 for win, 25 for loss by default)
            const mmrChange = isWinner ? '+25' : '-25';
            const resultClass = isWinner ? 'match-win' : 'match-loss';
            const date = new Date(match.timestamp).toLocaleDateString('pt-BR');

            return `
}
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationsDropdown');
    const bell = document.getElementById('notificationBell');
    
    if (dropdown && bell && 
        !dropdown.contains(event.target) && 
        !bell.contains(event.target) &&
        dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
    }
});
        
// ...existing code...

// Handle login/register
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    
    console.log('Tentando login/registro...');
    
    if (!username || !email || !password) {
        UI.showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    if (password.length < 6) {
        UI.showNotification('Senha deve ter no minimo 6 caracteres!', 'error');
        return;
    }
    
    try {
        console.log('🔐 Iniciando processo de login/registro...');
        console.log('Username:', username);
        console.log('Email:', email);
        
        // Check if we should login or register based on error
        let success = false;
        let isNewUser = false;
        
        try {
            // Always try login first
            console.log('📥 Tentando fazer login com credenciais existentes...');
            await RankedData.login(email, password);
            console.log('✅ Login realizado com sucesso!');
            UI.showNotification('Bem-vindo de volta, ' + RankedData.currentUser + '!', 'success');
            success = true;
        } catch (loginError) {
            console.log('❌ Login falhou:', loginError);
            console.log('Código do erro:', loginError.code);
            console.log('Mensagem do erro:', loginError.message);
            
            // Extract error code from message if it's in the message string
            const errorCode = loginError.code || '';
            const errorMessage = loginError.message || '';
            const isUserNotFound = errorCode.includes('user-not-found') || 
                                   errorCode.includes('invalid-credential') ||
                                   errorCode.includes('invalid-login-credentials') ||
                                   errorMessage.includes('INVALID_LOGIN_CREDENTIALS') ||
                                   errorMessage.includes('user-not-found');
            
            // Only try to register if user doesn't exist
            if (isUserNotFound) {
                console.log('👤 Usuário não encontrado, criando nova conta...');
                try {
                    isNewUser = true;
                    await RankedData.createPlayer(username, email, password);
                    console.log('✅ Conta criada com sucesso!');
                    UI.showNotification('Bem-vindo, ' + username + '! Conta criada!', 'success');
                    success = true;
                } catch (registerError) {
                    console.log('❌ Erro ao criar conta:', registerError);
                    throw registerError;
                }
            } else if (errorCode.includes('wrong-password') || errorMessage.includes('wrong-password')) {
                throw new Error('Senha incorreta! Tente novamente.');
            } else if (errorCode.includes('email-already-in-use')) {
                throw new Error('Email já cadastrado! Use a senha correta para fazer login.');
            } else {
                throw loginError;
            }
        }
        
        if (!success) {
            throw new Error('Falha no login/registro');
        }
        
        // Update UI
        console.log('Atualizando interface...');
        updateUserDisplay();
        closeLoginModal();
        await UI.updateAllViews();
        
        // Initialize friends system
        if (typeof friendsSystem !== 'undefined') {
            await friendsSystem.init();
        }
        
        // Show profile
        console.log('Mostrando pagina de perfil...');
        showPage('profile');
        
    } catch (error) {
        console.error('💥 Erro final no login/registro:', error);
        console.error('Codigo do erro:', error.code);
        console.error('Mensagem:', error.message);
        
        let message = 'Erro ao fazer login/registro!';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Email ja esta em uso! Tente fazer login com a senha correta.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalido!';
        } else if (error.code === 'auth/weak-password') {
            message = 'Senha muito fraca! Use no minimo 6 caracteres.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Senha incorreta!';
        } else if (error.code === 'auth/user-not-found') {
            message = 'Usuario nao encontrado!';
        } else {
            message = 'Erro: ' + (error.message || error.code || 'Desconhecido');
        }
        
        UI.showNotification(message, 'error');
    }
}

// Handle match submission
async function handleMatchSubmit(event) {
    event.preventDefault();
    
    if (!RankedData.currentUser) {
        UI.showNotification('Voce precisa estar logado!', 'error');
        return;
    }
    
    // Get form data
    const opponent = document.getElementById('opponentSelect').value;
    const map = document.getElementById('mapSelect').value;
    const mode = document.getElementById('gameModeSelect').value;
    const kills = document.getElementById('killsInput').value;
    const deaths = document.getElementById('deathsInput').value;
    const result = document.getElementById('resultSelect').value;
    
    // Validate
    if (!opponent || !map || !mode || !kills || !deaths || !result) {
        UI.showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    // Submit match (await for Firebase)
    const success = await MatchSystem.submitMatch({
        opponent,
        map,
        mode,
        kills,
        deaths,
        result
    });
    
    if (success) {
        // Reset form
        document.getElementById('matchReportForm').reset();
        document.getElementById('filePreview').innerHTML = '';
        
        // Update UI
        await UI.updateAllViews();
    }
}

// Handle screenshot upload (preview only)
function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('filePreview');
    
    if (!preview) return;
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="margin-top: 15px;">
                    <img src="${e.target.result}" 
                         style="max-width: 100%; max-height: 300px; border-radius: 10px; border: 2px solid var(--primary-orange);">
                    <p style="color: var(--success); margin-top: 10px;">Screenshot carregado</p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// Update user display in navbar
function updateUserDisplay() {
    const userNameEl = document.getElementById('currentUserName');
    const btnLogin = document.getElementById('btnLogin');
    
    if (RankedData.currentUser) {
        const player = RankedData.getPlayer(RankedData.currentUser);
        if (player) {
            const rank = RankSystem.getRank(player.mmr);
            userNameEl.textContent = `${rank.icon} ${RankedData.currentUser}`;
            userNameEl.style.cursor = 'pointer';
            userNameEl.onclick = () => showPage('profile');
        }
        btnLogin.textContent = 'SAIR';
        btnLogin.onclick = logout;
        
        // Update notifications
        updateNotifications();
        
        // Update hero section when user logs in
        UI.updateHeroSection();
        UI.updateRecentMatches();
    } else {
        userNameEl.textContent = 'Visitante';
        userNameEl.style.cursor = 'default';
        userNameEl.onclick = null;
        btnLogin.textContent = 'LOGIN';
        btnLogin.onclick = showLoginModal;
        
        // Hide notification bell
        const bell = document.getElementById('notificationBell');
        if (bell) bell.style.display = 'none';
        
        // Reset hero section
        UI.updateHeroSection();
        UI.updateRecentMatches();
    }
}

// Logout
async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        await RankedData.logout();
        updateUserDisplay();
        showPage('home');
        await UI.updateAllViews();
        UI.showNotification('Ate logo!', 'info');
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('usernameInput').focus();
        
        // Adicionar texto terminal ao modal
        addTerminalEffect();
    }
}

// Adicionar efeito terminal ao modal de login
function addTerminalEffect() {
    const modalForm = document.querySelector('#loginModal .modal-form');
    
    // Verificar se já tem o texto terminal
    if (!modalForm.querySelector('.terminal-text')) {
        const terminalText = document.createElement('div');
        terminalText.className = 'terminal-text';
        terminalText.innerHTML = `
            SYSTEM INITIALIZING...<br>
            PLUTONIUM RANKED NETWORK v2.0<br>
            ENTER CREDENTIALS TO ACCESS<br>
            <span class="terminal-cursor"></span>
        `;
        
        // Inserir antes do formulário
        const formGroup = modalForm.querySelector('.form-group');
        modalForm.insertBefore(terminalText, formGroup);
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('loginForm').reset();
    }
}

// Mostrar "ACCESS GRANTED" ao fazer login com sucesso
function showAccessGranted() {
    const accessGranted = document.getElementById('accessGranted');
    if (accessGranted) {
        accessGranted.classList.add('active');
        
        // Remover após 1.5s
        setTimeout(() => {
            accessGranted.classList.remove('active');
        }, 1500);
    }
}


// Close confirm modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ...existing code...

// Show page (called from HTML) - Make it explicitly global
window.showPage = function(pageId) {
    UI.showPage(pageId);
};

// Also expose as regular function
function showPage(pageId) {
    UI.showPage(pageId);
}

// Filter leaderboard (called from HTML)
async function filterLeaderboard(type) {
    await UI.renderLeaderboard(type);
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modals
    if (event.key === 'Escape') {
        closeLoginModal();
        closeConfirmModal();
    }
});

// Dev tools (remove in production)
window.devTools = {
    reset: () => RankedData.reset(),
    addTestPlayers: async () => {
        const testPlayers = ['Gabriel', 'Alan', 'Filipe', 'Pedro', 'Lucas'];
        testPlayers.forEach(name => {
            if (!RankedData.getPlayer(name)) {
                RankedData.createPlayer(name);
                const player = RankedData.getPlayer(name);
                // Keep player MMR stable (do not randomize) to maintain clear progression from 999 upwards
                player.mmr = player.mmr || 999;
                player.wins = Math.floor(Math.random() * 20);
                player.losses = Math.floor(Math.random() * 20);
                player.totalKills = Math.floor(Math.random() * 500);
                player.totalDeaths = Math.floor(Math.random() * 500);
                player.gamesPlayed = player.wins + player.losses;
                player.rank = RankSystem.getRank(player.mmr).name;
                RankedData.updatePlayer(name, player);
            }
        });
        RankedData.save();
        await UI.updateAllViews();
        console.log('Test players added');
    },
    getData: () => {
        console.log('Current Data:', {
            currentUser: RankedData.currentUser,
            players: RankedData.players,
            matches: RankedData.matches,
            pending: RankedData.pendingConfirmations
        });
    }
};

console.log('Dev Tools available: window.devTools');
console.log('   - devTools.reset() - Reset all data');
console.log('   - devTools.addTestPlayers() - Add test players');
console.log('   - devTools.getData() - View current data');

// ===== NOTIFICATION SYSTEM =====

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('active');
    
    if (dropdown.classList.contains('active')) {
        updateNotifications();
    }
}

async function updateNotifications() {
    const content = document.getElementById('notificationsContent');
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');
    
    if (!RankedData.currentUser) {
        bell.style.display = 'none';
        return;
    }
    
    const pending = await MatchSystem.getPendingMatches();
    
    if (pending.length === 0) {
        bell.style.display = 'none';
        content.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 20px;">
                Nenhuma notificação
            </p>
        `;
        return;
    }
    
    // Show bell with badge
    bell.style.display = 'block';
    badge.textContent = pending.length;
    
    // Render notifications
    content.innerHTML = pending.map(p => {
        const match = p.matchData;
        const isWinner = match.winner === RankedData.currentUser;
        const resultText = isWinner ? '🏆 VOCÊ VENCEU' : '💀 VOCÊ PERDEU';
        const resultColor = isWinner ? 'var(--success)' : 'var(--error)';
        const kdRatio = (match.kills / Math.max(1, match.deaths)).toFixed(2);
        const opponentName = p.reporter;
        
        // Calculate estimated MMR change
        const estimatedChange = isWinner ? '+25 a +35 MMR' : '-20 a -30 MMR';
        const changeColor = isWinner ? 'var(--success)' : 'var(--error)';
        
        return `
}
}

async function confirmMatchNotification(matchId, confirm) {
    console.log('confirmMatchNotification called:', { matchId, confirm });
    
    try {
        const success = await MatchSystem.confirmMatch(matchId, confirm);
        console.log('confirmMatch result:', success);
        
        if (success || !confirm) {
            await updateNotifications();
            await UI.updateAllViews();
        }
    } catch (error) {
        console.error('Error in confirmMatchNotification:', error);
        UI.showNotification('Erro ao processar confirmação: ' + error.message, 'error');
    }
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora mesmo';
}
}

// Global function to open player profile (works with both Firebase and LocalStorage)
async function openPlayerProfile(username) {
    try {
        // Check if friendsSystem is available (LocalStorage mode)
        if (typeof friendsSystem !== 'undefined' && friendsSystem.openPlayerProfile) {
            await friendsSystem.openPlayerProfile(username);
            return;
        }
        
        // Fallback: Open profile modal manually (Firebase mode or when friendsSystem not loaded)
        console.log('Opening profile for:', username);
        
        // Get player data using RankedData
        const playerData = await RankedData.getPlayer(username);
        if (!playerData) {
            alert('Jogador não encontrado!');
            return;
        }

    const rankData = RankSystem.getRank(playerData.mmr || 999);
        const winrate = playerData.wins && playerData.gamesPlayed
            ? ((playerData.wins / playerData.gamesPlayed) * 100).toFixed(1)
            : '0';

        // Update modal content
        const modalTitle = document.getElementById('profileModalTitle');
        const profileUsername = document.getElementById('profileUsername');
        const profileRankBadge = document.getElementById('profileRankBadge');
        const profileRankIcon = document.getElementById('profileRankIcon');
        const profileMMR = document.getElementById('profileMMR');
        const profileTotalMatches = document.getElementById('profileTotalMatches');
        const profileWins = document.getElementById('profileWins');
        const profileLosses = document.getElementById('profileLosses');
        const profileWinrate = document.getElementById('profileWinrate');
        
    if (modalTitle) modalTitle.textContent = `PERFIL DE ${username.toUpperCase()}`;
        if (profileUsername) profileUsername.textContent = username;
    const idStr = (playerData.playerNumberStr || (typeof playerData.playerNumber === 'number' && playerData.playerNumber > 0 ? String(playerData.playerNumber).padStart(2, '0') : '00'));
    const profileUserId = document.getElementById('profileUserId');
    if (profileUserId) profileUserId.textContent = `#${idStr}`;
        if (profileRankBadge) profileRankBadge.textContent = rankData.name;
        if (profileRankIcon) profileRankIcon.textContent = rankData.icon;
    if (profileMMR) profileMMR.textContent = playerData.mmr || 999;
        if (profileTotalMatches) profileTotalMatches.textContent = playerData.gamesPlayed || 0;
        if (profileWins) profileWins.textContent = playerData.wins || 0;
        if (profileLosses) profileLosses.textContent = playerData.losses || 0;
        if (profileWinrate) profileWinrate.textContent = winrate + '%';

        // Fill stat chips
        const modalRankName = document.getElementById('modalRankName');
        const modalMMR = document.getElementById('modalMMR');
        const modalKD = document.getElementById('modalKD');
        const modalWR = document.getElementById('modalWR');
        const modalMatches = document.getElementById('modalMatches');
        if (modalRankName) modalRankName.textContent = rankData.name;
        if (modalMMR) modalMMR.textContent = playerData.mmr || 999;
        const kd = playerData.totalDeaths > 0 ? (playerData.totalKills / playerData.totalDeaths).toFixed(2) : (playerData.totalKills || 0).toFixed(2);
        if (modalKD) modalKD.textContent = kd;
        if (modalWR) modalWR.textContent = winrate + '%';
        if (modalMatches) modalMatches.textContent = playerData.gamesPlayed || 0;

        // Rank progress (fallback path)
        const progress = RankSystem.getRankProgress(playerData.mmr || 999);
        const progText = progress.next
            ? `${progress.current.name} → ${progress.next.name} • ${progress.progress}% (faltam ${progress.mmrNeeded} MMR)`
            : `${progress.current.name} • Máximo`;
        const modalRankProgressText = document.getElementById('modalRankProgressText');
        const modalRankProgressValue = document.getElementById('modalRankProgressValue');
        const modalRankProgressBar = document.getElementById('modalRankProgressBar');
        if (modalRankProgressText) modalRankProgressText.textContent = progText;
        if (modalRankProgressValue) modalRankProgressValue.textContent = `${progress.progress}%`;
        if (modalRankProgressBar) modalRankProgressBar.style.width = `${progress.progress}%`;

        // Action buttons
        const actionButtons = document.getElementById('profileActionButtons');
        const currentUser = RankedData.currentUser;
        
        if (actionButtons) {
            if (username === currentUser) {
                actionButtons.innerHTML = '<button class="btn-primary" onclick="showPage(\'profile\'); closePlayerProfile();">📝 EDITAR PERFIL</button>';
            } else {
                actionButtons.innerHTML = `<button class="btn-primary" onclick="alert(\'Sistema de amigos em desenvolvimento!\')">➕ ADICIONAR AMIGO</button>`;
            }
        }

        // Load match history
        await loadPlayerMatchHistory(username);

        // Show modal
        const modal = document.getElementById('playerProfileModal');
        if (modal) {
            modal.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error opening player profile:', error);
        alert('Erro ao carregar perfil: ' + error.message);
    }
}

// Load player match history for profile modal
async function loadPlayerMatchHistory(username) {
    try {
        // Use RankedData.getPlayerMatches for Firebase compatibility
        const playerMatches = await RankedData.getPlayerMatches(username, 10);

        const historyDiv = document.getElementById('profileMatchHistory');
        
        if (playerMatches.length === 0) {
            historyDiv.innerHTML = '<div class="empty-state">Nenhuma partida registrada</div>';
            return;
        }

        historyDiv.innerHTML = playerMatches.map(match => {
            // Firebase structure uses winner/loser fields
            const isWinner = match.winner === username;
            const opponent = isWinner ? match.loser : match.winner;
            
            // Calculate MMR change (25 for win, 25 for loss by default)
            const mmrChange = isWinner ? '+25' : '-25';
            const resultClass = isWinner ? 'match-win' : 'match-loss';
            const date = new Date(match.timestamp).toLocaleDateString('pt-BR');

            return `
}
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationsDropdown');
    const bell = document.getElementById('notificationBell');
    
    if (dropdown && bell && 
        !dropdown.contains(event.target) && 
        !bell.contains(event.target) &&
        dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
    }
});
        
// ...existing code...

// Handle login/register
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    
    console.log('Tentando login/registro...');
    
    if (!username || !email || !password) {
        UI.showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    if (password.length < 6) {
        UI.showNotification('Senha deve ter no minimo 6 caracteres!', 'error');
        return;
    }
    
    try {
        console.log('🔐 Iniciando processo de login/registro...');
        console.log('Username:', username);
        console.log('Email:', email);
        
        // Check if we should login or register based on error
        let success = false;
        let isNewUser = false;
        
        try {
            // Always try login first
            console.log('📥 Tentando fazer login com credenciais existentes...');
            await RankedData.login(email, password);
            console.log('✅ Login realizado com sucesso!');
            UI.showNotification('Bem-vindo de volta, ' + RankedData.currentUser + '!', 'success');
            success = true;
        } catch (loginError) {
            console.log('❌ Login falhou:', loginError);
            console.log('Código do erro:', loginError.code);
            console.log('Mensagem do erro:', loginError.message);
            
            // Extract error code from message if it's in the message string
            const errorCode = loginError.code || '';
            const errorMessage = loginError.message || '';
            const isUserNotFound = errorCode.includes('user-not-found') || 
                                   errorCode.includes('invalid-credential') ||
                                   errorCode.includes('invalid-login-credentials') ||
                                   errorMessage.includes('INVALID_LOGIN_CREDENTIALS') ||
                                   errorMessage.includes('user-not-found');
            
            // Only try to register if user doesn't exist
            if (isUserNotFound) {
                console.log('👤 Usuário não encontrado, criando nova conta...');
                try {
                    isNewUser = true;
                    await RankedData.createPlayer(username, email, password);
                    console.log('✅ Conta criada com sucesso!');
                    UI.showNotification('Bem-vindo, ' + username + '! Conta criada!', 'success');
                    success = true;
                } catch (registerError) {
                    console.log('❌ Erro ao criar conta:', registerError);
                    throw registerError;
                }
            } else if (errorCode.includes('wrong-password') || errorMessage.includes('wrong-password')) {
                throw new Error('Senha incorreta! Tente novamente.');
            } else if (errorCode.includes('email-already-in-use')) {
                throw new Error('Email já cadastrado! Use a senha correta para fazer login.');
            } else {
                throw loginError;
            }
        }
        
        if (!success) {
            throw new Error('Falha no login/registro');
        }
        
        // Update UI
        console.log('Atualizando interface...');
        updateUserDisplay();
        closeLoginModal();
        await UI.updateAllViews();
        
        // Initialize friends system
        if (typeof friendsSystem !== 'undefined') {
            await friendsSystem.init();
        }
        
        // Show profile
        console.log('Mostrando pagina de perfil...');
        showPage('profile');
        
    } catch (error) {
        console.error('💥 Erro final no login/registro:', error);
        console.error('Codigo do erro:', error.code);
        console.error('Mensagem:', error.message);
        
        let message = 'Erro ao fazer login/registro!';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Email ja esta em uso! Tente fazer login com a senha correta.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalido!';
        } else if (error.code === 'auth/weak-password') {
            message = 'Senha muito fraca! Use no minimo 6 caracteres.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Senha incorreta!';
        } else if (error.code === 'auth/user-not-found') {
            message = 'Usuario nao encontrado!';
        } else {
            message = 'Erro: ' + (error.message || error.code || 'Desconhecido');
        }
        
        UI.showNotification(message, 'error');
    }
}

// Handle match submission
async function handleMatchSubmit(event) {
    event.preventDefault();
    
    if (!RankedData.currentUser) {
        UI.showNotification('Voce precisa estar logado!', 'error');
        return;
    }
    
    // Get form data
    const opponent = document.getElementById('opponentSelect').value;
    const map = document.getElementById('mapSelect').value;
    const mode = document.getElementById('gameModeSelect').value;
    const kills = document.getElementById('killsInput').value;
    const deaths = document.getElementById('deathsInput').value;
    const result = document.getElementById('resultSelect').value;
    
    // Validate
    if (!opponent || !map || !mode || !kills || !deaths || !result) {
        UI.showNotification('Preencha todos os campos!', 'error');
        return;
    }
    
    // Submit match (await for Firebase)
    const success = await MatchSystem.submitMatch({
        opponent,
        map,
        mode,
        kills,
        deaths,
        result
    });
    
    if (success) {
        // Reset form
        document.getElementById('matchReportForm').reset();
        document.getElementById('filePreview').innerHTML = '';
        
        // Update UI
        await UI.updateAllViews();
    }
}

// Handle screenshot upload (preview only)
function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('filePreview');
    
    if (!preview) return;
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div style="margin-top: 15px;">
                    <img src="${e.target.result}" 
                         style="max-width: 100%; max-height: 300px; border-radius: 10px; border: 2px solid var(--primary-orange);">
                    <p style="color: var(--success); margin-top: 10px;">Screenshot carregado</p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// Update user display in navbar
function updateUserDisplay() {
    const userNameEl = document.getElementById('currentUserName');
    const btnLogin = document.getElementById('btnLogin');
    
    if (RankedData.currentUser) {
        const player = RankedData.getPlayer(RankedData.currentUser);
        if (player) {
            const rank = RankSystem.getRank(player.mmr);
            userNameEl.textContent = `${rank.icon} ${RankedData.currentUser}`;
            userNameEl.style.cursor = 'pointer';
            userNameEl.onclick = () => showPage('profile');
        }
        btnLogin.textContent = 'SAIR';
        btnLogin.onclick = logout;
        
        // Update notifications
        updateNotifications();
        
        // Update hero section when user logs in
        UI.updateHeroSection();
        UI.updateRecentMatches();
    } else {
        userNameEl.textContent = 'Visitante';
        userNameEl.style.cursor = 'default';
        userNameEl.onclick = null;
        btnLogin.textContent = 'LOGIN';
        btnLogin.onclick = showLoginModal;
        
        // Hide notification bell
        const bell = document.getElementById('notificationBell');
        if (bell) bell.style.display = 'none';
        
        // Reset hero section
        UI.updateHeroSection();
        UI.updateRecentMatches();
    }
}

// Logout
async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        await RankedData.logout();
        updateUserDisplay();
        showPage('home');
        await UI.updateAllViews();
        UI.showNotification('Ate logo!', 'info');
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('usernameInput').focus();
        
        // Adicionar texto terminal ao modal
        addTerminalEffect();
    }
}

// Adicionar efeito terminal ao modal de login
function addTerminalEffect() {
    const modalForm = document.querySelector('#loginModal .modal-form');
    
    // Verificar se já tem o texto terminal
    if (!modalForm.querySelector('.terminal-text')) {
        const terminalText = document.createElement('div');
        terminalText.className = 'terminal-text';
        terminalText.innerHTML = `
            SYSTEM INITIALIZING...<br>
            PLUTONIUM RANKED NETWORK v2.0<br>
            ENTER CREDENTIALS TO ACCESS<br>
            <span class="terminal-cursor"></span>
        `;
        
        // Inserir antes do formulário
        const formGroup = modalForm.querySelector('.form-group');
        modalForm.insertBefore(terminalText, formGroup);
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('loginForm').reset();
    }
}

// Mostrar "ACCESS GRANTED" ao fazer login com sucesso
function showAccessGranted() {
    const accessGranted = document.getElementById('accessGranted');
    if (accessGranted) {
        accessGranted.classList.add('active');
        
        // Remover após 1.5s
        setTimeout(() => {
            accessGranted.classList.remove('active');
        }, 1500);
    }
}


// Close confirm modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ...existing code...

// Show page (called from HTML) - Make it explicitly global
window.showPage = function(pageId) {
    UI.showPage(pageId);
};

// Also expose as regular function
function showPage(pageId) {
    UI.showPage(pageId);
}

// Filter leaderboard (called from HTML)
async function filterLeaderboard(type) {
    await UI.renderLeaderboard(type);
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modals
    if (event.key === 'Escape') {
        closeLoginModal();
        closeConfirmModal();
    }
});

// Dev tools (remove in production)
window.devTools = {
    reset: () => RankedData.reset(),
    addTestPlayers: async () => {
        const testPlayers = ['Gabriel', 'Alan', 'Filipe', 'Pedro', 'Lucas'];
        testPlayers.forEach(name => {
            if (!RankedData.getPlayer(name)) {
                RankedData.createPlayer(name);
                const player = RankedData.getPlayer(name);
                // Keep player MMR stable (do not randomize) to maintain clear progression from 999 upwards
                player.mmr = player.mmr || 999;
                player.wins = Math.floor(Math.random() * 20);
                player.losses = Math.floor(Math.random() * 20);
                player.totalKills = Math.floor(Math.random() * 500);
                player.totalDeaths = Math.floor(Math.random() * 500);
                player.gamesPlayed = player.wins + player.losses;
                player.rank = RankSystem.getRank(player.mmr).name;
                RankedData.updatePlayer(name, player);
            }
        });
        RankedData.save();
        await UI.updateAllViews();
        console.log('Test players added');
    },
    getData: () => {
        console.log('Current Data:', {
            currentUser: RankedData.currentUser,
            players: RankedData.players,
            matches: RankedData.matches,
            pending: RankedData.pendingConfirmations
        });
    }
};

console.log('Dev Tools available: window.devTools');
console.log('   - devTools.reset() - Reset all data');
console.log('   - devTools.addTestPlayers() - Add test players');
console.log('   - devTools.getData() - View current data');

// ===== NOTIFICATION SYSTEM =====

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('active');
    
    if (dropdown.classList.contains('active')) {
        updateNotifications();
    }
}

async function updateNotifications() {
    const content = document.getElementById('notificationsContent');
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');
    
    if (!RankedData.currentUser) {
        bell.style.display = 'none';
        return;
    }
    
    const pending = await MatchSystem.getPendingMatches();
    
    if (pending.length === 0) {
        bell.style.display = 'none';
        content.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 20px;">
                Nenhuma notificação
            </p>
        `;
        return;
    }
    
    // Show bell with badge
    bell.style.display = 'block';
    badge.textContent = pending.length;
    
    // Render notifications
    content.innerHTML = pending.map(p => {
        const match = p.matchData;
        const isWinner = match.winner === RankedData.currentUser;
        const resultText = isWinner ? '🏆 VOCÊ VENCEU' : '💀 VOCÊ PERDEU';
        const resultColor = isWinner ? 'var(--success)' : 'var(--error)';
        const kdRatio = (match.kills / Math.max(1, match.deaths)).toFixed(2);
        const opponentName = p.reporter;
        
        // Calculate estimated MMR change
        const estimatedChange = isWinner ? '+25 a +35 MMR' : '-20 a -30 MMR';
        const changeColor = isWinner ? 'var(--success)' : 'var(--error)';
        
        return `
}
}

async function confirmMatchNotification(matchId, confirm) {
    console.log('confirmMatchNotification called:', { matchId, confirm });
    
    try {
        const success = await MatchSystem.confirmMatch(matchId, confirm);
        console.log('confirmMatch result:', success);
        
        if (success || !confirm) {
            await updateNotifications();
            await UI.updateAllViews();
        }
    } catch (error) {
        console.error('Error in confirmMatchNotification:', error);
        UI.showNotification('Erro ao processar confirmação: ' + error.message, 'error');
    }
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora mesmo';
}
}

// Global function to open player profile (works with both Firebase and LocalStorage)
async function openPlayerProfile(username) {
    try {
        // Check if friendsSystem is available (LocalStorage mode)
        if (typeof friendsSystem !== 'undefined' && friendsSystem.openPlayerProfile) {
            await friendsSystem.openPlayerProfile(username);
            return;
        }
        
        // Fallback: Open profile modal manually (Firebase mode or when friendsSystem not loaded)
        console.log('Opening profile for:', username);
        
        // Get player data using RankedData
        const playerData = await RankedData.getPlayer(username);
        if (!playerData) {
            alert('Jogador não encontrado!');
            return;
        }

    const rankData = RankSystem.getRank(playerData.mmr || 999);
        const winrate = playerData.wins && playerData.gamesPlayed
            ? ((playerData.wins / playerData.gamesPlayed) * 100).toFixed(1)
            : '0';

        // Update modal content
        const modalTitle = document.getElementById('profileModalTitle');
        const profileUsername = document.getElementById('profileUsername');
        const profileRankBadge = document.getElementById('profileRankBadge');
        const profileRankIcon = document.getElementById('profileRankIcon');
        const profileMMR = document.getElementById('profileMMR');
        const profileTotalMatches = document.getElementById('profileTotalMatches');
        const profileWins = document.getElementById('profileWins');
        const profileLosses = document.getElementById('profileLosses');
        const profileWinrate = document.getElementById('profileWinrate');
        
    if (modalTitle) modalTitle.textContent = `PERFIL DE ${username.toUpperCase()}`;
        if (profileUsername) profileUsername.textContent = username;
    const idStr = (playerData.playerNumberStr || (typeof playerData.playerNumber === 'number' && playerData.playerNumber > 0 ? String(playerData.playerNumber).padStart(2, '0') : '00'));
    const profileUserId = document.getElementById('profileUserId');
    if (profileUserId) profileUserId.textContent = `#${idStr}`;
        if (profileRankBadge) profileRankBadge.textContent = rankData.name;
        if (profileRankIcon) profileRankIcon.textContent = rankData.icon;
    if (profileMMR) profileMMR.textContent = playerData.mmr || 999;
        if (profileTotalMatches) profileTotalMatches.textContent = playerData.gamesPlayed || 0;
        if (profileWins) profileWins.textContent = playerData.wins || 0;
        if (profileLosses) profileLosses.textContent = playerData.losses || 0;
        if (profileWinrate) profileWinrate.textContent = winrate + '%';

        // Fill stat chips
        const modalRankName = document.getElementById('modalRankName');
        const modalMMR = document.getElementById('modalMMR');
        const modalKD = document.getElementById('modalKD');
        const modalWR = document.getElementById('modalWR');
        const modalMatches = document.getElementById('modalMatches');
        if (modalRankName) modalRankName.textContent = rankData.name;
        if (modalMMR) modalMMR.textContent = playerData.mmr || 999;
        const kd = playerData.totalDeaths > 0 ? (playerData.totalKills / playerData.totalDeaths).toFixed(2) : (playerData.totalKills || 0).toFixed(2);
        if (modalKD) modalKD.textContent = kd;
        if (modalWR) modalWR.textContent = winrate + '%';
        if (modalMatches) modalMatches.textContent = playerData.gamesPlayed || 0;

        // Rank progress (fallback path)
        const progress = RankSystem.getRankProgress(playerData.mmr || 999);
        const progText = progress.next
            ? `${progress.current.name} → ${progress.next.name} • ${progress.progress}% (faltam ${progress.mmrNeeded} MMR)`
            : `${progress.current.name} • Máximo`;
        const modalRankProgressText = document.getElementById('modalRankProgressText');
        const modalRankProgressValue = document.getElementById('modalRankProgressValue');
        const modalRankProgressBar = document.getElementById('modalRankProgressBar');
        if (modalRankProgressText) modalRankProgressText.textContent = progText;
        if (modalRankProgressValue) modalRankProgressValue.textContent = `${progress.progress}%`;
        if (modalRankProgressBar) modalRankProgressBar.style.width = `${progress.progress}%`;

        // Action buttons
        const actionButtons = document.getElementById('profileActionButtons');
        const currentUser = RankedData.currentUser;
        
        if (actionButtons) {
            if (username === currentUser) {
                actionButtons.innerHTML = '<button class="btn-primary" onclick="showPage(\'profile\'); closePlayerProfile();">📝 EDITAR PERFIL</button>';
            } else {
                actionButtons.innerHTML = `<button class="btn-primary" onclick="alert(\'Sistema de amigos em desenvolvimento!\')">➕ ADICIONAR AMIGO</button>`;
            }
        }

        // Load match history
        await loadPlayerMatchHistory(username);

        // Show modal
        const modal = document.getElementById('playerProfileModal');
        if (modal) {
            modal.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error opening player profile:', error);
        alert('Erro ao carregar perfil: ' + error.message);
    }
}

// Load player match history for profile modal
async function loadPlayerMatchHistory(username) {
    try {
        // Use RankedData.getPlayerMatches for Firebase compatibility
        const playerMatches = await RankedData.getPlayerMatches(username, 10);

        const historyDiv = document.getElementById('profileMatchHistory');
        
        if (playerMatches.length === 0) {
            historyDiv.innerHTML = '<div class="empty-state">Nenhuma partida registrada</div>';
            return;
        }

        historyDiv.innerHTML = playerMatches.map(match => {
            // Firebase structure uses winner/loser fields
            const isWinner = match.winner === username;
            const opponent = isWinner ? match.loser : match.winner;
            
            // Calculate MMR change (25 for win, 25 for loss by default)
            const mmrChange = isWinner ? '+25' : '-25';
            const resultClass = isWinner ? 'match-win' : 'match-loss';
            const date = new Date(match.timestamp).toLocaleDateString('pt-BR');

            return `
}
}

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationsDropdown');
    const bell = document.getElementById('notificationBell');
    
    if (dropdown && bell && 
        !dropdown.contains(event.target) && 
        !bell.contains(event.target) &&
        dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
    }
});


}