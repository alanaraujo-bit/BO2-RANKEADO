// BO2 RANKED - MAIN APPLICATION

// Initialize application on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    RankedData.init();
    
    // Update UI
    updateUserDisplay();
    UI.updateAllViews();
    
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

// Handle login/register
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    console.log('Tentando login com:', username);
    
    if (!username) {
        UI.showNotification('Digite um nome de usuario valido!', 'error');
        return;
    }
    
    // Check if player exists
    let player = RankedData.getPlayer(username);
    console.log('Jogador encontrado:', player);
    
    if (!player) {
        // Create new player
        console.log('Criando novo jogador...');
        const created = RankedData.createPlayer(username);
        if (created) {
            player = RankedData.getPlayer(username);
            console.log('Jogador criado:', player);
            UI.showNotification('Bem-vindo, ' + username + '! Sua jornada ranked comeca agora!', 'success');
        } else {
            UI.showNotification('Erro ao criar jogador!', 'error');
            return;
        }
    } else {
        console.log('Jogador ja existe, fazendo login...');
        UI.showNotification('Bem-vindo de volta, ' + username + '!', 'success');
    }
    
    // Set current user
    RankedData.currentUser = username;
    RankedData.save();
    console.log('Dados salvos. CurrentUser:', RankedData.currentUser);
    
    // Update UI
    updateUserDisplay();
    closeLoginModal();
    UI.updateAllViews();
    
    // Show profile
    console.log('Mostrando pagina de perfil...');
    showPage('profile');
}

// Handle match submission
function handleMatchSubmit(event) {
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
    
    // Submit match
    const success = MatchSystem.submitMatch({
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
        UI.updateAllViews();
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
    } else {
        userNameEl.textContent = 'Visitante';
        userNameEl.style.cursor = 'default';
        userNameEl.onclick = null;
        btnLogin.textContent = 'LOGIN';
        btnLogin.onclick = showLoginModal;
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        RankedData.currentUser = null;
        RankedData.save();
        updateUserDisplay();
        showPage('home');
        UI.updateAllViews();
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
function filterLeaderboard(type) {
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render leaderboard with filter
    UI.renderLeaderboard(type);
}

// Show page (called from HTML)
function showPage(pageId) {
    UI.showPage(pageId);
}

// Filter leaderboard (called from HTML)
function filterLeaderboard(type) {
    UI.renderLeaderboard(type);
    
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
    addTestPlayers: () => {
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
        UI.updateAllViews();
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
