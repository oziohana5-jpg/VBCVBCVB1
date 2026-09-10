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

// ─── Raw MongoDB collections via the managers Store's live client ────────────
// We DON'T create separate Modelence Stores for these collections because new
// Stores fail with "not provisioned" on Render until the first write.
// Instead we grab dbManagers' underlying Collection object and call .db on it
// to get the Db, then open any collection name we want. MongoDB creates the
// collection automatically on the first write — no provisioning needed.

export function rawCol(name: string) {
  // dbManagers is always provisioned (it's the first/original Store).
  // rawCollection() returns the underlying mongodb.Collection object.
  // That object has a .db property (the mongodb.Db) we can reuse.
  const managersCol = (dbManagers as any).rawCollection() as import('mongodb').Collection;
  return managersCol.db.collection(name);
}

// Thin typed wrappers — callers use ._col() so the collection is resolved lazily
export const dbNews           = { _col: () => rawCol('managerNews') };
export const dbEvents         = { _col: () => rawCol('managerEvents') };
export const dbEventProgress  = { _col: () => rawCol('managerEventProgress') };
export const dbFriends        = { _col: () => rawCol('managerFriends') };
export const dbChallenges     = { _col: () => rawCol('managerChallenges') };
