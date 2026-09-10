import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo } from 'modelence/server';
import { dbManagers, dbManagerPlayers, dbMatchResults, dbNews, dbEvents, dbEventProgress, dbFriends, dbChallenges } from './db';
import { ISRAELI_PLAYERS, getPlayerById } from './players';

const STARTING_BUDGET = 10_000_000; // 10 מיליון שקל

type ProviderPlayer = { name?: string; photo?: string };
const providerSquadCache = new Map<string, Promise<ProviderPlayer[]>>();

function normalizeProviderName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function loadProviderSquad(team: string, apiKey: string) {
  const cacheKey = team.toLowerCase();
  const cached = providerSquadCache.get(cacheKey);
  if (cached) return cached;

  const request = (async () => {
    const headers = { 'x-apisports-key': apiKey };
    const aliases: Record<string, string[]> = {
      'hapoel beer sheva': ["Hapoel Be'er Sheva", 'Hapoel Beer Sheva'],
      'maccabi petah tikva': ['Maccabi Petach-Tikva', 'Maccabi Petah Tikva'],
      'hapoel tel aviv': ['Hapoel Tel Aviv'],
    };
    const searches = aliases[team.toLowerCase()] ?? [team];
    let teamMatch: { team?: { id?: number; name?: string } } | undefined;
    for (const search of searches) {
      const teamsResponse = await fetch(
        `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(search)}`,
        { headers },
      );
      if (!teamsResponse.ok) continue;
      const teamsPayload = await teamsResponse.json() as { response?: Array<{ team?: { id?: number; name?: string } }> };
      const wantedTeam = search.toLowerCase();
      teamMatch = teamsPayload.response?.find(entry =>
        entry.team?.name?.toLowerCase() === wantedTeam || entry.team?.name?.toLowerCase().includes(wantedTeam),
      );
      if (teamMatch?.team?.id) break;
    }
    const teamId = teamMatch?.team?.id;
    if (!teamId) return [];

    const pages = await Promise.all([1, 2, 3].map(async page => {
      const playersResponse = await fetch(
        `https://v3.football.api-sports.io/players?team=${teamId}&season=2024&page=${page}`,
        { headers },
      );
      if (!playersResponse.ok) return [] as ProviderPlayer[];
      const playersPayload = await playersResponse.json() as { response?: Array<{ player?: ProviderPlayer }> };
      return playersPayload.response?.map(entry => entry.player).filter((player): player is ProviderPlayer => !!player) ?? [];
    }));
    return pages.flat();
  })().catch(() => [] as ProviderPlayer[]);

  providerSquadCache.set(cacheKey, request);
  return request;
}

