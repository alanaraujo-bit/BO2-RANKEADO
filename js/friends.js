/**
 * BO2 PLUTONIUM RANKED SYSTEM
 * Friends & Social System - ENHANCED VERSION
 * Manages friend requests, friendships, player profiles, and social features
 */

class FriendsSystem {
    constructor() {
        this.friends = [];
        this.friendRequests = { sent: [], received: [] };
        this.searchCache = new Map();
        this.searchTimeout = null;
        this.statusUpdateInterval = null;
        this.onlineUsers = new Set();
    }

    /**
     * Initialize friends system
     */
    async init() {
        if (!currentUser) return;
        
        await this.loadFriends();
        await this.loadFriendRequests();
        this.updateFriendsUI();
        this.loadSuggestedFriends();
        this.loadFriendsRanking();
        this.loadFriendsActivity();
        this.startStatusUpdates();
        this.setUserOnline();
    }

    /**
     * Set current user as online
     */
    async setUserOnline() {
        const userData = await getUserData(currentUser);
        if (userData) {
            userData.status = 'online';
            userData.lastOnline = Date.now();
            await updateUserData(currentUser, userData);
        }
    }

    /**
     * Start status update simulation (real-time simulation)
     */
    startStatusUpdates() {
        // Simulate online/offline status changes
        this.statusUpdateInterval = setInterval(() => {
            this.simulateStatusUpdates();
        }, 10000); // Update every 10 seconds
    }

    /**
     * Simulate status updates for friends
     */
    async simulateStatusUpdates() {
        // Randomly update some friends' status
        for (const friendUsername of this.friends) {
            const friendData = await getUserData(friendUsername);
            if (friendData && Math.random() < 0.1) { // 10% chance to change status
                const statuses = ['online', 'offline', 'in-match'];
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                friendData.status = newStatus;
                friendData.lastOnline = Date.now();
                await updateUserData(friendUsername, friendData);
            }
        }
        
        // Refresh UI to show updated status
        this.updateFriendsUI();
    }

    /**
     * Load user's friends list
     */
    async loadFriends() {
        try {
            const userData = await getUserData(currentUser);
            this.friends = userData?.friends || [];
            document.getElementById('friendsCount').textContent = this.friends.length;
        } catch (error) {
            console.error('Error loading friends:', error);
            this.friends = [];
        }
    }

    /**
     * Load pending friend requests
     */
    async loadFriendRequests() {
        try {
            const userData = await getUserData(currentUser);
            this.friendRequests = userData?.friendRequests || { sent: [], received: [] };
            
            // Show section only if there are received requests
            const section = document.getElementById('friendRequestsSection');
            if (this.friendRequests.received && this.friendRequests.received.length > 0) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
            
            // Update notification badge
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error loading friend requests:', error);
            this.friendRequests = { sent: [], received: [] };
        }
    }

    /**
     * Update notification badge in navbar
     */
    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const bell = document.getElementById('notificationBell');
        
        if (badge && bell) {
            const count = this.friendRequests.received ? this.friendRequests.received.length : 0;
            badge.textContent = count;
            
            if (count > 0) {
                bell.style.display = 'flex';
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Search for players by username
     */
    async searchPlayers(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        const resultsDiv = document.getElementById('searchResults');
        
        if (!query || query.trim().length < 2) {
            resultsDiv.innerHTML = '';
            resultsDiv.style.display = 'none';
            return;
        }

        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            try {
                const allPlayers = await getAllPlayers();
                const searchTerm = query.toLowerCase().trim();
                
                const matches = allPlayers
                    .filter(player => 
                        player.username.toLowerCase().includes(searchTerm) &&
                        player.username !== currentUser
                    )
                    .slice(0, 10);

                if (matches.length === 0) {
                    resultsDiv.innerHTML = '<div class="search-no-results">Nenhum jogador encontrado</div>';
                } else {
                    resultsDiv.innerHTML = matches.map(player => this.createSearchResultCard(player)).join('');
                }
                
                resultsDiv.style.display = 'block';
            } catch (error) {
                console.error('Error searching players:', error);
                resultsDiv.innerHTML = '<div class="search-error">Erro ao buscar jogadores</div>';
            }
        }, 300);
    }

