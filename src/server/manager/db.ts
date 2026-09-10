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
    lastSeen: schema.date(),         // לסטטוס אונליין/אופליין
  },
  indexes: [
    { key: { userId: 1 }, unique: true },
    { key: { discordId: 1 }, unique: true },
    { key: { lastSeen: -1 } },
  ]
});

// שחקנים שנרכשו על ידי המנהל
export const dbManagerPlayers = new Store('managerPlayers', {
  schema: {
    userId: schema.userId(),
    playerId: schema.string(),
    playerName: schema.string(),
    teamAbbr: schema.string(),
    position: schema.string(),
    ovr: schema.number(),
    pac: schema.number(),
    sho: schema.number(),
    pas: schema.number(),
    dri: schema.number(),
    def: schema.number(),
    phy: schema.number(),
    marketValue: schema.number(),
    purchasePrice: schema.number(),
    purchasedAt: schema.date(),
    isStarter: schema.boolean(),
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { playerId: 1 } },
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

// ─── Collections that use rawCollection() directly ─────────────────────────
// These are NOT separate Store objects to avoid "Store collision" errors in
// Modelence when multiple Stores share a collection name.
// Instead, we expose a helper that uses dbManagers' already-provisioned
// MongoClient to get a raw MongoDB collection by name.

export function rawCol(name: string) {
  const db = (dbManagers as any).getDatabase() as import('mongodb').Db;
  return db.collection(name);
}

// Thin typed wrappers so callers don't need to import mongodb directly:
export const dbNews        = { _col: () => rawCol('managerNews') };
export const dbEvents      = { _col: () => rawCol('managerEvents') };
export const dbEventProgress = { _col: () => rawCol('managerEventProgress') };
export const dbFriends     = { _col: () => rawCol('managerFriends') };
export const dbChallenges  = { _col: () => rawCol('managerChallenges') };
