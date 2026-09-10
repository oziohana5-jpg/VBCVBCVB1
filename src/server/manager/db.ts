import { Store, schema } from 'modelence/server';

// מצב מנהל - קבוצה, תקציב, שחקנים
export const dbManagers = new Store('managers', {
  schema: {
    userId: schema.userId(),
    discordId: schema.string(),
    discordUsername: schema.string(),
    discordAvatar: schema.string(),
    teamAbbr: schema.string(),       // קבוצה שנבחרה
    budget: schema.number(),          // תקציב בשקלים
    wins: schema.number(),
    draws: schema.number(),
    losses: schema.number(),
    goalsFor: schema.number(),
    goalsAgainst: schema.number(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 }, unique: true },
    { key: { discordId: 1 }, unique: true },
  ]
});

// שחקנים שנרכשו על ידי המנהל
export const dbManagerPlayers = new Store('managerPlayers', {
  schema: {
    userId: schema.userId(),
    playerId: schema.string(),       // ID ייחודי של השחקן
    playerName: schema.string(),
    teamAbbr: schema.string(),       // קבוצת השחקן המקורית
    position: schema.string(),       // GK/DF/MF/ST
    ovr: schema.number(),
    pac: schema.number(),
    sho: schema.number(),
    pas: schema.number(),
    dri: schema.number(),
    def: schema.number(),
    phy: schema.number(),
    marketValue: schema.number(),    // ערך שוק בשקלים
    purchasePrice: schema.number(),  // מחיר שנרכש
    purchasedAt: schema.date(),
    isStarter: schema.boolean(),     // האם בהרכב הפותח
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { playerId: 1 } },
  ]
});

// כתבות חדשות (גלובלי — כותב מנהל מערכת, קורא כולם)
export const dbNews = new Store('newsArticles', {
  schema: {
    tag: schema.string(),
    title: schema.string(),
    excerpt: schema.string(),
    image: schema.string(),
    author: schema.string(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { createdAt: -1 } },
  ]
});

// אירועים/אתגרים (גלובלי — נוצרים על ידי אדמין)
export const dbEvents = new Store('events', {
  schema: {
    title: schema.string(),
    description: schema.string(),
    type: schema.string(),        // 'win_streak' | 'goals' | 'matches'
    target: schema.number(),      // כמות נדרשת (5 ניצחונות ברצף וכו׳)
    reward: schema.number(),      // ₪ שכר
    active: schema.boolean(),
    createdAt: schema.date(),
    expiresAt: schema.date(),
  },
  indexes: [
    { key: { active: 1 } },
    { key: { createdAt: -1 } },
  ]
});

// התקדמות אירועים לכל משתמש
export const dbEventProgress = new Store('eventProgress', {
  schema: {
    userId: schema.userId(),
    eventId: schema.string(),
    progress: schema.number(),
    completed: schema.boolean(),
    completedAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { eventId: 1 } },
    { key: { userId: 1, eventId: 1 }, unique: true },
  ]
});

// חברות
export const dbFriends = new Store('friends', {
  schema: {
    fromUserId: schema.userId(),
    toUserId: schema.userId(),
    fromUsername: schema.string(),
    toUsername: schema.string(),
    fromAvatar: schema.string(),
    toAvatar: schema.string(),
    status: schema.string(),      // 'pending' | 'accepted'
    createdAt: schema.date(),
  },
  indexes: [
    { key: { fromUserId: 1 } },
    { key: { toUserId: 1 } },
  ]
});

// אתגרי 1v1
export const dbChallenges = new Store('challenges', {
  schema: {
    fromUserId: schema.userId(),
    toUserId: schema.userId(),
    fromUsername: schema.string(),
    toUsername: schema.string(),
    fromTeamAbbr: schema.string(),
    toTeamAbbr: schema.string(),
    status: schema.string(),      // 'pending' | 'accepted' | 'completed' | 'declined'
    fromScore: schema.number(),
    toScore: schema.number(),
    winnerId: schema.string(),
    createdAt: schema.date(),
    completedAt: schema.date(),
  },
  indexes: [
    { key: { fromUserId: 1 } },
    { key: { toUserId: 1 } },
    { key: { status: 1 } },
  ]
});

// תוצאות משחקים
export const dbMatchResults = new Store('matchResults', {
  schema: {
    userId: schema.userId(),
    homeTeam: schema.string(),
    awayTeam: schema.string(),
    homeScore: schema.number(),
    awayScore: schema.number(),
    playedAt: schema.date(),
    isUserHome: schema.boolean(),
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { playedAt: -1 } },
  ]
});
