import { Store, schema } from 'modelence/server';
import { MongoClient, Collection } from 'mongodb';

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

// ─── Direct MongoDB client for unmanaged collections ─────────────────────────
// Strategy (in order):
//  1. Try dbManagers.getDatabase() — works after the Store is fully init'd
//  2. Fall back to a direct MongoClient using MONGODB_URI env var

let _directClient: MongoClient | null = null;
let _directConnectPromise: Promise<MongoClient> | null = null;

async function getDirectClient(): Promise<MongoClient> {
  if (_directClient) return _directClient;
  if (_directConnectPromise) return _directConnectPromise;

  _directConnectPromise = (async () => {
    // Modelence uses MODELENCE_MONGODB_URI internally; fallback to MONGODB_URI
    const uri = process.env.MODELENCE_MONGODB_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('Neither MODELENCE_MONGODB_URI nor MONGODB_URI is set');
    const client = new MongoClient(uri);
    await client.connect();
    _directClient = client;
    console.log('[db] Direct MongoClient connected');
    return client;
  })();

  return _directConnectPromise;
}

async function col(name: string): Promise<Collection<any>> {
  // Try the Store's live Db first (zero overhead, same connection)
  try {
    const db = dbManagers.getDatabase();
    return db.collection(name);
  } catch {
    // Store not yet fully provisioned — use direct client
    const client = await getDirectClient();
    const uri = process.env.MODELENCE_MONGODB_URI || process.env.MONGODB_URI!;
    const uriObj = new URL(uri);
    const dbName = uriObj.pathname.replace(/^\//, '') || 'forteenite';
    return client.db(dbName).collection(name);
  }
}

// ─── Typed lazy wrappers ─────────────────────────────────────────────────────
export const dbNews           = { _col: () => col('managerNews') };
export const dbEvents         = { _col: () => col('managerEvents') };
export const dbEventProgress  = { _col: () => col('managerEventProgress') };
export const dbFriends        = { _col: () => col('managerFriends') };
export const dbChallenges     = { _col: () => col('managerChallenges') };
