// BO2 RANKED - MAIN APPLICATION

// Initialize application on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize data
    await RankedData.init();
    
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

// Handle Google login
async function loginWithGoogle() {
    try {
        console.log('🔵 Iniciando login com Google...');
        UI.showNotification('Abrindo janela do Google...', 'info');
        
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
                seasonStats: {
                    [RankedData.currentSeason]: {
                        wins: 0,
                        losses: 0,
                        mmr: 1000
                    }
                }
            };
            
            await firebase.firestore().collection('players').doc(user.uid).set(playerData);
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
            
            UI.showNotification('Bem-vindo de volta, ' + playerData.username + '!', 'success');
        }
        
        // Update UI
        updateUserDisplay();
        closeLoginModal();
        await UI.updateAllViews();
        showPage('profile');
        
    } catch (error) {
        console.error('❌ Erro no login com Google:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            UI.showNotification('Login cancelado', 'error');
        } else if (error.code === 'auth/popup-blocked') {
            UI.showNotification('Pop-up bloqueado! Permita pop-ups para este site', 'error');
        } else {
            UI.showNotification('Erro ao fazer login com Google: ' + error.message, 'error');
        }
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
    } else {
        userNameEl.textContent = 'Visitante';
        userNameEl.style.cursor = 'default';
        userNameEl.onclick = null;
        btnLogin.textContent = 'LOGIN';
        btnLogin.onclick = showLoginModal;
        
        // Hide notification bell
        const bell = document.getElementById('notificationBell');
        if (bell) bell.style.display = 'none';
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

// Show page (called from HTML)
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
                player.mmr = 1000 + Math.floor(Math.random() * 1000);
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
        const resultText = isWinner ? '✅ Vitória' : '❌ Derrota';
        const resultColor = isWinner ? 'var(--success)' : 'var(--error)';
        
        return `
            <div class="notification-item">
                <div class="notification-title">
                    Partida reportada por ${p.reporter}
                </div>
                <div class="notification-details">
                    <div style="margin-bottom: 5px;">
                        <strong>Mapa:</strong> ${match.map} | <strong>Modo:</strong> ${match.mode}
                    </div>
                    <div style="margin-bottom: 5px;">
                        <strong>Resultado:</strong> <span style="color: ${resultColor};">${resultText}</span>
                    </div>
                    <div style="margin-bottom: 5px;">
                        <strong>K/D:</strong> ${match.kills}/${match.deaths}
                    </div>
                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">
                        ${getTimeAgo(p.timestamp)}
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="btn-primary" style="flex: 1;" onclick="confirmMatchNotification(${p.matchId}, true)">
                        ✅ CONFIRMAR
                    </button>
                    <button class="btn-secondary" style="flex: 1;" onclick="confirmMatchNotification(${p.matchId}, false)">
                        ❌ REJEITAR
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function confirmMatchNotification(matchId, confirm) {
    const success = await MatchSystem.confirmMatch(matchId, confirm);
    
    if (success || !confirm) {
        await updateNotifications();
        await UI.updateAllViews();
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
