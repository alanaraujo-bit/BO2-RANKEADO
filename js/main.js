// BO2 RANKED - MAIN APPLICATION

console.log('main.js carregado (vercel deploy)');
// Signal that the main script loaded (helps debug if script is not being included)
console.log('main.js loaded');

// Global wrapper functions for compatibility between Firebase and LocalStorage
async function getUserData(username) {
    try {
        return await RankedData.getPlayer(username);
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

async function updateUserData(username, data) {
    try {
        const playerData = await RankedData.getPlayer(username);
        if (!playerData) return false;
        
        // Merge the data
        const updatedData = { ...playerData, ...data };
        return await RankedData.updatePlayer(username, updatedData);
    } catch (error) {
        console.error('Error updating user data:', error);
        return false;
    }
}

function getRankFromMMR(mmr) {
    return RankSystem.getRank(mmr);
}

// Make currentUser accessible globally via getter (dynamic)
Object.defineProperty(window, 'currentUser', {
    get: function() {
        return RankedData.currentUser;
    }
});

// Initialize application on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize data and start realtime as soon as possible
    try {
        await RankedData.init();
        // When already authenticated from previous session, make sure listeners are active
        if (RankedData.currentUser) {
            RankedData.subscribeAllRealtime();
        }
    } catch (e) {
        console.error('❌ Failed to initialize RankedData:', e);
    }

    // Update UI
    updateUserDisplay();
    await UI.updateAllViews();

    // Setup event listeners
    setupEventListeners();

    // Show home page
    UI.showPage('home');

    console.log('BO2 Ranked System initialized');
});

// Setup all event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Match report form
    const matchForm = document.getElementById('matchReportForm');
    if (matchForm) {
        matchForm.addEventListener('submit', handleMatchSubmit);
    }
    
    // Screenshot preview
    const screenshotInput = document.getElementById('screenshotInput');
    if (screenshotInput) {
        screenshotInput.addEventListener('change', handleScreenshotUpload);
    }
}

// Flag to prevent duplicate login attempts
let isLoggingIn = false;

