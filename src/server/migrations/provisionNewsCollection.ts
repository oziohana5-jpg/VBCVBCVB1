import { dbNews, dbEvents, dbEventProgress, dbFriends, dbChallenges } from '@/server/manager/db';

/**
 * Migration v2: ensure all manager collections are provisioned in MongoDB.
 * Modelence provisions a Store's collection the first time a write occurs.
 * On fresh deploys these collections may not exist yet — we seed + immediately
 * delete a placeholder document so MongoDB creates each collection before any
 * user action tries to use it.
 */
export async function provisionNewsCollection() {
  const collections = [dbNews, dbEvents, dbEventProgress, dbFriends, dbChallenges] as const;

  for (const store of collections) {
    try {
      // insertOne creates the collection if it doesn't exist, then we clean up
      const doc = await (store as any).insertOne({
        _migration: true,
        createdAt: new Date(),
      });
      await (store as any).deleteOne({ _id: doc._id });
    } catch {
      // already provisioned or schema validation — both are fine
    }
  }
}