    /**
     * Create search result card
     */
    createSearchResultCard(player) {
        const rankData = getRankFromMMR(player.mmr || 1000);
        const isFriend = this.friends.includes(player.username);
        const hasPendingRequest = this.friendRequests.some(req => req.from === player.username);
        
        let actionButton = '';
        if (isFriend) {
            actionButton = '<button class="btn-friend-remove" onclick="friendsSystem.removeFriend(\'' + player.username + '\')">❌ REMOVER</button>';
        } else if (hasPendingRequest) {
            actionButton = '<button class="btn-friend-pending" disabled>⏳ PENDENTE</button>';
        } else {
            actionButton = '<button class="btn-friend-add" onclick="friendsSystem.sendFriendRequest(\'' + player.username + '\')">➕ ADICIONAR</button>';
        }

        return `
            <div class="search-result-card" onclick="friendsSystem.openPlayerProfile('${player.username}')">
                <div class="search-result-info">
                    <div class="rank-icon-small">${rankData.icon}</div>
                    <div>
                        <div class="search-result-username">${player.username}</div>
                        <div class="search-result-rank">${rankData.name} - ${player.mmr || 1000} MMR</div>
                    </div>
                </div>
                <div class="search-result-action" onclick="event.stopPropagation()">
                    ${actionButton}
                </div>
            </div>
        `;
    }

    /**
     * Send friend request
     */
    async sendFriendRequest(targetUsername) {
        try {
            // Get both user data
            const userData = await getUserData(currentUser);
            const targetUser = await getUserData(targetUsername);
            
            if (!targetUser) {
                alert('Jogador não encontrado!');
                return;
            }

            // Check if already friends
            if (this.friends.includes(targetUsername)) {
                alert('Você já é amigo deste jogador!');
                return;
            }

            // Initialize friend requests if needed
            const userRequests = userData.friendRequests || { sent: [], received: [] };
            const targetRequests = targetUser.friendRequests || { sent: [], received: [] };

            // Check if request already sent
            if (userRequests.sent.some(req => req.to === targetUsername)) {
                alert('Solicitação já enviada!');
                return;
            }

            // Check if request already received from target
            if (userRequests.received.some(req => req.from === targetUsername)) {
                alert('Este jogador já enviou uma solicitação para você! Aceite-a na aba de solicitações.');
                return;
            }

            const requestData = {
                from: currentUser,
                to: targetUsername,
                timestamp: Date.now()
            };

            // Add to sent requests
            userRequests.sent.push({ to: targetUsername, timestamp: Date.now() });
            
            // Add to received requests of target
            targetRequests.received.push({ from: currentUser, timestamp: Date.now() });

            await updateUserData(currentUser, { friendRequests: userRequests });
            await updateUserData(targetUsername, { friendRequests: targetRequests });

            alert(`✅ Solicitação enviada para ${targetUsername}!`);
            
            // Clear search and refresh
            document.getElementById('playerSearchInput').value = '';
            document.getElementById('searchResults').style.display = 'none';
            
        } catch (error) {
            console.error('Error sending friend request:', error);
            alert('❌ Erro ao enviar solicitação!');
        }
    }

    /**
     * Accept friend request
     */
    async acceptFriendRequest(fromUsername) {
        try {
            // Add to both users' friends lists
            const myData = await getUserData(currentUser);
            const friendData = await getUserData(fromUsername);

            const myFriends = myData.friends || [];
            const friendFriends = friendData.friends || [];

            myFriends.push(fromUsername);
            friendFriends.push(currentUser);

            // Remove from received requests
            const myRequests = myData.friendRequests || { sent: [], received: [] };
            myRequests.received = myRequests.received.filter(req => req.from !== fromUsername);

            // Remove from sent requests of the friend
            const friendRequests = friendData.friendRequests || { sent: [], received: [] };
            friendRequests.sent = friendRequests.sent.filter(req => req.to !== currentUser);

            // Update both users
            await updateUserData(currentUser, {
                friends: myFriends,
                friendRequests: myRequests
            });

            await updateUserData(fromUsername, {
                friends: friendFriends,
                friendRequests: friendRequests
            });

            alert(`✅ Agora você é amigo de ${fromUsername}!`);
            await this.init();
            
        } catch (error) {
            console.error('Error accepting friend request:', error);
            alert('❌ Erro ao aceitar solicitação!');
        }
    }

    /**
     * Reject friend request
     */
    async rejectFriendRequest(fromUsername) {
        try {
            const myData = await getUserData(currentUser);
            const friendData = await getUserData(fromUsername);
            
            const myRequests = myData.friendRequests || { sent: [], received: [] };
            myRequests.received = myRequests.received.filter(req => req.from !== fromUsername);

            // Also remove from sender's sent requests
            const friendRequests = friendData.friendRequests || { sent: [], received: [] };
            friendRequests.sent = friendRequests.sent.filter(req => req.to !== currentUser);

            await updateUserData(currentUser, { friendRequests: myRequests });
            await updateUserData(fromUsername, { friendRequests: friendRequests });

            alert(`❌ Solicitação de ${fromUsername} rejeitada`);
            await this.init();
            
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            alert('❌ Erro ao rejeitar solicitação!');
        }
    }

