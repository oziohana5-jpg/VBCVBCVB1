import { dbManagers } from '@/server/manager/db';

/**
 * Migration v2: ensure all manager collections are provisioned in MongoDB.
 *
 * Modelence calls Store.init(mongoClient) at startup — but only if the
 * collection already exists in MongoDB, OR if the Store is successfully
 * registered. When a new Store is added after the first deploy the MongoDB
 * collection is missing and every operation throws "Collection X is not
 * provisioned".
 *
 * Fix: use the ALREADY-WORKING dbManagers store to grab the raw MongoClient,
 * then call db.createCollection() for every collection that might be missing.
 * createCollection is a no-op on Mongo if the collection already exists.
 */
export async function provisionNewsCollection() {
  const collectionNames = [
    'managerNews',
    'managerEvents',
    'managerEventProgress',
    'managerFriends',
    'managerChallenges',
    'matchResults',
    'managerPlayers',
  ];

  try {
    // rawCollection() gives us access to the underlying MongoDB collection
    // object which belongs to the connected MongoClient/Db.
    const db = (dbManagers as any).getDatabase?.() ?? (dbManagers as any).requireClient?.()?.db?.();
    if (!db) {
      console.warn('[migration v2] Could not obtain MongoDB Db instance – skipping collection provisioning');
      return;
    }

    const existing = await db.listCollections().toArray() as Array<{ name: string }>;
    const existingNames = new Set(existing.map((c) => c.name));

    for (const name of collectionNames) {
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        console.log(`[migration v2] Created collection: ${name}`);
      }
    }
  } catch (err: any) {
    // If this fails we log and continue — worst case the user sees the error
    // again, but we don't want a migration bug to block the whole startup.
    console.error('[migration v2] provisionNewsCollection error:', err?.message);
  }
}