// Handle Google login
async function loginWithGoogle() {
    // Prevent duplicate calls
    if (isLoggingIn) {
        console.log('⚠️ Login já em andamento, ignorando chamada duplicada');
        return;
    }
    
    try {
        isLoggingIn = true;
        console.log('🔵 Iniciando login com Google...');
        UI.showNotification('Abrindo janela do Google...', 'info');
        // UX: disable Google button to avoid double clicks
        const googleBtn = document.querySelector('.btn-google');
        let previousHtml = null;
        if (googleBtn) {
            try {
                previousHtml = googleBtn.innerHTML;
                googleBtn.setAttribute('disabled', 'disabled');
                googleBtn.classList.add('loading');
                googleBtn.innerHTML = '<span style="opacity:0.9">Abrindo...</span>';
            } catch (e) {}
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Login com Google bem-sucedido:', user.email);
        
        // Extract username from email (before @)
        const username = user.displayName || user.email.split('@')[0];
        
        // Check if player profile exists
        const playerDoc = await firebase.firestore().collection('players').doc(user.uid).get();
        
        if (!playerDoc.exists) {
            // Create new player profile
            console.log('🆕 Criando perfil para novo usuário Google...');
            // Allocate sequential number if possible
            let seqNum = 0;
            try {
                if (typeof RankedData.allocateNextPlayerNumber === 'function') {
                    seqNum = await RankedData.allocateNextPlayerNumber();
                }
            } catch (_) {}

            const playerData = {
                username: username,
                email: user.email,
                mmr: 1000,
                wins: 0,
                losses: 0,
                gamesPlayed: 0,
                winStreak: 0,
                bestStreak: 0,
                totalKills: 0,
                totalDeaths: 0,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                playerNumber: seqNum || 0,
                playerNumberStr: seqNum ? String(seqNum).padStart(2, '0') : null,
                seasonStats: {
                    [RankedData.currentSeason]: {
                        wins: 0,
                        losses: 0,
                        mmr: 1000
                    }
                }
            };
            
            await firebase.firestore().collection('players').doc(user.uid).set({ ...playerData, userId: user.uid });
            RankedData.currentUserId = user.uid;
            RankedData.currentUser = username;
            RankedData.players[username] = playerData;
            
            UI.showNotification('Bem-vindo, ' + username + '! Conta criada!', 'success');
        } else {
            // Load existing player data
            const playerData = playerDoc.data();
            RankedData.currentUserId = user.uid;
            RankedData.currentUser = playerData.username;
            RankedData.players[playerData.username] = playerData;
            // Ensure sequential number exists for legacy users
            if (typeof playerData.playerNumber !== 'number' || playerData.playerNumber <= 0) {
                await RankedData.ensurePlayerNumber(RankedData.currentUser);
            }
            
            UI.showNotification('Bem-vindo de volta, ' + playerData.username + '!', 'success');
        }
        
        // Update UI
        updateUserDisplay();
        
        // Mostrar "ACCESS GRANTED" antes de fechar modal
        showAccessGranted();
        
        setTimeout(() => {
            closeLoginModal();
            showPage('profile');
        }, 800);
        
        await UI.updateAllViews();
        
    } catch (error) {
        console.error('❌ Erro no login com Google:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            UI.showNotification('Login cancelado', 'error');
        } else if (error.code === 'auth/popup-blocked') {
            UI.showNotification('Pop-up bloqueado! Permita pop-ups para este site', 'error');
        } else if (error.code === 'auth/cancelled-popup-request') {
            console.log('⚠️ Popup cancelado por outra solicitação - ignorando');
            // Silenciar este erro pois é causado por chamadas duplicadas
        } else {
            UI.showNotification('Erro ao fazer login com Google: ' + error.message, 'error');
        }
    }
    finally {
        // Reset flag and restore button state
        isLoggingIn = false;
        try {
            const googleBtn = document.querySelector('.btn-google');
            if (googleBtn) {
                googleBtn.removeAttribute('disabled');
                googleBtn.classList.remove('loading');
                if (previousHtml !== null) googleBtn.innerHTML = previousHtml;
            }
        } catch (e) {}
    }
}

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

// Filter leaderboard
async function filterLeaderboard(type) {
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render leaderboard with filter
    await UI.renderLeaderboard(type);
}

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

// Expose some functions on window for compatibility with other build artifacts
// (pages/index.js and inline onclick handlers may rely on window.showLoginModal etc.)
try {
    if (typeof window !== 'undefined') {
        window.showLoginModal = showLoginModal;
        window.closeLoginModal = closeLoginModal;
        window.loginWithGoogle = loginWithGoogle;
        window.handleLogin = handleLogin;
        window.showAccessGranted = showAccessGranted;
        console.log('✅ Login functions exposed to window:', {
            showLoginModal: typeof window.showLoginModal,
            loginWithGoogle: typeof window.loginWithGoogle,
            handleLogin: typeof window.handleLogin
        });
    }
} catch (e) {
    console.error('❌ Could not attach login helpers to window:', e);
}

// Listen for legacy custom event dispatched by Next.js pages (pages/index.js)
try {
    if (typeof window !== 'undefined') {
        window.addEventListener('bo2:request-login', () => {
            try {
                if (typeof showLoginModal === 'function') showLoginModal();
            } catch (e) {
                console.error('Error handling bo2:request-login:', e);
            }
        });
    }
} catch (e) {
    console.warn('Could not attach bo2:request-login listener:', e);
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
            <div class="notification-item">
                <div class="notification-title">
                    ⚔️ Partida vs ${opponentName}
                </div>
                <div class="notification-details">
                    <div style="margin-bottom: 8px; padding: 8px; background: rgba(255, 102, 0, 0.1); border-radius: 5px;">
                        <div style="font-size: 1.1em; font-weight: 700; color: ${resultColor};">
                            ${resultText}
                        </div>
                        <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 3px;">
                            Reportado por ${opponentName}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 5px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 0.85em;">MAPA</div>
                            <div style="font-weight: 700; color: var(--primary-orange);">${match.map}</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 5px; text-align: center;">
                            <div style="color: var(--text-secondary); font-size: 0.85em;">MODO</div>
                            <div style="font-weight: 700; color: var(--primary-orange);">${match.mode}</div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                        <div style="color: var(--text-secondary); font-size: 0.85em; margin-bottom: 5px;">
                            ESTATÍSTICAS DO OPONENTE
                        </div>
                        <div style="display: flex; justify-content: space-around; align-items: center;">
                            <div style="text-align: center;">
                                <div style="font-size: 1.5em; font-weight: 700; color: var(--success);">${match.kills}</div>
                                <div style="font-size: 0.8em; color: var(--text-secondary);">Kills</div>
                            </div>
                            <div style="font-size: 1.2em; color: var(--text-secondary);">/</div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.5em; font-weight: 700; color: var(--error);">${match.deaths}</div>
                                <div style="font-size: 0.8em; color: var(--text-secondary);">Deaths</div>
                            </div>
                            <div style="font-size: 1.2em; color: var(--text-secondary)">=</div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.5em; font-weight: 700; color: var(--neon-blue);">${kdRatio}</div>
                                <div style="font-size: 0.8em; color: var(--text-secondary);">K/D</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(0, 217, 255, 0.05); padding: 8px; border-radius: 5px; border: 1px solid rgba(0, 217, 255, 0.2); margin-bottom: 8px;">
                        <div style="font-size: 0.9em; color: var(--text-secondary);">
                            ⚡ Mudança estimada de MMR:
                        </div>
                        <div style="font-weight: 700; color: ${changeColor}; font-size: 1.1em;">
                            ${estimatedChange}
                        </div>
                    </div>
                    
                    <div style="font-size: 0.85em; color: var(--text-secondary); text-align: center; margin-top: 8px;">
                        ⏰ ${getTimeAgo(p.timestamp)}
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="btn-primary" style="flex: 1;" onclick="confirmMatchNotification('${p.matchId}', true)">
                        ✅ CONFIRMAR
                    </button>
                    <button class="btn-secondary" style="flex: 1;" onclick="confirmMatchNotification('${p.matchId}', false)">
                        ❌ REJEITAR
                    </button>
                </div>
            </div>
        `;
    }).join('');
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
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    return `${days} dia${days > 1 ? 's' : ''} atrás`;
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
                <div class="profile-match-item ${resultClass}">
                    <div class="match-result-icon">${isWinner ? '🏆' : '💔'}</div>
                    <div class="match-details">
                        <div class="match-opponent">${isWinner ? 'VITÓRIA' : 'DERROTA'} vs ${opponent}</div>
                        <div class="match-date">${date}</div>
                    </div>
                    <div class="match-mmr ${isWinner ? 'mmr-gain' : 'mmr-loss'}">${mmrChange} MMR</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading match history:', error);
        document.getElementById('profileMatchHistory').innerHTML = '<div class="error-state">Erro ao carregar histórico</div>';
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
// Fim do arquivo main.js
// Fim do arquivo main.js