    /**
     * Remove friend
     */
    async removeFriend(friendUsername) {
        if (!confirm(`Tem certeza que deseja remover ${friendUsername} dos seus amigos?`)) {
            return;
        }

        try {
            // Remove from both users
            const myData = await getUserData(currentUser);
            const friendData = await getUserData(friendUsername);

            const myFriends = (myData.friends || []).filter(f => f !== friendUsername);
            const friendFriends = (friendData.friends || []).filter(f => f !== currentUser);

            await updateUserData(currentUser, { friends: myFriends });
            await updateUserData(friendUsername, { friends: friendFriends });

            alert(`❌ ${friendUsername} removido dos seus amigos`);
            await this.init();
            
        } catch (error) {
            console.error('Error removing friend:', error);
            alert('❌ Erro ao remover amigo!');
        }
    }

    /**
     * Update friends UI
     */
    async updateFriendsUI() {
        // Update friend requests
        const requestsList = document.getElementById('friendRequestsList');
        if (!this.friendRequests.received || this.friendRequests.received.length === 0) {
            requestsList.innerHTML = '<div class="empty-state">Nenhuma solicitação pendente</div>';
        } else {
            const requestsHTML = await Promise.all(
                this.friendRequests.received.map(req => this.createFriendRequestCard(req))
            );
            requestsList.innerHTML = requestsHTML.join('');
        }

        // Update friends list
        const friendsList = document.getElementById('friendsList');
        if (this.friends.length === 0) {
            friendsList.innerHTML = '<div class="empty-state">Você ainda não tem amigos adicionados</div>';
        } else {
            const friendsHTML = await Promise.all(
                this.friends.map(username => this.createFriendCard(username))
            );
            friendsList.innerHTML = friendsHTML.join('');
        }
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status, lastOnline) {
        const statusConfig = {
            'online': { icon: '🟢', text: 'ONLINE', class: 'status-online' },
            'in-match': { icon: '🎮', text: 'EM PARTIDA', class: 'status-playing' },
            'offline': { icon: '⚫', text: this.getOfflineText(lastOnline), class: 'status-offline' }
        };
        
        const config = statusConfig[status] || statusConfig['offline'];
        return `<span class="status-badge ${config.class}">${config.icon} ${config.text}</span>`;
    }

    /**
     * Get offline time text
     */
    getOfflineText(lastOnline) {
        if (!lastOnline) return 'OFFLINE';
        const hours = Math.floor((Date.now() - lastOnline) / (1000 * 60 * 60));
        if (hours < 1) return 'OFFLINE';
        if (hours < 24) return `${hours}h atrás`;
        const days = Math.floor(hours / 24);
        return `${days}d atrás`;
    }

    /**
     * Create friend request card
     */
    async createFriendRequestCard(request) {
        const playerData = await getUserData(request.from);
        if (!playerData) return '';

        const rankData = getRankFromMMR(playerData.mmr || 1000);
        const timeAgo = this.getTimeAgo(request.timestamp);
        const avatarUrl = playerData.avatarUrl || `https://robohash.org/${request.from}?set=set4&size=200x200`;

        return `
            <div class="friend-card friend-request-card">
                <div class="friend-avatar-container">
                    <img src="${avatarUrl}" alt="${request.from}" class="friend-avatar-img" onerror="this.src='https://robohash.org/${request.from}?set=set4&size=200x200'">
                    <div class="rank-badge-overlay">${rankData.icon}</div>
                </div>
                <div class="friend-info">
                    <div class="friend-username" onclick="friendsSystem.openPlayerProfile('${request.from}')">${request.from}</div>
                    <div class="friend-user-id">${playerData.userId || 'BO2#0000'}</div>
                    <div class="friend-rank">${rankData.name}</div>
                    <div class="friend-mmr">🏆 ${playerData.mmr || 1000} MMR</div>
                    <div class="friend-time">⏰ ${timeAgo}</div>
                </div>
                <div class="friend-actions">
                    <button class="btn-accept" onclick="friendsSystem.acceptFriendRequest('${request.from}')">✅ ACEITAR</button>
                    <button class="btn-reject" onclick="friendsSystem.rejectFriendRequest('${request.from}')">❌ REJEITAR</button>
                </div>
            </div>
        `;
    }

