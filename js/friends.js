/**
 * BO2 PLUTONIUM RANKED SYSTEM
 * Friends & Social System
 * Manages friend requests, friendships, and player profiles
 */

class FriendsSystem {
    constructor() {
        this.friends = [];
        this.friendRequests = [];
        this.searchCache = new Map();
        this.searchTimeout = null;
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
            this.friendRequests = userData?.friendRequests || [];
            
            // Show section only if there are requests
            const section = document.getElementById('friendRequestsSection');
            if (this.friendRequests.length > 0) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
            
            // Update notification badge
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error loading friend requests:', error);
            this.friendRequests = [];
        }
    }

    /**
     * Update notification badge in navbar
     */
    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const bell = document.getElementById('notificationBell');
        
        if (badge && bell) {
            const count = this.friendRequests.length;
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
            // Get target user data
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

            // Check if request already sent
            const targetRequests = targetUser.friendRequests || [];
            if (targetRequests.some(req => req.from === currentUser)) {
                alert('Solicitação já enviada!');
                return;
            }

            // Add request to target user
            targetRequests.push({
                from: currentUser,
                timestamp: Date.now()
            });

            await updateUserData(targetUsername, {
                friendRequests: targetRequests
            });

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

            // Remove request
            const myRequests = (myData.friendRequests || []).filter(req => req.from !== fromUsername);

            // Update both users
            await updateUserData(currentUser, {
                friends: myFriends,
                friendRequests: myRequests
            });

            await updateUserData(fromUsername, {
                friends: friendFriends
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
            const myRequests = (myData.friendRequests || []).filter(req => req.from !== fromUsername);

            await updateUserData(currentUser, {
                friendRequests: myRequests
            });

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
        if (this.friendRequests.length === 0) {
            requestsList.innerHTML = '<div class="empty-state">Nenhuma solicitação pendente</div>';
        } else {
            const requestsHTML = await Promise.all(
                this.friendRequests.map(req => this.createFriendRequestCard(req))
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
     * Create friend request card
     */
    async createFriendRequestCard(request) {
        const playerData = await getUserData(request.from);
        if (!playerData) return '';

        const rankData = getRankFromMMR(playerData.mmr || 1000);
        const timeAgo = this.getTimeAgo(request.timestamp);

        return `
            <div class="friend-card friend-request-card">
                <div class="friend-avatar">
                    <div class="rank-icon-medium">${rankData.icon}</div>
                </div>
                <div class="friend-info">
                    <div class="friend-username" onclick="friendsSystem.openPlayerProfile('${request.from}')">${request.from}</div>
                    <div class="friend-rank">${rankData.name}</div>
                    <div class="friend-mmr">${playerData.mmr || 1000} MMR</div>
                    <div class="friend-time">${timeAgo}</div>
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

        return `
            <div class="friend-card" onclick="friendsSystem.openPlayerProfile('${username}')">
                <div class="friend-avatar">
                    <div class="rank-icon-medium">${rankData.icon}</div>
                </div>
                <div class="friend-info">
                    <div class="friend-username">${username}</div>
                    <div class="friend-rank">${rankData.name}</div>
                    <div class="friend-stats">
                        <span>🎮 ${playerData.totalMatches || 0}</span>
                        <span>📊 ${winrate}%</span>
                        <span>🏆 ${playerData.mmr || 1000} MMR</span>
                    </div>
                </div>
                <button class="btn-view-profile">VER PERFIL →</button>
            </div>
        `;
    }

    /**
     * Load suggested friends
     */
    async loadSuggestedFriends() {
        try {
            const allPlayers = await getAllPlayers();
            const suggested = allPlayers
                .filter(player => 
                    player.username !== currentUser &&
                    !this.friends.includes(player.username)
                )
                .sort((a, b) => (b.mmr || 1000) - (a.mmr || 1000))
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

        return `
            <div class="friend-card suggested-card" onclick="friendsSystem.openPlayerProfile('${player.username}')">
                <div class="friend-avatar">
                    <div class="rank-icon-medium">${rankData.icon}</div>
                </div>
                <div class="friend-info">
                    <div class="friend-username">${player.username}</div>
                    <div class="friend-rank">${rankData.name}</div>
                    <div class="friend-mmr">${player.mmr || 1000} MMR</div>
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
