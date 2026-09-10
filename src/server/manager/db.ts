import { Store, schema } from 'modelence/server';
import { Collection } from 'mongodb';

// ─── Modelence Stores (provisioned normally by the framework) ────────────────

// מצב מנהל - קבוצה, תקציב, שחקנים
export const dbManagers = new Store('managers', {
  schema: {
    userId: schema.userId(),
    discordId: schema.string(),
    discordUsername: schema.string(),
    discordAvatar: schema.string(),
    teamAbbr: schema.string(),
    budget: schema.number(),
    wins: schema.number(),
    draws: schema.number(),
    losses: schema.number(),
    goalsFor: schema.number(),
    goalsAgainst: schema.number(),
    createdAt: schema.date(),
    lastSeen: schema.date(),
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

// ─── Direct MongoDB access via dbManagers' live client ───────────────────────
// We use dbManagers.getDatabase() — the OFFICIAL Modelence Store API —
// to get the same Db instance that Modelence already uses internally.
// This means no separate MongoClient, no extra env vars, no connection string needed.
// getDatabase() throws "not provisioned" only if the Store hasn't been init'd yet,
// but since dbManagers is registered in the module's stores[] array it's ALWAYS
// ready before any query/mutation runs.

function rawCol(name: string): Collection<any> {
  // getDatabase() is the official public API — returns the mongodb.Db instance
  const db = dbManagers.getDatabase();
  return db.collection(name);
}

// Lazy collection accessor — synchronous now, no Promise needed
async function col(name: string): Promise<Collection<any>> {
  return rawCol(name);
}

// ─── Typed lazy wrappers ─────────────────────────────────────────────────────
export const dbNews           = { _col: () => col('managerNews') };
export const dbEvents         = { _col: () => col('managerEvents') };
export const dbEventProgress  = { _col: () => col('managerEventProgress') };
export const dbFriends        = { _col: () => col('managerFriends') };
export const dbChallenges     = { _col: () => col('managerChallenges') };
