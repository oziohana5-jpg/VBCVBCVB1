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
  stores: [dbManagers, dbManagerPlayers, dbMatchResults],

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

    // קבל userId של manager לפי Discord username — ציבורי, לא דורש session
    getManagerByDiscord: async (args: unknown) => {
      const { discordUsername } = z.object({ discordUsername: z.string() }).parse(args);
      const manager = await dbManagers.findOne({ discordUsername } as any);
      if (!manager) return null;
      return {
        userId: String(manager.userId),
        teamAbbr: manager.teamAbbr,
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
        const articles = await (await dbNews._col()).find({}).sort({ createdAt: -1 }).limit(50).toArray();
        return articles.map((a: any) => ({
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
        const events = await (await dbEvents._col()).find({ active: true }).sort({ createdAt: -1 }).toArray();
        const result = [];
        for (const ev of events as any[]) {
          let progress = 0;
          let completed = false;
          if (user) {
            try {
              const prog = await (await dbEventProgress._col()).findOne({
                userId: new ObjectId(user.id),
                eventId: String(ev._id),
              });
              progress = (prog as any)?.progress ?? 0;
              completed = (prog as any)?.completed ?? false;
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
      if (!user) throw new AuthError('Not authenticated');
      const userId = user.id;
      try {
        const uid = new ObjectId(userId);
        const rows = await (await dbFriends._col()).find({
          $or: [{ fromUserId: uid }, { toUserId: uid }],
        }).toArray() as any[];
        const otherIds = rows.map(r => {
          const isSender = String(r.fromUserId) === userId;
          return isSender ? String(r.toUserId) : String(r.fromUserId);
        });
        const managerRecords = otherIds.length > 0
          ? await dbManagers.fetch({ userId: { $in: otherIds.map(id => new ObjectId(id)) } } as any)
          : [];
        const managerMap = new Map(managerRecords.map(m => [String(m.userId), m]));
        const onlineThreshold = new Date(Date.now() - 3 * 60 * 1000);
        return rows.map(r => {
          const isSender = String(r.fromUserId) === userId;
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

    // חיפוש משתמשים — ציבורי (לא דורש Modelence session)
    searchUsers: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { query } = z.object({ query: z.string() }).parse(args);
      const managers = await dbManagers.fetch({} as any, { limit: 500 });
      const lower = query.toLowerCase().trim();
      return managers
        .filter(m => {
          if (lower === '') return true;
          const name = (m.discordUsername || '').toLowerCase();
          return name.includes(lower);
        })
        .slice(0, 20)
        .map(m => ({
          userId: String(m.userId),
          username: m.discordUsername || `user-${String(m.userId).slice(-5)}`,
          avatar: m.discordAvatar || '',
          teamAbbr: m.teamAbbr || '',
        }));
    },

    // ── CHALLENGES ──────────────────────────────────────────────────────
    getChallenges: async (args: unknown) => {
      const { userId } = z.object({ userId: z.string() }).parse(args);
      try {
        const uid = new ObjectId(userId);
        const rows = await (await dbChallenges._col()).find({
          $or: [{ fromUserId: uid }, { toUserId: uid }],
          status: { $in: ['pending', 'accepted'] },
        }).sort({ createdAt: -1 }).limit(20).toArray() as any[];
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
    // Exchange Discord's PKCE authorization code on the server
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

    // יצירת מנהל חדש
    createManager: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { teamAbbr, displayName } = z.object({
        teamAbbr: z.string(),
        displayName: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N}_.-]+$/u),
      }).parse(args);

      const existing = await dbManagers.findOne({ userId: new ObjectId(user.id) });
      if (existing) throw new Error('Manager already exists');
      const nameTaken = await dbManagers.findOne({ discordUsername: { $regex: `^${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } } as any);
      if (nameTaken) throw new Error('שם המשתמש כבר תפוס');

      await dbManagers.insertOne({
        userId: new ObjectId(user.id),
        discordId: user.id,
        discordUsername: displayName,
        discordAvatar: '',
        teamAbbr,
        budget: STARTING_BUDGET,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        createdAt: new Date(),
        lastSeen: new Date(),
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

      const existing = await dbManagerPlayers.findOne({
        userId: new ObjectId(user.id),
        playerId,
      });
      if (existing) throw new Error('Player already in squad');

      if (manager.budget < player.marketValue) {
        throw new Error(`אין מספיק כסף! צריך ₪${player.marketValue.toLocaleString()} אבל יש לך רק ₪${manager.budget.toLocaleString()}`);
      }

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
    publishNews: async (args: unknown) => {
      const { tag, title, excerpt, image, author } = z.object({
        tag: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().min(1),
        image: z.string(),
        author: z.string(),
      }).parse(args);

      if (author.trim().toLowerCase() !== 'knafe3') {
        throw new Error('Unauthorized');
      }

      const col = await dbNews._col();
      const doc = await col.insertOne({
        tag, title, excerpt, image, author, createdAt: new Date(),
      });
      return { success: true, id: String(doc.insertedId) };
    },

    // מחק כתבה לפי _id — אדמין בלבד
    deleteNews: async (args: unknown) => {
      const { id, author } = z.object({ id: z.string(), author: z.string() }).parse(args);
      if (author.trim().toLowerCase() !== 'knafe3') {
        throw new Error('Unauthorized');
      }
      await (await dbNews._col()).deleteOne({ _id: new ObjectId(id) });
      return { success: true };
    },

    // מחק את כל הנתונים — אדמין בלבד
    resetAllData: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
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
    createEvent: async (args: unknown) => {
      const { title, description, type, target, reward, expiresAt, author } = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        type: z.enum(['win_streak', 'goals', 'matches']),
        target: z.number().min(1),
        reward: z.number().min(0),
        expiresAt: z.string(),
        author: z.string(),
      }).parse(args);
      if (author.trim().toLowerCase() !== 'knafe3') throw new Error('Unauthorized');
      try {
        const col = await dbEvents._col();
        const doc = await col.insertOne({
          title, description, type, target, reward, active: true,
          createdAt: new Date(), expiresAt: new Date(expiresAt),
        });
        return { success: true, id: String(doc.insertedId) };
      } catch { return { success: false, id: '' }; }
    },

    deleteEvent: async (args: unknown) => {
      const { id, author } = z.object({ id: z.string(), author: z.string() }).parse(args);
      if (author.trim().toLowerCase() !== 'knafe3') throw new Error('Unauthorized');
      try {
        await (await dbEvents._col()).updateOne(
          { _id: new ObjectId(id) },
          { $set: { active: false } }
        );
      } catch { /* ignore */ }
      return { success: true };
    },

    // ── FRIENDS ─────────────────────────────────────────────────────────
    sendFriendRequest: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { toUserId } = z.object({
        toUserId: z.string(),
      }).parse(args);
      const fromUserId = user.id;
      if (fromUserId === toUserId) throw new Error('Cannot add yourself');
      try {
        const fromUid = new ObjectId(fromUserId);
        const toUid = new ObjectId(toUserId);
        const friendsCol = await dbFriends._col();
        const existing = await friendsCol.findOne({
          $or: [
            { fromUserId: fromUid, toUserId: toUid },
            { fromUserId: toUid, toUserId: fromUid },
          ],
        });
        if (existing) throw new Error('Already friends or pending');
        const fromManager = await dbManagers.requireOne({ userId: fromUid });
        const toManager = await dbManagers.requireOne({ userId: toUid });
        await friendsCol.insertOne({
          fromUserId: fromUid, toUserId: toUid,
          fromUsername: fromManager.discordUsername, toUsername: toManager.discordUsername,
          fromAvatar: fromManager.discordAvatar, toAvatar: toManager.discordAvatar,
          status: 'pending', createdAt: new Date(),
        });
      } catch (e: any) {
        if (e?.message === 'Already friends or pending') throw e;
      }
      return { success: true };
    },

    acceptFriendRequest: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id } = z.object({ id: z.string() }).parse(args);
      try {
        await (await dbFriends._col()).updateOne(
          { _id: new ObjectId(id), toUserId: new ObjectId(user.id), status: 'pending' },
          { $set: { status: 'accepted' } }
        );
      } catch { /* ignore */ }
      return { success: true };
    },

    removeFriend: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id } = z.object({ id: z.string() }).parse(args);
      try {
        await (await dbFriends._col()).deleteOne({
          _id: new ObjectId(id),
          $or: [{ fromUserId: new ObjectId(user.id) }, { toUserId: new ObjectId(user.id) }],
        });
      } catch { /* ignore */ }
      return { success: true };
    },

    // ── CHALLENGES ──────────────────────────────────────────────────────
    sendChallenge: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { toUserId } = z.object({
        toUserId: z.string(),
      }).parse(args);
      const fromUserId = user.id;
      try {
        const fromUid = new ObjectId(fromUserId);
        const toUid = new ObjectId(toUserId);
        const fromManager = await dbManagers.requireOne({ userId: fromUid });
        const toManager = await dbManagers.requireOne({ userId: toUid });
        const challengesCol = await dbChallenges._col();
        const doc = await challengesCol.insertOne({
          fromUserId: fromUid, toUserId: toUid,
          fromUsername: fromManager.discordUsername, toUsername: toManager.discordUsername,
          fromTeamAbbr: fromManager.teamAbbr, toTeamAbbr: toManager.teamAbbr,
          status: 'pending', fromScore: 0, toScore: 0, winnerId: '',
          createdAt: new Date(), completedAt: new Date(0),
        });
        return { success: true, id: String(doc.insertedId) };
      } catch { return { success: false, id: '' }; }
    },

    respondChallenge: async (args: unknown) => {
      const { id, accept } = z.object({ id: z.string(), accept: z.boolean() }).parse(args);
      try {
        await (await dbChallenges._col()).updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: accept ? 'accepted' : 'declined' } }
        );
      } catch { /* ignore */ }
      return { success: true };
    },

    submitChallengeResult: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      const { id, myScore, opponentScore } = z.object({
        id: z.string(),
        myScore: z.number(),
        opponentScore: z.number(),
      }).parse(args);
      try {
        const challengesCol = await dbChallenges._col();
        const challenge = await challengesCol.findOne({ _id: new ObjectId(id) }) as any;
        if (!challenge) throw new Error('Challenge not found');
        const isFrom = String(challenge.fromUserId) === user.id;
        const fromScore = isFrom ? myScore : opponentScore;
        const toScore = isFrom ? opponentScore : myScore;
        const winnerId = fromScore > toScore
          ? String(challenge.fromUserId)
          : toScore > fromScore
            ? String(challenge.toUserId)
            : '';
        await challengesCol.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: 'completed', fromScore, toScore, winnerId, completedAt: new Date() } }
        );
        return { success: true, winnerId };
      } catch { return { success: true, winnerId: '' }; }
    },

    // עדכון lastSeen — קרא כל 90 שניות מהקליינט
    pingOnline: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) throw new AuthError('Not authenticated');
      try {
        await dbManagers.updateOne(
          { userId: new ObjectId(user.id) },
          { $set: { lastSeen: new Date() } }
        );
      } catch { /* ignore */ }
      return { success: true };
    },
  },
});
