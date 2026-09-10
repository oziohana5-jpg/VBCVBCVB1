import { Store, schema } from 'modelence/server';
import { MongoClient, Db, Collection } from 'mongodb';

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

// ─── Direct MongoDB client for "unmanaged" collections ───────────────────────
// Collections like news/events/friends/challenges are NOT Modelence Stores —
// they're plain MongoDB collections we create ourselves. We connect with the
// same MONGODB_URI env var that Modelence uses, but via our own MongoClient so
// we're never blocked by the framework's provisioning lifecycle.

let _client: MongoClient | null = null;
let _db: Db | null = null;
let _connectPromise: Promise<Db> | null = null;

async function getDb(): Promise<Db> {
  if (_db) return _db;
  if (_connectPromise) return _connectPromise;

  _connectPromise = (async () => {
    // Modelence may use different env var names depending on the platform.
    // Try all known names in order of preference.
    const uri =
      process.env.MONGODB_URI ||
      process.env.MODELENCE_MONGODB_URI ||
      process.env.MONGO_URL ||
      process.env.DATABASE_URL;

    if (!uri) {
      const known = ['MONGODB_URI', 'MODELENCE_MONGODB_URI', 'MONGO_URL', 'DATABASE_URL'];
      throw new Error(
        `No MongoDB URI found. Checked: ${known.join(', ')}. ` +
        `Please set one of these environment variables in your Render/deployment settings.`
      );
    }

    console.log('[db] Connecting to MongoDB (URI source: ' +
      (process.env.MONGODB_URI ? 'MONGODB_URI' :
       process.env.MODELENCE_MONGODB_URI ? 'MODELENCE_MONGODB_URI' :
       process.env.MONGO_URL ? 'MONGO_URL' : 'DATABASE_URL') + ')');

    // Parse the database name from the URI (everything after the last '/' before '?')
    const uriObj = new URL(uri);
    const dbName = uriObj.pathname.replace(/^\//, '') || 'modelence';

    _client = new MongoClient(uri);
    await _client.connect();
    _db = _client.db(dbName);
    console.log('[db] Connected to database:', dbName);
    return _db;
  })();

  return _connectPromise;
}

// Lazy collection accessor — call col() to get a ready Collection<any>
async function col(name: string): Promise<Collection<any>> {
  const db = await getDb();
  return db.collection(name);
}

// ─── Typed lazy wrappers ─────────────────────────────────────────────────────
// Each wrapper exposes a `_col()` async method that returns the Collection.
// Usage: `await dbNews._col()` then call MongoDB methods on it.

export const dbNews           = { _col: () => col('managerNews') };
export const dbEvents         = { _col: () => col('managerEvents') };
export const dbEventProgress  = { _col: () => col('managerEventProgress') };
export const dbFriends        = { _col: () => col('managerFriends') };
export const dbChallenges     = { _col: () => col('managerChallenges') };
