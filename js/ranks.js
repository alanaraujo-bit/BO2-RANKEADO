// BO2 RANKED - RANK SYSTEM

const RankSystem = {
    ranks: [
        { name: 'Bronze III', icon: '🥉', min: 0, max: 399, color: '#CD7F32' },
        { name: 'Bronze II', icon: '🥉', min: 400, max: 599, color: '#CD7F32' },
        { name: 'Bronze I', icon: '🥉', min: 600, max: 999, color: '#CD7F32' },
        
        { name: 'Prata III', icon: '🥈', min: 1000, max: 1199, color: '#C0C0C0' },
        { name: 'Prata II', icon: '🥈', min: 1200, max: 1399, color: '#C0C0C0' },
        { name: 'Prata I', icon: '🥈', min: 1400, max: 1499, color: '#C0C0C0' },
        
        { name: 'Ouro III', icon: '🥇', min: 1500, max: 1699, color: '#FFD700' },
        { name: 'Ouro II', icon: '🥇', min: 1700, max: 1899, color: '#FFD700' },
        { name: 'Ouro I', icon: '🥇', min: 1900, max: 1999, color: '#FFD700' },
        
        { name: 'Platina III', icon: '💎', min: 2000, max: 2199, color: '#E5E4E2' },
        { name: 'Platina II', icon: '💎', min: 2200, max: 2399, color: '#E5E4E2' },
        { name: 'Platina I', icon: '💎', min: 2400, max: 2499, color: '#E5E4E2' },
        
        { name: 'Diamante III', icon: '💠', min: 2500, max: 2699, color: '#B9F2FF' },
        { name: 'Diamante II', icon: '💠', min: 2700, max: 2899, color: '#B9F2FF' },
        { name: 'Diamante I', icon: '💠', min: 2900, max: 2999, color: '#B9F2FF' },
        
        { name: 'Mestre', icon: '👑', min: 3000, max: 3499, color: '#9370DB' },
        { name: 'Lenda', icon: '⚡', min: 3500, max: Infinity, color: '#FF1493' }
    ],
    
    // Get rank based on MMR
    getRank(mmr) {
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            const rank = this.ranks[i];
            if (mmr >= rank.min && mmr <= rank.max) {
                return rank;
            }
        }
        return this.ranks[0]; // Default to Bronze III
    },
    
    // Get rank info by name
    getRankByName(rankName) {
        return this.ranks.find(r => r.name === rankName);
    },
    
    // Get progress to next rank
    getRankProgress(mmr) {
        const currentRank = this.getRank(mmr);
        const currentIndex = this.ranks.findIndex(r => r.name === currentRank.name);
        
        if (currentIndex === this.ranks.length - 1) {
            // Already at max rank
            return {
                current: currentRank,
                next: null,
                progress: 100,
                mmrNeeded: 0
            };
        }
        
        const nextRank = this.ranks[currentIndex + 1];
        const rangeSize = currentRank.max - currentRank.min;
        const currentProgress = mmr - currentRank.min;
        const progress = Math.floor((currentProgress / rangeSize) * 100);
        const mmrNeeded = nextRank.min - mmr;
        
        return {
            current: currentRank,
            next: nextRank,
            progress: Math.max(0, Math.min(100, progress)),
            mmrNeeded: Math.max(0, mmrNeeded)
        };
    },
    
    // Check for rank up/down
    checkRankChange(oldMMR, newMMR) {
        const oldRank = this.getRank(oldMMR);
        const newRank = this.getRank(newMMR);
        
        if (oldRank.name !== newRank.name) {
            const rankUp = newMMR > oldMMR;
            return {
                changed: true,
                rankUp: rankUp,
                oldRank: oldRank,
                newRank: newRank
            };
        }
        
        return { changed: false };
    },
    
    // Get all ranks for display
    getAllRanks() {
        return this.ranks;
    },
    
    // Get rank tier (Bronze, Silver, etc)
    getRankTier(rankName) {
        if (rankName.includes('Bronze')) return 'bronze';
        if (rankName.includes('Prata')) return 'silver';
        if (rankName.includes('Ouro')) return 'gold';
        if (rankName.includes('Platina')) return 'platinum';
        if (rankName.includes('Diamante')) return 'diamond';
        if (rankName.includes('Mestre')) return 'master';
        if (rankName.includes('Lenda')) return 'legend';
        return 'bronze';
    }
};