    /**
     * Create friend card
     */
    async createFriendCard(username) {
        const playerData = await getUserData(username);
        if (!playerData) return '';

        const rankData = getRankFromMMR(playerData.mmr || 1000);
        const winrate = playerData.wins && playerData.totalMatches 
            ? ((playerData.wins / playerData.totalMatches) * 100).toFixed(1)
            : '0';
        const status = playerData.status || 'offline';
        const lastOnline = playerData.lastOnline || Date.now();
        const avatarUrl = playerData.avatarUrl || `https://robohash.org/${username}?set=set4&size=200x200`;

        return `
            <div class="friend-card ${status === 'online' ? 'friend-online' : ''}" onclick="friendsSystem.openPlayerProfile('${username}')">
                <div class="friend-avatar-container">
                    <img src="${avatarUrl}" alt="${username}" class="friend-avatar-img" onerror="this.src='https://robohash.org/${username}?set=set4&size=200x200'">
                    <div class="rank-badge-overlay">${rankData.icon}</div>
                    <div class="avatar-glow ${status === 'online' ? 'glow-online' : ''}"></div>
                </div>
                <div class="friend-info">
                    <div class="friend-username">${username}</div>
                    <div class="friend-user-id">${playerData.userId || 'BO2#0000'}</div>
                    ${this.getStatusBadge(status, lastOnline)}
                    <div class="friend-rank">${rankData.name}</div>
                    <div class="friend-stats">
                        <span>🎮 ${playerData.totalMatches || 0}</span>
                        <span>📊 ${winrate}%</span>
                        <span>🏆 ${playerData.mmr || 1000}</span>
                    </div>
                </div>
                <div class="friend-quick-actions">
                    <button class="btn-view-profile" onclick="event.stopPropagation(); friendsSystem.openPlayerProfile('${username}')">👁️ PERFIL</button>
                    ${status === 'online' ? '<button class="btn-invite-match" onclick="event.stopPropagation(); alert(\'🎮 Convite enviado!\')">🎮 CONVIDAR</button>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Load suggested friends
     */
    async loadSuggestedFriends() {
        try {
            const allPlayers = await getAllPlayers();
            const userData = await getUserData(currentUser);
            const currentMMR = userData?.mmr || 1000;
            
            const suggested = allPlayers
                .filter(player => 
                    player.username !== currentUser &&
                    !this.friends.includes(player.username)
                )
                // Sort by similar MMR
                .sort((a, b) => {
                    const diffA = Math.abs((a.mmr || 1000) - currentMMR);
                    const diffB = Math.abs((b.mmr || 1000) - currentMMR);
                    return diffA - diffB;
                })
                .slice(0, 6);

            const suggestedDiv = document.getElementById('suggestedFriends');
            if (suggested.length === 0) {
                suggestedDiv.innerHTML = '<div class="empty-state">Nenhuma sugestão disponível</div>';
            } else {
                const suggestedHTML = await Promise.all(
                    suggested.map(player => this.createSuggestedCard(player))
                );
                suggestedDiv.innerHTML = suggestedHTML.join('');
            }
        } catch (error) {
            console.error('Error loading suggested friends:', error);
        }
    }

    /**
     * Create suggested friend card
     */
    async createSuggestedCard(player) {
        const rankData = getRankFromMMR(player.mmr || 1000);
        const avatarUrl = player.avatarUrl || `https://robohash.org/${player.username}?set=set4&size=200x200`;

        return `
            <div class="friend-card suggested-card" onclick="friendsSystem.openPlayerProfile('${player.username}')">
                <div class="friend-avatar-container">
                    <img src="${avatarUrl}" alt="${player.username}" class="friend-avatar-img" onerror="this.src='https://robohash.org/${player.username}?set=set4&size=200x200'">
                    <div class="rank-badge-overlay">${rankData.icon}</div>
                </div>
                <div class="friend-info">
                    <div class="friend-username">${player.username}</div>
                    <div class="friend-user-id">${player.userId || 'BO2#0000'}</div>
                    <div class="friend-rank">${rankData.name}</div>
                    <div class="friend-mmr">🏆 ${player.mmr || 1000} MMR</div>
                </div>
                <button class="btn-friend-add-small" onclick="event.stopPropagation(); friendsSystem.sendFriendRequest('${player.username}')">➕ ADICIONAR</button>
            </div>
        `;
    }

