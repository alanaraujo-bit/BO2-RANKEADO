/* ===================================================================
   BO2 RANKED - SEASON MODELS
   MongoDB/Mongoose models for Season system
   ================================================================ */

// Season Model Schema
const SeasonSchema = {
    name: String,              // "Season 1: Genesis", "Season 2: Uprising"
    description: String,       // Season theme description
    startDate: Date,           // Season start timestamp
    endDate: Date,             // Season end timestamp
    active: Boolean,           // Only one season can be active
    rewards: {
        top1: {
            badge: String,     // Badge/Title for 1st place
            icon: String,      // Icon/emoji
            color: String      // Color for display
        },
        top2: {
            badge: String,
            icon: String,
            color: String
        },
        top3: {
            badge: String,
            icon: String,
            color: String
        },
        participation: {
            badge: String,     // Badge for everyone who participated
            icon: String
        }
    },
    settings: {
        minGamesForRank: Number,  // Minimum games to qualify for rewards
        mmrDecayDays: Number,     // Days of inactivity before MMR decay
        mmrDecayAmount: Number    // MMR lost per decay period
    },
    createdAt: Date,
    updatedAt: Date
};

// PlayerSeasonProgress Model Schema
const PlayerSeasonProgressSchema = {
    playerId: String,          // Player username
    seasonId: String,          // Season ObjectId or identifier
    seasonName: String,        // Cached season name
    mmr: Number,               // Season-specific MMR (starts at 1000)
    rank: String,              // Current rank in season
    wins: Number,
    losses: Number,
    gamesPlayed: Number,
    totalKills: Number,
    totalDeaths: Number,
    kd: Number,                // Calculated K/D ratio
    winRate: Number,           // Calculated win percentage
    winStreak: Number,         // Current win streak
    bestStreak: Number,        // Best win streak in season
    finalRank: Number,         // Final leaderboard position (set at season end)
    rewardEarned: Object,      // Badge/reward earned
    lastMatchDate: Date,       // Last match played in this season
    qualified: Boolean,        // Met minimum games requirement
    createdAt: Date,
    updatedAt: Date
};

// Export for use in Node.js backend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SeasonSchema,
        PlayerSeasonProgressSchema
    };
}