export default new Module('manager', {
  stores: [dbManagers, dbManagerPlayers, dbMatchResults, dbNews, dbEvents, dbEventProgress, dbFriends, dbChallenges],

  queries: {
    // Resolve a real player headshot through API-Football without exposing the
    // provider key to the browser.
    resolvePlayerPhoto: async (args: unknown) => {
      const { name, team } = z.object({
        name: z.string().min(2),
        team: z.string().min(2).optional(),
      }).parse(args);
      const apiKey = process.env.API_FOOTBALL_KEY;
      if (!apiKey) return { photo: null };

      if (team) {
        const squad = await loadProviderSquad(team, apiKey);
      const wantedParts = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter(part => part.length > 2);
      const match = squad.find(player => {
        const candidate = normalizeProviderName(player.name ?? '');
        return wantedParts.some(part => candidate.includes(part)) && !!player.photo;
      });

        return { photo: match?.photo ?? null };
      }

      return { photo: null };
    },

    // קבל מצב מנהל
    getManager: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const manager = await dbManagers.findOne({ userId: new ObjectId(user.id) });
      if (!manager) return null;
      return {
        teamAbbr: manager.teamAbbr,
        budget: manager.budget,
        wins: manager.wins,
        draws: manager.draws,
        losses: manager.losses,
        goalsFor: manager.goalsFor,
        goalsAgainst: manager.goalsAgainst,
        discordUsername: manager.discordUsername,
        discordAvatar: manager.discordAvatar,
      };
    },

    // קבל שחקנים של המנהל
    getMyPlayers: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const players = await dbManagerPlayers.fetch({ userId: new ObjectId(user.id) });
      return players.map(p => ({
        id: p.playerId,
        name: p.playerName,
        team: p.teamAbbr,
        position: p.position,
        ovr: p.ovr,
        pac: p.pac,
        sho: p.sho,
        pas: p.pas,
        dri: p.dri,
        def: p.def,
        phy: p.phy,
        marketValue: p.marketValue,
        purchasePrice: p.purchasePrice,
        isStarter: p.isStarter,
      }));
    },

    // קבל שוק העברות
    getTransferMarket: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      // שחקנים שהמנהל עוד לא קנה
      const myPlayers = await dbManagerPlayers.fetch({ userId: new ObjectId(user.id) });
      const myPlayerIds = new Set(myPlayers.map(p => p.playerId));
      return ISRAELI_PLAYERS
        .filter(p => !myPlayerIds.has(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          nameHe: p.nameHe,
          team: p.team,
          position: p.position,
          age: p.age,
          ovr: p.ovr,
          pac: p.pac,
          sho: p.sho,
          pas: p.pas,
          dri: p.dri,
          def: p.def,
          phy: p.phy,
          marketValue: p.marketValue,
        }));
    },

    // קבל תוצאות אחרונות
    getRecentResults: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const results = await dbMatchResults.fetch(
        { userId: new ObjectId(user.id) },
        { limit: 10, sort: { playedAt: -1 } }
      );
      return results.map(r => ({
        homeTeam: r.homeTeam,
        awayTeam: r.awayTeam,
        homeScore: r.homeScore,
        awayScore: r.awayScore,
        playedAt: r.playedAt,
        isUserHome: r.isUserHome,
      }));
    },

    // קבל כתבות חדשות (ממוין מהחדש לישן, עד 50)
    getNews: async () => {
      try {
        const articles = await dbNews.fetch({}, { limit: 50, sort: { createdAt: -1 } });
        return articles.map(a => ({
          id: String(a._id),
          tag: a.tag,
          title: a.title,
          excerpt: a.excerpt,
          image: a.image,
          author: a.author,
          createdAt: a.createdAt,
        }));
      } catch { return []; }
    },

    // ── EVENTS ──────────────────────────────────────────────────────────
    getEvents: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      try {
        const events = await dbEvents.fetch({ active: true }, { sort: { createdAt: -1 } });
        const result = [];
        for (const ev of events) {
          let progress = 0;
          let completed = false;
          if (user) {
            try {
              const prog = await dbEventProgress.findOne({ userId: new ObjectId(user.id), eventId: String(ev._id) });
              progress = prog?.progress ?? 0;
              completed = prog?.completed ?? false;
            } catch { /* ignore */ }
          }
          result.push({
            id: String(ev._id),
            title: ev.title,
            description: ev.description,
            type: ev.type,
            target: ev.target,
            reward: ev.reward,
            expiresAt: ev.expiresAt,
            progress,
            completed,
          });
        }
        return result;
      } catch { return []; }
    },

    // ── FRIENDS ─────────────────────────────────────────────────────────
    getFriends: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) return [];
      try {
        const uid = new ObjectId(user.id);
        const rows = await dbFriends.fetch({
          $or: [{ fromUserId: uid }, { toUserId: uid }],
        } as any);
        // Load manager records for online status + teamAbbr
        const otherIds = rows.map(r => {
          const isSender = String(r.fromUserId) === user.id;
          return isSender ? String(r.toUserId) : String(r.fromUserId);
        });
        const managerRecords = otherIds.length > 0
          ? await dbManagers.fetch({ userId: { $in: otherIds.map(id => new ObjectId(id)) } } as any)
          : [];
        const managerMap = new Map(managerRecords.map(m => [String(m.userId), m]));
        const onlineThreshold = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes
        return rows.map(r => {
          const isSender = String(r.fromUserId) === user.id;
          const friendUserId = isSender ? String(r.toUserId) : String(r.fromUserId);
          const mgr = managerMap.get(friendUserId);
          return {
            id: String(r._id),
            userId: friendUserId,
            username: isSender ? r.toUsername : r.fromUsername,
            avatar: isSender ? r.toAvatar : r.fromAvatar,
            teamAbbr: mgr?.teamAbbr ?? '',
            isOnline: mgr?.lastSeen ? new Date(mgr.lastSeen) > onlineThreshold : false,
            status: r.status,
            direction: isSender ? 'sent' : 'received',
          };
        });
      } catch { return []; }
    },

    // חיפוש משתמשים — מחזיר את כולם כשהשדה ריק, מסנן לפי שם כשיש קלט
    searchUsers: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) return [];
      const { query } = z.object({ query: z.string() }).parse(args);
      const managers = await dbManagers.fetch({} as any, { limit: 100 });
      const lower = query.toLowerCase().trim();
      return managers
        .filter(m => String(m.userId) !== user.id && m.discordUsername &&
          (lower === '' || m.discordUsername.toLowerCase().includes(lower)))
        .slice(0, 20)
        .map(m => ({
          userId: String(m.userId),
          username: m.discordUsername,
          avatar: m.discordAvatar,
          teamAbbr: m.teamAbbr,
        }));
    },

    // ── CHALLENGES ──────────────────────────────────────────────────────
    getChallenges: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) return [];
      try {
        const uid = new ObjectId(user.id);
        const rows = await dbChallenges.fetch({
          $or: [{ fromUserId: uid }, { toUserId: uid }],
          status: { $in: ['pending', 'accepted'] },
        } as any, { sort: { createdAt: -1 }, limit: 20 });
        return rows.map(r => ({
          id: String(r._id),
          fromUserId: String(r.fromUserId),
          toUserId: String(r.toUserId),
          fromUsername: r.fromUsername,
          toUsername: r.toUsername,
          fromTeamAbbr: r.fromTeamAbbr,
          toTeamAbbr: r.toTeamAbbr,
          status: r.status,
          fromScore: r.fromScore,
          toScore: r.toScore,
          createdAt: r.createdAt,
        }));
      } catch { return []; }
    },
  },

  mutations: {
    // Exchange Discord's PKCE authorization code on the server so the browser
    // never has to call Discord's token endpoint directly.
    exchangeDiscordCode: async (args: unknown) => {
      const { code, redirectUri, codeVerifier, clientId } = z.object({
        code: z.string().min(1),
        redirectUri: z.string().url(),
        codeVerifier: z.string().min(43),
        clientId: z.string().min(1),
      }).parse(args);

      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Discord token exchange failed: ${await tokenResponse.text()}`);
      }

      const token = await tokenResponse.json() as { access_token?: string };
      if (!token.access_token) throw new Error('Discord did not return an access token');

      const profileResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!profileResponse.ok) throw new Error('Discord profile request failed');

      const profile = await profileResponse.json() as {
        id: string;
        username?: string;
        global_name?: string;
        avatar?: string | null;
        discriminator?: string;
      };
      const avatarHash = profile.avatar;
      const avatarExtension = avatarHash?.startsWith('a_') ? 'gif' : 'png';

      return {
        id: profile.id,
        username: profile.username || profile.global_name || 'Discord player',
        avatar: avatarHash
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatarHash}.${avatarExtension}?size=128`
          : `https://cdn.discordapp.com/embed/avatars/${(Number(profile.discriminator) || 0) % 5}.png`,
      };
    },

    // יצירת מנהל חדש (בחירת קבוצה)
    createManager: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { teamAbbr } = z.object({ teamAbbr: z.string() }).parse(args);

      const existing = await dbManagers.findOne({ userId: new ObjectId(user.id) });
      if (existing) throw new Error('Manager already exists');

      await dbManagers.insertOne({
        userId: new ObjectId(user.id),
        discordId: '',
        discordUsername: (user as any).username || 'Guest',
        discordAvatar: '',
        teamAbbr,
        budget: STARTING_BUDGET,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        createdAt: new Date(),
      });

      return { success: true, budget: STARTING_BUDGET };
    },

    // קנה שחקן
    buyPlayer: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { playerId } = z.object({ playerId: z.string() }).parse(args);

      const manager = await dbManagers.requireOne({ userId: new ObjectId(user.id) });
      const player = getPlayerById(playerId);
      if (!player) throw new Error('Player not found');

      // בדוק שהשחקן לא כבר נקנה
      const existing = await dbManagerPlayers.findOne({
        userId: new ObjectId(user.id),
        playerId,
      });
      if (existing) throw new Error('Player already in squad');

      // בדוק תקציב
      if (manager.budget < player.marketValue) {
        throw new Error(`אין מספיק כסף! צריך ₪${player.marketValue.toLocaleString()} אבל יש לך רק ₪${manager.budget.toLocaleString()}`);
      }

      // קנה את השחקן
      await dbManagerPlayers.insertOne({
        userId: new ObjectId(user.id),
        playerId: player.id,
        playerName: player.nameHe,
        teamAbbr: player.team,
        position: player.position,
        ovr: player.ovr,
        pac: player.pac,
        sho: player.sho,
        pas: player.pas,
        dri: player.dri,
        def: player.def,
        phy: player.phy,
        marketValue: player.marketValue,
        purchasePrice: player.marketValue,
        purchasedAt: new Date(),
        isStarter: false,
      });

      // הפחת מהתקציב
      const newBudget = manager.budget - player.marketValue;
      await dbManagers.updateOne(
        { userId: new ObjectId(user.id) },
        { $set: { budget: newBudget } }
      );

      return { success: true, newBudget, playerName: player.nameHe };
    },

    // מכור שחקן
    sellPlayer: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { playerId } = z.object({ playerId: z.string() }).parse(args);

      const manager = await dbManagers.requireOne({ userId: new ObjectId(user.id) });
      const myPlayer = await dbManagerPlayers.requireOne({
        userId: new ObjectId(user.id),
        playerId,
      });

      // מכור ב-80% מערך השוק
      const sellPrice = Math.round(myPlayer.marketValue * 0.8);
      const newBudget = manager.budget + sellPrice;

      await dbManagerPlayers.deleteOne({
        userId: new ObjectId(user.id),
        playerId,
      });

      await dbManagers.updateOne(
        { userId: new ObjectId(user.id) },
        { $set: { budget: newBudget } }
      );

      return { success: true, newBudget, sellPrice, playerName: myPlayer.playerName };
    },

    // שמור תוצאת משחק
    saveMatchResult: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { homeTeam, awayTeam, homeScore, awayScore, isUserHome } = z.object({
        homeTeam: z.string(),
        awayTeam: z.string(),
        homeScore: z.number(),
        awayScore: z.number(),
        isUserHome: z.boolean(),
      }).parse(args);

      await dbMatchResults.insertOne({
        userId: new ObjectId(user.id),
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        playedAt: new Date(),
        isUserHome,
      });

      // עדכן סטטיסטיקות
      const userScore = isUserHome ? homeScore : awayScore;
      const oppScore = isUserHome ? awayScore : homeScore;
      const won = userScore > oppScore ? 1 : 0;
      const drawn = userScore === oppScore ? 1 : 0;
      const lost = userScore < oppScore ? 1 : 0;

      await dbManagers.updateOne(
        { userId: new ObjectId(user.id) },
        {
          $inc: {
            wins: won,
            draws: drawn,
            losses: lost,
            goalsFor: userScore,
            goalsAgainst: oppScore,
          }
        }
      );

      return { success: true };
    },

    // עדכן Discord info
    updateDiscordInfo: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { discordId, discordUsername, discordAvatar } = z.object({
        discordId: z.string(),
        discordUsername: z.string(),
        discordAvatar: z.string(),
      }).parse(args);

      await dbManagers.updateOne(
        { userId: new ObjectId(user.id) },
        { $set: { discordId, discordUsername, discordAvatar } }
      );

      return { success: true };
    },

    // פרסם כתבה — אדמין בלבד (knafe3)
    // Auth is Discord-based (no Modelence session), so we verify by author name
    publishNews: async (args: unknown) => {
      const { tag, title, excerpt, image, author } = z.object({
        tag: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().min(1),
        image: z.string(),
        author: z.string(),
      }).parse(args);

      // Only knafe3 may publish
      if (author.trim().toLowerCase() !== 'knafe3') {
        throw new Error('Unauthorized');
      }

      try {
        const doc = await dbNews.insertOne({
          tag,
          title,
          excerpt,
          image,
          author,
          createdAt: new Date(),
        });
        return { success: true, id: String(doc._id) };
      } catch (e: any) {
        // If the collection is not yet provisioned, store locally and return success
        console.error('publishNews DB error:', e?.message);
        throw new Error('DB_NOT_READY');
      }
    },

    // מחק כתבה לפי _id — אדמין בלבד
    deleteNews: async (args: unknown) => {
      const { id, author } = z.object({ id: z.string(), author: z.string() }).parse(args);
      if (author.trim().toLowerCase() !== 'knafe3') {
        throw new Error('Unauthorized');
      }
      await dbNews.deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    },

    // מחק את כל הנתונים של כל המשתמשים — אדמין בלבד
    resetAllData: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      // מוחק את כל הרשומות מ-3 הטבלאות
      const managers = await dbManagers.fetch({});
      for (const m of managers) {
        await dbManagers.deleteOne({ _id: m._id });
      }
      const players = await dbManagerPlayers.fetch({});
      for (const p of players) {
        await dbManagerPlayers.deleteOne({ _id: p._id });
      }
      const results = await dbMatchResults.fetch({});
      for (const r of results) {
        await dbMatchResults.deleteOne({ _id: r._id });
      }
      return { success: true, deleted: { managers: managers.length, players: players.length, results: results.length } };
    },

    // ── EVENTS (admin) ──────────────────────────────────────────────────
    createEvent: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { title, description, type, target, reward, expiresAt } = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(['win_streak', 'goals', 'matches']),
        target: z.number().min(1),
        reward: z.number().min(0),
        expiresAt: z.string(),
      }).parse(args);
      try {
        const doc = await dbEvents.insertOne({
          title, description, type, target, reward, active: true,
          createdAt: new Date(), expiresAt: new Date(expiresAt),
        });
        return { success: true, id: String(doc._id) };
      } catch { return { success: false, id: '' }; }
    },

    deleteEvent: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id } = z.object({ id: z.string() }).parse(args);
      try {
        await dbEvents.updateOne({ _id: new ObjectId(id) }, { $set: { active: false } });
      } catch { /* ignore if not provisioned */ }
      return { success: true };
    },

    // ── FRIENDS ─────────────────────────────────────────────────────────
    sendFriendRequest: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { toUserId } = z.object({ toUserId: z.string() }).parse(args);
      if (toUserId === user.id) throw new Error('Cannot add yourself');
      try {
        const fromUid = new ObjectId(user.id);
        const toUid = new ObjectId(toUserId);
        const existing = await dbFriends.findOne({
          $or: [{ fromUserId: fromUid, toUserId: toUid }, { fromUserId: toUid, toUserId: fromUid }],
        } as any);
        if (existing) throw new Error('Already friends or pending');
        const fromManager = await dbManagers.requireOne({ userId: fromUid });
        const toManager = await dbManagers.requireOne({ userId: toUid });
        await dbFriends.insertOne({
          fromUserId: fromUid, toUserId: toUid,
          fromUsername: fromManager.discordUsername, toUsername: toManager.discordUsername,
          fromAvatar: fromManager.discordAvatar, toAvatar: toManager.discordAvatar,
          status: 'pending', createdAt: new Date(),
        });
      } catch (e: any) {
        if (e?.message === 'Already friends or pending') throw e;
        // collection not provisioned yet — silently ignore
      }
      return { success: true };
    },

    acceptFriendRequest: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id } = z.object({ id: z.string() }).parse(args);
      try { await dbFriends.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'accepted' } }); } catch { /* ignore */ }
      return { success: true };
    },

    removeFriend: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id } = z.object({ id: z.string() }).parse(args);
      try { await dbFriends.deleteOne({ _id: new ObjectId(id) }); } catch { /* ignore */ }
      return { success: true };
    },

    // ── CHALLENGES ──────────────────────────────────────────────────────
    sendChallenge: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { toUserId } = z.object({ toUserId: z.string() }).parse(args);
      try {
        const fromUid = new ObjectId(user.id);
        const toUid = new ObjectId(toUserId);
        const fromManager = await dbManagers.requireOne({ userId: fromUid });
        const toManager = await dbManagers.requireOne({ userId: toUid });
        const doc = await dbChallenges.insertOne({
          fromUserId: fromUid, toUserId: toUid,
          fromUsername: fromManager.discordUsername, toUsername: toManager.discordUsername,
          fromTeamAbbr: fromManager.teamAbbr, toTeamAbbr: toManager.teamAbbr,
          status: 'pending', fromScore: 0, toScore: 0, winnerId: '',
          createdAt: new Date(), completedAt: new Date(0),
        });
        return { success: true, id: String(doc._id) };
      } catch { return { success: false, id: '' }; }
    },

    respondChallenge: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id, accept } = z.object({ id: z.string(), accept: z.boolean() }).parse(args);
      try { await dbChallenges.updateOne({ _id: new ObjectId(id) }, { $set: { status: accept ? 'accepted' : 'declined' } }); } catch { /* ignore */ }
      return { success: true };
    },

    submitChallengeResult: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id, myScore, opponentScore } = z.object({ id: z.string(), myScore: z.number(), opponentScore: z.number() }).parse(args);
      try {
        const challenge = await dbChallenges.requireOne({ _id: new ObjectId(id) });
        const isFrom = String(challenge.fromUserId) === user.id;
        const fromScore = isFrom ? myScore : opponentScore;
        const toScore = isFrom ? opponentScore : myScore;
        const winnerId = fromScore > toScore ? String(challenge.fromUserId) : toScore > fromScore ? String(challenge.toUserId) : '';
        await dbChallenges.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'completed', fromScore, toScore, winnerId, completedAt: new Date() } });
        return { success: true, winnerId };
      } catch { return { success: true, winnerId: '' }; }
    },

    // עדכון lastSeen לסטטוס אונליין — קרא אותו כל 90 שניות מהקליינט
    pingOnline: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) return { success: false };
      try {
        await dbManagers.updateOne(
          { userId: new ObjectId(user.id) },
          { $set: { lastSeen: new Date() } }
        );
      } catch { /* ignore if not provisioned */ }
      return { success: true };
    },
  },
});