    /**
     * Open player profile modal
     */
    async openPlayerProfile(username) {
        try {
            const playerData = await getUserData(username);
            if (!playerData) {
                alert('Jogador não encontrado!');
                return;
            }

            const rankData = getRankFromMMR(playerData.mmr || 1000);
            const winrate = playerData.wins && playerData.totalMatches
                ? ((playerData.wins / playerData.totalMatches) * 100).toFixed(1)
                : '0';

            // Update modal content
            document.getElementById('profileModalTitle').textContent = `PERFIL DE ${username.toUpperCase()}`;
            document.getElementById('profileUsername').textContent = username;
            document.getElementById('profileRankBadge').textContent = rankData.name;
            document.getElementById('profileRankIcon').textContent = rankData.icon;
            document.getElementById('profileMMR').textContent = playerData.mmr || 1000;
            document.getElementById('profileTotalMatches').textContent = playerData.totalMatches || 0;
            document.getElementById('profileWins').textContent = playerData.wins || 0;
            document.getElementById('profileLosses').textContent = playerData.losses || 0;
            document.getElementById('profileWinrate').textContent = winrate + '%';

            // Action buttons
            const actionButtons = document.getElementById('profileActionButtons');
            if (username === currentUser) {
                actionButtons.innerHTML = '<button class="btn-primary" onclick="showPage(\'profile\'); closePlayerProfile();">📝 EDITAR PERFIL</button>';
            } else {
                const isFriend = this.friends.includes(username);
                if (isFriend) {
                    actionButtons.innerHTML = `
                        <button class="btn-secondary" onclick="friendsSystem.removeFriend('${username}')">❌ REMOVER AMIGO</button>
                        <button class="btn-primary" onclick="closePlayerProfile(); showPage('play');">🎮 DESAFIAR</button>
                    `;
                } else {
                    actionButtons.innerHTML = `<button class="btn-primary" onclick="friendsSystem.sendFriendRequest('${username}')">➕ ADICIONAR AMIGO</button>`;
                }
            }

            // Load match history
            await this.loadPlayerMatchHistory(username);

            // Show modal
            document.getElementById('playerProfileModal').classList.add('active');
            
        } catch (error) {
            console.error('Error opening player profile:', error);
            alert('Erro ao carregar perfil!');
        }
    }

    /**
     * Load player match history
     */
    async loadPlayerMatchHistory(username) {
        try {
            const allMatches = await getAllMatches();
            const playerMatches = allMatches
                .filter(match => match.winner === username || match.loser === username)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10);

            const historyDiv = document.getElementById('profileMatchHistory');
            
            if (playerMatches.length === 0) {
                historyDiv.innerHTML = '<div class="empty-state">Nenhuma partida registrada</div>';
                return;
            }

            historyDiv.innerHTML = playerMatches.map(match => {
                const isWinner = match.winner === username;
                const opponent = isWinner ? match.loser : match.winner;
                const mmrChange = isWinner ? `+${match.mmrGain || 25}` : `-${match.mmrLoss || 25}`;
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

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Agora';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' min atrás';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h atrás';
        return Math.floor(seconds / 86400) + 'd atrás';
    }

    /**
     * Filter friends by status
     */
    async filterFriends(filter) {
        // Update active button
        document.querySelectorAll('.friend-filter-buttons .filter-btn-small').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        const friendsList = document.getElementById('friendsList');
        
        if (this.friends.length === 0) {
            friendsList.innerHTML = '<div class="empty-state">Você ainda não tem amigos adicionados</div>';
            return;
        }

        let filteredFriends = this.friends;
        
        if (filter === 'online') {
            filteredFriends = [];
            for (const username of this.friends) {
                const userData = await getUserData(username);
                if (userData && userData.status === 'online') {
                    filteredFriends.push(username);
                }
            }
        } else if (filter === 'playing') {
            filteredFriends = [];
            for (const username of this.friends) {
                const userData = await getUserData(username);
                if (userData && userData.status === 'in-match') {
                    filteredFriends.push(username);
                }
            }
        }

        if (filteredFriends.length === 0) {
            friendsList.innerHTML = `<div class="empty-state">Nenhum amigo ${filter === 'online' ? 'online' : filter === 'playing' ? 'jogando' : ''}</div>`;
        } else {
            const friendsHTML = await Promise.all(
                filteredFriends.map(username => this.createFriendCard(username))
            );
            friendsList.innerHTML = friendsHTML.join('');
        }
    }

    /**
     * Load friends ranking
     */
    async loadFriendsRanking() {
        try {
            const rankingDiv = document.getElementById('friendsRanking');
            
            if (this.friends.length === 0) {
                rankingDiv.innerHTML = '<div class="empty-state">Adicione amigos para ver o ranking!</div>';
                return;
            }

            // Get all friends data
            const friendsData = [];
            for (const username of this.friends) {
                const userData = await getUserData(username);
                if (userData) {
                    friendsData.push(userData);
                }
            }

            // Add current user
            const currentUserData = await getUserData(currentUser);
            if (currentUserData) {
                friendsData.push(currentUserData);
            }

            // Sort by MMR
            friendsData.sort((a, b) => (b.mmr || 1000) - (a.mmr || 1000));

            // Create ranking HTML
            const rankingHTML = friendsData.map((player, index) => {
                const rankData = getRankFromMMR(player.mmr || 1000);
                const isCurrentUser = player.username === currentUser;
                const winrate = player.wins && player.totalMatches 
                    ? ((player.wins / player.totalMatches) * 100).toFixed(1)
                    : '0';

                const positionIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                return `
                    <div class="ranking-item ${isCurrentUser ? 'ranking-current-user' : ''}" onclick="friendsSystem.openPlayerProfile('${player.username}')">
                        <div class="ranking-position">${positionIcon}</div>
                        <div class="ranking-avatar-small">
                            <img src="${player.avatarUrl || 'https://robohash.org/' + player.username + '?set=set4&size=200x200'}" 
                                 alt="${player.username}" 
                                 onerror="this.src='https://robohash.org/${player.username}?set=set4&size=200x200'">
                        </div>
                        <div class="ranking-info">
                            <div class="ranking-username">${player.username} ${isCurrentUser ? '(Você)' : ''}</div>
                            <div class="ranking-stats">
                                ${rankData.icon} ${rankData.name} • ${winrate}% WR
                            </div>
                        </div>
                        <div class="ranking-mmr">${player.mmr || 1000} <span>MMR</span></div>
                    </div>
                `;
            }).join('');

            rankingDiv.innerHTML = rankingHTML;

        } catch (error) {
            console.error('Error loading friends ranking:', error);
        }
    }

    /**
     * Load friends activity feed
     */
    async loadFriendsActivity() {
        try {
            const activityDiv = document.getElementById('friendsActivity');
            
            if (this.friends.length === 0) {
                activityDiv.innerHTML = '<div class="empty-state">Adicione amigos para ver suas atividades!</div>';
                return;
            }

            // Get all matches
            const allMatches = await getAllMatches();
            
            // Filter matches involving friends
            const friendMatches = allMatches
                .filter(match => 
                    this.friends.includes(match.winner) || 
                    this.friends.includes(match.loser)
                )
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10);

            if (friendMatches.length === 0) {
                activityDiv.innerHTML = '<div class="empty-state">Nenhuma atividade recente</div>';
                return;
            }

            const activityHTML = friendMatches.map(match => {
                const timeAgo = this.getTimeAgo(match.timestamp);
                const isWinner = this.friends.includes(match.winner);
                const friendInvolved = isWinner ? match.winner : match.loser;
                const opponent = isWinner ? match.loser : match.winner;

                return `
                    <div class="activity-item">
                        <div class="activity-icon">${isWinner ? '🏆' : '💔'}</div>
                        <div class="activity-content">
                            <div class="activity-text">
                                <strong>${friendInvolved}</strong> ${isWinner ? 'venceu' : 'perdeu para'} <strong>${opponent}</strong>
                            </div>
                            <div class="activity-time">${timeAgo}</div>
                        </div>
                        <div class="activity-mmr ${isWinner ? 'mmr-positive' : 'mmr-negative'}">
                            ${isWinner ? '+' : '-'}${match.mmrGain || match.mmrLoss || 25} MMR
                        </div>
                    </div>
                `;
            }).join('');

            activityDiv.innerHTML = activityHTML;

        } catch (error) {
            console.error('Error loading friends activity:', error);
        }
    }
}

// Global instance
const friendsSystem = new FriendsSystem();

// Global functions for HTML onclick
function searchPlayers(query) {
    friendsSystem.searchPlayers(query);
}

function closePlayerProfile() {
    document.getElementById('playerProfileModal').classList.remove('active');
}

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    const searchInput = document.getElementById('playerSearchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchResults) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (friendsSystem.statusUpdateInterval) {
        clearInterval(friendsSystem.statusUpdateInterval);
    }
});
