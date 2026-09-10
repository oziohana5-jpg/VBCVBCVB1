import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { modelenceMutation, modelenceQuery } from '@modelence/react-query';
// Logo hosted on Discord CDN
const LOGO_URL = 'https://cdn.discordapp.com/attachments/1544362998410252342/1547265092326793226/Gemini_Generated_Image_ha7o1vha7o1vha7o.png';
import {
  Home, Users, ShoppingCart, PlayCircle, Trophy,
  History, ArrowLeft, DollarSign, Inbox, Calendar,
  Star, Search, Activity, ChevronRight, X, Check, LayoutGrid,
  Newspaper, Plus, Trash2, UserPlus, Swords, Zap, FastForward,
} from 'lucide-react';
import { PitchKickGame, CANVAS_W, CANVAS_H, type HudState } from '@/client/game/engine';
import { TEAMS, ISRAELI_TEAMS, type TeamData } from '@/client/game/teams';
import { roleForIndex } from '@/client/game/teams/types';

type Tab = 'home' | 'squad' | 'lineup' | 'transfer' | 'match' | 'league' | 'results' | 'news' | 'friends' | 'events';
type MarketCategory = 'ALL' | 'ISRAELI' | 'WORLD';

const TAB_ORDER: Tab[] = ['home', 'squad', 'lineup', 'transfer', 'match', 'league', 'results', 'news', 'friends', 'events'];

interface OwnedPlayer {
  id: string;
  nameHe: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  ovr: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  marketValue: number;
  teamAbbr: string;
  photoUrl?: string;
  upgrades?: number;
}

const toPosition = (role: string): OwnedPlayer['position'] => {
  if (role === 'GK') return 'GK';
  if (role === 'DF') return 'DEF';
  if (role === 'ST') return 'FWD';
  return 'MID';
};

function createTeamRoster(team: TeamData): OwnedPlayer[] {
  return team.players.map((player, index) => {
    const ratings = player.ratings;
    return {
      id: `club-${team.abbr}-${player.num}-${index}`,
      nameHe: player.name,
      name: player.name,
      position: toPosition(roleForIndex(index)),
      ovr: ratings.ovr,
      pac: ratings.pac,
      sho: ratings.sho,
      pas: ratings.pas,
      dri: ratings.dri,
      def: ratings.def,
      phy: ratings.phy,
      marketValue: Math.round(ratings.ovr * 180_000),
      teamAbbr: team.abbr,
    };
  });
}

function fallbackPhoto(name: string) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#16365d"/><stop offset="1" stop-color="#071821"/></linearGradient></defs>` +
    `<rect width="600" height="760" fill="url(#g)"/><circle cx="300" cy="270" r="105" fill="#9bb6d1"/>` +
    `<path d="M125 720c15-165 90-235 175-235s160 70 175 235" fill="#1e7ef2"/>` +
    `<text x="300" y="680" text-anchor="middle" font-family="Arial" font-size="76" font-weight="900" fill="white">${initials}</text>` +
    `</svg>`,
  );
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function buildWorldMarket(): OwnedPlayer[] {
  const israeliPlayers: OwnedPlayer[] = [
    { id: 'isr_zahavi', nameHe: 'ערן זהבי', name: 'Eran Zahavi', position: 'FWD', ovr: 87, pac: 82, sho: 88, pas: 79, dri: 85, def: 32, phy: 75, marketValue: 3_500_000, teamAbbr: 'MTA' },
    { id: 'isr_glazer', nameHe: 'דור פרץ', name: 'Dor Peretz', position: 'MID', ovr: 83, pac: 78, sho: 72, pas: 85, dri: 80, def: 55, phy: 72, marketValue: 1_800_000, teamAbbr: 'MTA' },
    { id: 'isr_solomon', nameHe: 'מנור סולומון', name: 'Manor Solomon', position: 'FWD', ovr: 81, pac: 87, sho: 76, pas: 78, dri: 85, def: 42, phy: 70, marketValue: 9_000_000, teamAbbr: 'ISR' },
    { id: 'isr_gloukh', nameHe: 'אוסקר גלוך', name: 'Oscar Gloukh', position: 'MID', ovr: 83, pac: 84, sho: 80, pas: 83, dri: 88, def: 44, phy: 68, marketValue: 15_000_000, teamAbbr: 'ISR' },
    { id: 'isr_dabbur', nameHe: 'מונס דאבור', name: 'Munas Dabbur', position: 'FWD', ovr: 80, pac: 82, sho: 85, pas: 78, dri: 82, def: 35, phy: 76, marketValue: 3_000_000, teamAbbr: 'ISR' },
    { id: 'isr_abu_fani', nameHe: 'עדי אבדיה', name: 'Mohammad Abu Fani', position: 'MID', ovr: 78, pac: 80, sho: 72, pas: 79, dri: 81, def: 65, phy: 74, marketValue: 6_500_000, teamAbbr: 'ISR' },
  ];

  const featured = [
    { id: 'messi', name: 'Lionel Messi', teamAbbr: 'ARG', position: 'FWD', ovr: 94, pac: 96, sho: 92, pas: 91, dri: 96, def: 36, phy: 67 },
    { id: 'ronaldo', name: 'Cristiano Ronaldo', teamAbbr: 'POR', position: 'FWD', ovr: 91, pac: 91, sho: 93, pas: 79, dri: 88, def: 35, phy: 76 },
    { id: 'mbappe', name: 'Kylian Mbappé', teamAbbr: 'FRA', position: 'FWD', ovr: 92, pac: 97, sho: 90, pas: 80, dri: 92, def: 36, phy: 77 },
    { id: 'haaland', name: 'Erling Haaland', teamAbbr: 'NOR', position: 'FWD', ovr: 90, pac: 94, sho: 91, pas: 65, dri: 81, def: 36, phy: 88 },
    { id: 'neymar', name: 'Neymar', teamAbbr: 'BRA', position: 'FWD', ovr: 89, pac: 94, sho: 84, pas: 86, dri: 94, def: 37, phy: 65 },
    { id: 'debruyne', name: 'Kevin De Bruyne', teamAbbr: 'BEL', position: 'MID', ovr: 91, pac: 75, sho: 86, pas: 93, dri: 87, def: 63, phy: 69 },
    { id: 'bellingham', name: 'Jude Bellingham', teamAbbr: 'ENG', position: 'MID', ovr: 90, pac: 88, sho: 84, pas: 87, dri: 86, def: 72, phy: 78 },
    { id: 'rodri', name: 'Rodri', teamAbbr: 'ESP', position: 'MID', ovr: 91, pac: 64, sho: 73, pas: 89, dri: 79, def: 92, phy: 86 },
    { id: 'salah', name: 'Mohamed Salah', teamAbbr: 'EGY', position: 'FWD', ovr: 89, pac: 92, sho: 88, pas: 81, dri: 90, def: 42, phy: 71 },
    { id: 'son', name: 'Heung-min Son', teamAbbr: 'KOR', position: 'FWD', ovr: 88, pac: 91, sho: 84, pas: 81, dri: 89, def: 38, phy: 76 },
    { id: 'kane', name: 'Harry Kane', teamAbbr: 'ENG', position: 'FWD', ovr: 90, pac: 79, sho: 92, pas: 83, dri: 83, def: 44, phy: 80 },
    { id: 'vinicius', name: 'Vinícius Júnior', teamAbbr: 'BRA', position: 'FWD', ovr: 89, pac: 97, sho: 81, pas: 75, dri: 92, def: 35, phy: 66 },
    { id: 'alvarez', name: 'Julian Alvarez', teamAbbr: 'ARG', position: 'FWD', ovr: 87, pac: 86, sho: 84, pas: 79, dri: 86, def: 42, phy: 72 },
    { id: 'foden', name: 'Phil Foden', teamAbbr: 'ENG', position: 'MID', ovr: 86, pac: 84, sho: 83, pas: 84, dri: 89, def: 38, phy: 62 },
    { id: 'di_maria', name: 'Ángel Di María', teamAbbr: 'ARG', position: 'MID', ovr: 85, pac: 85, sho: 80, pas: 83, dri: 89, def: 37, phy: 66 },
    { id: 'ter_stegen', name: 'Marc-André ter Stegen', teamAbbr: 'GER', position: 'GK', ovr: 89, pac: 42, sho: 25, pas: 76, dri: 52, def: 90, phy: 80 },
  ] as const;

  const players: OwnedPlayer[] = [...israeliPlayers, ...featured.map((p) => ({
    id: p.id,
    nameHe: p.name,
    name: p.name,
    position: p.position,
    ovr: p.ovr,
    pac: p.pac,
    sho: p.sho,
    pas: p.pas,
    dri: p.dri,
    def: p.def,
    phy: p.phy,
    marketValue: Math.round((p.ovr * 850_000) + (p.pac * 14_000) + (p.sho * 11_000)),
    teamAbbr: p.teamAbbr,
  }))];

  for (const team of TEAMS) {
    const chosen = team.players.slice(0, 2);
    for (const squadPlayer of chosen) {
      const index = team.players.indexOf(squadPlayer);
      const id = `${team.abbr}-${squadPlayer.num}-${squadPlayer.name}`;
      if (players.some(p => p.id === id)) continue;

      players.push({
        id,
        nameHe: squadPlayer.name,
        name: squadPlayer.name,
        position: toPosition(roleForIndex(index)),
        ovr: squadPlayer.ratings.ovr,
        pac: squadPlayer.ratings.pac,
        sho: squadPlayer.ratings.sho,
        pas: squadPlayer.ratings.pas,
        dri: squadPlayer.ratings.dri,
        def: squadPlayer.ratings.def,
        phy: squadPlayer.ratings.phy,
        marketValue: Math.round(squadPlayer.ratings.ovr * 180_000),
        teamAbbr: team.abbr,
        photoUrl: undefined,
      });
    }
  }

  return players.sort((a, b) => b.ovr - a.ovr);
}

interface MatchResultEntry {
  id: number;
  homeAbbr: string;
  awayAbbr: string;
  homeScore: number;
  awayScore: number;
  date: string;
}

interface MatchEvent {
  minute: number;
  text: string;
  type: 'goal' | 'miss' | 'save' | 'card' | 'info';
}

const MARKET_PLAYERS: OwnedPlayer[] = buildWorldMarket();

const INBOX_MESSAGES = [
  { id: 1, from: 'הנהלת הליגה', subject: 'ברוכים הבאים לעונת 2026/27!', time: 'לפני יום', read: false },
  { id: 2, from: 'סקאוט הקבוצה', subject: 'המלצה: אוסקר גלוך זמין לרכישה', time: 'לפני 2 ימים', read: false },
  { id: 3, from: 'הוועד', subject: 'תקציב הקיץ אושר - ₪12M', time: 'לפני 3 ימים', read: true },
  { id: 4, from: 'רופא הקבוצה', subject: 'עדכון כשירות: 4 שחקנים בסיכון', time: 'לפני שבוע', read: true },
  { id: 5, from: 'סוכן שחקנים', subject: 'פנייה מ-FIFA IL News על שחקן חדש', time: 'לפני שבוע', read: true },
];

interface NewsArticle {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  image: string;
  createdAt: Date;
  author: string;
}

const STORAGE_KEYS = {
  team:    'fifa-il.selected-team',
  discord: 'fifa-il.discord-user',
  budget:  'fifa-il.budget',
  squad:   'fifa-il.squad',
  results: 'fifa-il.results',
  stats:   'fifa-il.stats',
};

const PHOTO_CACHE_KEY = 'fifa-il.player-photos.v4';

function readPhotoCache(): Record<string, string> {
  try {
    const cache = JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY) ?? '{}');
    return cache && typeof cache === 'object' ? cache : {};
  } catch {
    return {};
  }
}

function savePhotoCache(cache: Record<string, string>) {
  try { localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify(cache)); } catch { /* storage can be unavailable */ }
}

function photoCacheKey(player: OwnedPlayer) {
  return `${player.name}|${player.teamAbbr}`.toLowerCase();
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9א-ת]+/g, ' ').trim();
}

function nameMatchesTitle(title: string, player: OwnedPlayer) {
  const pageTitle = normalized(title);
  const nameParts = normalized(`${player.name} ${player.nameHe}`).split(' ').filter(Boolean);
  return nameParts.some(part => part.length > 2 && pageTitle.includes(part));
}

function PlayerPhoto({ player, showSearch = false }: { player: OwnedPlayer; showSearch?: boolean }) {
  const cacheKey = photoCacheKey(player);
  const cachedPhoto = readPhotoCache()[cacheKey];
  const fallback = fallbackPhoto(player.nameHe || player.name);
  const [src, setSrc] = useState<string>(player.photoUrl ?? cachedPhoto ?? fallback);
  const photoQuery = useQuery({
    ...modelenceQuery('manager.resolvePlayerPhoto', {
      name: player.name,
      team: TEAMS.find(team => team.abbr === player.teamAbbr)?.name,
    }),
    enabled: !player.photoUrl && !cachedPhoto,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    setSrc(player.photoUrl ?? readPhotoCache()[cacheKey] ?? fallback);
    if (player.photoUrl || readPhotoCache()[cacheKey]) return;

    const ctrl = new AbortController();

    const searchName = `${player.name} footballer ${player.teamAbbr}`;
    const wikipediaPhoto = fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchName)}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json&origin=*`,
      { signal: ctrl.signal },
    )
      .then(response => response.json())
      .then(data => Object.values(data?.query?.pages ?? {})
        .filter((page: any) => {
          return nameMatchesTitle(page?.title ?? '', player);
        })
        .map((page: any) => page?.thumbnail?.source as string | undefined)
        .find(Boolean))
      .catch(() => undefined);

    wikipediaPhoto.then(async image => {
      let result = image;
      if (!result) {
        result = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(player.name)}`,
          { signal: ctrl.signal },
        )
          .then(response => response.json())
          .then(data => {
            const players = Array.isArray(data?.player) ? data.player : [];
            const wanted = normalized(player.name);
            const match = players.find((candidate: any) => {
              const candidateName = normalized(candidate?.strPlayer ?? '');
              return candidateName === wanted || candidateName.includes(wanted) || wanted.includes(candidateName);
            });
            return match?.strCutout || match?.strThumb as string | undefined;
          })
          .catch(() => undefined);
      }
      if (!result) {
        result = await fetch(
          `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(`${player.name} football`)}&gsrlimit=5&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`,
          { signal: ctrl.signal },
        )
          .then(response => response.json())
          .then(data => Object.values(data?.query?.pages ?? {})
            .filter((page: any) => page?.imageinfo?.[0]?.mime?.startsWith('image/') && nameMatchesTitle(page?.title ?? '', player))
            .map((page: any) => page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url)
            .find(Boolean))
          .catch(() => undefined);
      }
      if (!result) {
        result = photoQuery.data?.photo ?? undefined;
      }
      if (!result || ctrl.signal.aborted) return;
      const cache = readPhotoCache();
      cache[cacheKey] = result;
      savePhotoCache(cache);
      setSrc(result);
    });

    return () => ctrl.abort();
  }, [cacheKey, fallback, player.name, player.photoUrl, player.teamAbbr]);

  useEffect(() => {
    const image = photoQuery.data?.photo;
    if (!image || player.photoUrl) return;
    const cache = readPhotoCache();
    cache[cacheKey] = image;
    savePhotoCache(cache);
    setSrc(image);
  }, [cacheKey, player.photoUrl, photoQuery.data?.photo]);

  const isFallback = src === fallback;
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${player.name} footballer ${player.teamAbbr}`)}`;

  return (
    <div className="relative h-full w-full">
      {isFallback ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_28%,#294b70,#081522_70%)] text-center">
          <span className="font-heading text-2xl font-bold tracking-wide text-[#9bb6d1]">תמונה בקרוב</span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[#52708f]">{player.nameHe}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={player.nameHe}
          className="h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; setSrc(fallback); }}
        />
      )}
      {showSearch && isFallback && (
        <button
          type="button"
          title="חפש תמונה של השחקן בגוגל"
          onClick={() => window.open(searchUrl, '_blank', 'noopener,noreferrer')}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg border border-white/30 bg-[#071821]/90 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur transition hover:border-[#c6ff2e] hover:text-[#c6ff2e]"
        >
          <Search size={12} /> חפש תמונה
        </button>
      )}
    </div>
  );
}

function getDiscordRedirectCandidates(): string[] {
  const explicit = [
    'http://localhost:3001/auth/discord/callback',
    'http://127.0.0.1:3001/auth/discord/callback',
  ];

  const origin = window.location.origin;
  if (origin) {
    explicit.unshift(`${origin.replace(/\/$/, '')}/auth/discord/callback`);
  }

  return [...new Set(explicit)];
}

function readStoredTeam(): TeamData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.team);
    if (!raw) return null;
    const abbr = JSON.parse(raw) as string;
    return TEAMS.find(team => team.abbr === abbr) ?? null;
  } catch {
    return null;
  }
}

type DiscordProfile = { id?: string; username: string; avatar: string };

function readStoredDiscord(): DiscordProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.discord);
    if (!raw) return null;
    const profile = JSON.parse(raw) as DiscordProfile;
    if (!profile.username || profile.username === 'Discord User' || profile.avatar.includes('dicebear')) return null;
    return profile;
  } catch {
    return null;
  }
}

function positionColor(pos: string) {
  if (pos === 'GK')  return '#f59e0b';
  if (pos === 'DEF') return '#3b82f6';
  if (pos === 'MID') return '#10b981';
  return '#ef4444';
}

function ovrColor(ovr: number) {
  if (ovr >= 85) return '#f59e0b';
  if (ovr >= 80) return '#10b981';
  if (ovr >= 75) return '#3b82f6';
  return '#6b7280';
}

function matchReward(result: 'win' | 'draw' | 'loss') {
  if (result === 'win') return 350_000;
  if (result === 'draw') return 200_000;
  return 100_000;
}

function TeamBadge({ team, size = 58 }: { team: TeamData; size?: number }) {
  const palette: Record<string, { bg: string; fg: string; accent?: string }> = {
    MTA: { bg: '#f5d300', fg: '#123f95', accent: '#0e327c' },
    HBS: { bg: '#d9162d', fg: '#f7f8fa', accent: '#8d0e1f' },
    MHF: { bg: '#0d8a47', fg: '#f7d22c', accent: '#0b5d2c' },
    HTA: { bg: '#d9162d', fg: '#f7f8fa', accent: '#8d0e1f' },
    BJM: { bg: '#f0cf1a', fg: '#1a1d29', accent: '#8f7910' },
    MPT: { bg: '#f3d415', fg: '#0c2c7d', accent: '#143b96' },
    BSK: { bg: '#147d38', fg: '#f5f5f5', accent: '#0d5828' },
    HHF: { bg: '#d71622', fg: '#f6f8fb', accent: '#a0111b' },
  };
  const p = palette[team.abbr] ?? { bg: team.color, fg: team.textColor, accent: team.color };
  const label = team.abbr.slice(0, 3).toUpperCase();

  const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">` +
    `<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">` +
    `<stop offset="0%" stop-color="${p.bg}"/><stop offset="100%" stop-color="${p.accent ?? p.bg}"/>` +
    `</linearGradient></defs>` +
    `<path d="M110 18 L175 38 V95 C175 140 149 175 110 198 C71 175 45 140 45 95 V38 Z" fill="url(#g)" stroke="rgba(255,255,255,0.86)" stroke-width="8"/>` +
    `<text x="110" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="900" fill="${p.fg}" letter-spacing="1">${label}</text>` +
    `</svg>`
  )}`;

  const [src, setSrc] = useState<string>(team.logoUrl ?? fallbackSvg);
  const [tried, setTried] = useState(!!team.logoUrl);

  useEffect(() => {
    setSrc(team.logoUrl ?? fallbackSvg);
    setTried(!!team.logoUrl);
  }, [team.abbr, team.logoUrl]);

  useEffect(() => {
    if (tried || team.logoUrl) return;
    const ctrl = new AbortController();
    fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(team.name)}`,
      { signal: ctrl.signal }
    )
      .then(r => r.json())
      .then(data => {
        const badge = data?.teams?.[0]?.strBadge;
        if (badge) setSrc(badge);
      })
      .catch(() => {})
      .finally(() => setTried(true));
    return () => ctrl.abort();
  }, [team.name, team.logoUrl, tried]);

  return (
    <div
      style={{ width: size, height: size, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.26))' }}
      title={team.name}
    >
      <img
        src={src}
        alt={team.name}
        onError={() => setSrc(fallbackSvg)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────
export default function ManagerPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<PitchKickGame | null>(null);
  const liveRewardedKey = useRef(-1);
  const teamOptions = TEAMS;
  const [myTeam, setMyTeam]           = useState<TeamData | null>(() => readStoredTeam());
  const [pickedAbbr, setPickedAbbr]   = useState(myTeam?.abbr ?? '');
  const [teamIndex, setTeamIndex]     = useState(() => {
    const initial = myTeam?.abbr ?? teamOptions[0]?.abbr ?? '';
    return Math.max(0, teamOptions.findIndex(team => team.abbr === initial));
  });
  const [tab, setTab]                 = useState<Tab>('match');
  const [tabDirection, setTabDirection] = useState<'next' | 'previous'>('next');
  const [budget, setBudget]           = useState(() => {
    try { const v = localStorage.getItem(STORAGE_KEYS.budget); return v ? Number(v) : 10_000_000; } catch { return 10_000_000; }
  });
  const [discordUser, setDiscordUser] = useState(() => readStoredDiscord());
  const [gameSpeed, setGameSpeed]    = useState(1.5);
  const [liveSpeed, setLiveSpeed]    = useState(1);
  const [aiMatch, setAiMatch]         = useState(true);

  const discordExchange = useMutation(modelenceMutation('manager.exchangeDiscordCode'));
  const discordCallbackStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const storedState = localStorage.getItem('fifa-il.discord.state');

    if (!code || !state || !storedState || state !== storedState) {
      return;
    }

    if (discordCallbackStarted.current) return;
    discordCallbackStarted.current = true;

    const runDiscordCallback = async () => {
      const redirectUri = getDiscordRedirectCandidates().find(uri => window.location.href.startsWith(uri.replace(/\/auth\/discord\/callback$/, '')))
        ?? getDiscordRedirectCandidates()[0];
      const clientId = '1546500518032183397';
      const codeVerifier = localStorage.getItem('fifa-il.discord.code_verifier') || '';

      let nextUser: DiscordProfile | null = null;

      try {
        nextUser = await discordExchange.mutateAsync({
          clientId,
          code,
          redirectUri,
          codeVerifier,
        }) as DiscordProfile;
      } catch (error) {
        console.error('Discord callback failed', error);
      } finally {
        if (nextUser) {
          setDiscordUser(nextUser);
          localStorage.setItem(STORAGE_KEYS.discord, JSON.stringify(nextUser));
        } else {
          setDiscordUser(null);
          localStorage.removeItem(STORAGE_KEYS.discord);
          window.alert('לא הצלחנו לקבל את פרטי Discord. בדוק שהחיבור אושר ונסה שוב.');
        }
        localStorage.removeItem('fifa-il.discord.state');
        localStorage.removeItem('fifa-il.discord.code_verifier');
        window.history.replaceState({}, '', '/');
        window.location.replace('/');
      }
    };

    runDiscordCallback();
  }, []);

  const [squad, setSquad]             = useState<OwnedPlayer[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.squad) ?? '[]'); } catch { return []; }
  });
  const [results, setResults]         = useState<MatchResultEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.results) ?? '[]'); } catch { return []; }
  });
  const [wins, setWins]               = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats) ?? '{"w":0,"d":0,"l":0}').w; } catch { return 0; }
  });
  const [draws, setDraws]             = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats) ?? '{"w":0,"d":0,"l":0}').d; } catch { return 0; }
  });
  const [losses, setLosses]           = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats) ?? '{"w":0,"d":0,"l":0}').l; } catch { return 0; }
  });
  const [searchTerm, setSearchTerm]   = useState('');
  const [posFilter, setPosFilter]     = useState<'ALL'|'GK'|'DEF'|'MID'|'FWD'>('ALL');
  const [marketCategory, setMarketCategory] = useState<MarketCategory>('ISRAELI');
  const [toast, setToast]             = useState('');
  const [newsDraft, setNewsDraft] = useState({
    title: '',
    tag: 'חדשות',
    excerpt: '',
    image: '',
  });

  useEffect(() => {
    if (!myTeam || squad.length >= 11) return;
    const existingIds = new Set(squad.map(player => player.id));
    const missingPlayers = createTeamRoster(myTeam).filter(player => !existingIds.has(player.id));
    setSquad([...squad, ...missingPlayers].slice(0, 11));
  }, [myTeam]);

  // שמירה אוטומטית בכל שינוי
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.budget, String(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.squad, JSON.stringify(squad)); }, [squad]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(results)); }, [results]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify({ w: wins, d: draws, l: losses })); }, [wins, draws, losses]);

  const [liveOpponent, setLiveOpponent] = useState<TeamData | null>(null);
  const [liveStarted, setLiveStarted] = useState(false);
  const [liveKey, setLiveKey] = useState(0);
  const [liveHud, setLiveHud] = useState<HudState>({
    homeScore: 0,
    awayScore: 0,
    clock: 0,
    message: '',
    possession: 'none',
    possessionPlayer: null,
    possessionDuration: 0,
    homePlayer: null,
    awayPlayer: null,
    charge: null,
  });

  // match simulation state
  const [simState, setSimState]       = useState<'idle'|'running'|'done'>('idle');
  const [simEvents, setSimEvents]     = useState<MatchEvent[]>([]);
  const [simOpponent, setSimOpponent] = useState<TeamData | null>(null);
  const [myScore, setMyScore]         = useState(0);
  const [oppScore, setOppScore]       = useState(0);
  const [simMinute, setSimMinute]     = useState(0);

  // ── helpers ──────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  // ── news (server) ──────────────────────────────
  const { data: newsArticles = [], refetch: refetchNews } = useQuery<NewsArticle[]>({
    ...modelenceQuery('manager.getNews'),
    staleTime: 30_000,
  });

  const publishNewsMutation = useMutation({
    ...modelenceMutation('manager.publishNews'),
    onSuccess: () => { void refetchNews(); showToast('הכתבה פורסמה בהצלחה'); },
    onError: () => showToast('שגיאה בפרסום הכתבה'),
  });

  const deleteNewsMutation = useMutation({
    ...modelenceMutation('manager.deleteNews'),
    onSuccess: () => { void refetchNews(); showToast('הכתבה נמחקה'); },
  });

  // ── events ────────────────────────────────────
  const { data: events = [], refetch: refetchEvents } = useQuery({
    ...modelenceQuery('manager.getEvents'),
    staleTime: 60_000,
  });

  const createEventMutation = useMutation({
    ...modelenceMutation('manager.createEvent'),
    onSuccess: () => { void refetchEvents(); showToast('האירוע נוצר!'); setEventDraftOpen(false); },
  });

  const deleteEventMutation = useMutation({
    ...modelenceMutation('manager.deleteEvent'),
    onSuccess: () => { void refetchEvents(); showToast('האירוע נמחק'); },
  });

  // ── friends ───────────────────────────────────
  const { data: friends = [], refetch: refetchFriends } = useQuery({
    ...modelenceQuery('manager.getFriends'),
    staleTime: 30_000,
    enabled: !!discordUser,
    retry: 0,
  });

  const sendFriendMutation = useMutation({
    ...modelenceMutation('manager.sendFriendRequest'),
    onSuccess: () => { void refetchFriends(); showToast('בקשת חברות נשלחה!'); },
    onError: (e: any) => showToast(e?.message ?? 'שגיאה'),
  });

  const acceptFriendMutation = useMutation({
    ...modelenceMutation('manager.acceptFriendRequest'),
    onSuccess: () => { void refetchFriends(); showToast('חברות אושרה!'); },
  });

  const removeFriendMutation = useMutation({
    ...modelenceMutation('manager.removeFriend'),
    onSuccess: () => { void refetchFriends(); showToast('הוסר מרשימת החברים'); },
  });

  const sendChallengeMutation = useMutation({
    ...modelenceMutation('manager.sendChallenge'),
    onSuccess: () => { void refetchChallenges(); showToast('אתגר נשלח!'); },
  });

  const respondChallengeMutation = useMutation({
    ...modelenceMutation('manager.respondChallenge'),
    onSuccess: () => { void refetchChallenges(); },
  });

  const { data: challenges = [], refetch: refetchChallenges } = useQuery({
    ...modelenceQuery('manager.getChallenges'),
    staleTime: 20_000,
    enabled: !!discordUser,
    retry: 0,
  });

  // friends search
  const [friendSearch, setFriendSearch] = useState('');
  const { data: searchResults = [] } = useQuery({
    ...modelenceQuery('manager.searchUsers', { query: friendSearch }),
    enabled: !!discordUser,
    staleTime: 10_000,
    retry: 0,
  });

  // event draft
  const [eventDraftOpen, setEventDraftOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: '', description: '', type: 'win_streak' as const, target: 5, reward: 500_000, expiresAt: '' });

  const isNewsAdmin = discordUser?.username.trim().toLowerCase() === 'knafe3';

  const handlePublishNews = () => {
    const title = newsDraft.title.trim();
    const excerpt = newsDraft.excerpt.trim();
    if (!title || !excerpt) {
      showToast('יש למלא כותרת ותוכן לכתבה');
      return;
    }
    publishNewsMutation.mutate({
      tag: newsDraft.tag.trim() || 'חדשות',
      title,
      excerpt,
      image: newsDraft.image.trim() || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=85',
      author: discordUser?.username ?? 'knafe3',
    });
    setNewsDraft({ title: '', tag: 'חדשות', excerpt: '', image: '' });
  };

  const handleDeleteNews = (id: string) => {
    deleteNewsMutation.mutate({ id });
  };

  /** Skip the live match clock to minute 80 */
  const handleSkipTo80 = () => {
    gameRef.current?.skipToMinute(80);
    showToast("⏩ קפצנו לדקה 80'");
  };

  useEffect(() => {
    if (!myTeam || !liveStarted || !liveHud.message || liveRewardedKey.current === liveKey) return;
    if (!liveHud.message.startsWith('FULL TIME')) return;

    const result = liveHud.message.includes('DRAW')
      ? 'draw'
      : liveHud.message.includes(myTeam.name.toUpperCase())
      ? 'win'
      : 'loss';
    const reward = matchReward(result);
    liveRewardedKey.current = liveKey;

    if (result === 'win') setWins((winsCount: number) => winsCount + 1);
    else if (result === 'draw') setDraws((drawsCount: number) => drawsCount + 1);
    else setLosses((lossesCount: number) => lossesCount + 1);

    if (liveOpponent) {
      setResults(previous => [{
        id: Date.now(),
        homeAbbr: myTeam.abbr,
        awayAbbr: liveOpponent.abbr,
        homeScore: liveHud.homeScore,
        awayScore: liveHud.awayScore,
        date: new Date().toLocaleDateString('he-IL'),
      }, ...previous.slice(0, 9)]);
    }

    setBudget(value => value + reward);
    showToast(`💰 קיבלת ₪${reward.toLocaleString()} על המשחק`);
  }, [liveHud, liveKey, liveStarted, liveOpponent, myTeam, showToast]);

  useEffect(() => {
    if (!liveStarted || !liveHud.message.startsWith('FULL TIME')) return;
    const finishTimer = window.setTimeout(() => {
      setLiveStarted(false);
      setLiveOpponent(null);
      setLiveHud(current => ({ ...current, message: '' }));
    }, 3000);

    return () => window.clearTimeout(finishTimer);
  }, [liveHud.message, liveStarted]);

  const selectedTeam = teamOptions[teamIndex] ?? teamOptions[0];

  useEffect(() => {
    if (!selectedTeam) return;
    setPickedAbbr(selectedTeam.abbr);
  }, [selectedTeam]);

  useEffect(() => {
    // Only active on the team-picker screen (before a team is selected)
    if (myTeam) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // Don't fire when the user is typing in an input/textarea
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (event.key === 'ArrowLeft') {
        setTeamIndex(current => (current === 0 ? teamOptions.length - 1 : current - 1));
      }
      if (event.key === 'ArrowRight') {
        setTeamIndex(current => (current + 1) % teamOptions.length);
      }
      if (event.key === 'Enter') {
        if (selectedTeam) handleSelectTeam();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [myTeam, selectedTeam, teamOptions.length]);

  const handleSelectTeam = () => {
    const target = selectedTeam ?? teamOptions[0];
    if (!target) return;

    const t = ISRAELI_TEAMS.find(team => team.abbr === target.abbr) ?? target;
    setPickedAbbr(target.abbr);
    setMyTeam(t);
    setSquad(previous => {
      if (previous.length >= 11) return previous;
      const existingIds = new Set(previous.map(player => player.id));
      const missingPlayers = createTeamRoster(t).filter(player => !existingIds.has(player.id));
      return [...previous, ...missingPlayers].slice(0, 11);
    });
    localStorage.setItem(STORAGE_KEYS.team, JSON.stringify(t.abbr));
    setTab('home');
  };

  const handleConnectDiscord = async () => {
    const clientId = '1546500518032183397';
    const redirectUri = getDiscordRedirectCandidates()[0];
    const nonce = crypto.randomUUID();
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const codeVerifier = btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier));
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    localStorage.setItem('fifa-il.discord.state', nonce);
    localStorage.setItem('fifa-il.discord.code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
      state: nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'consent',
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
  };

  const handleDisconnectDiscord = () => {
    setDiscordUser(null);
    localStorage.removeItem(STORAGE_KEYS.discord);
    localStorage.removeItem('fifa-il.discord.state');
    localStorage.removeItem('fifa-il.discord.code_verifier');
  };

  const handleResetAll = () => {
    if (!window.confirm('⚠️ זה ימחק את כל הנתונים שלך — קבוצה, שחקנים ותוצאות. בלתי הפיך. להמשיך?')) return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('fifa-il.discord.state');
    localStorage.removeItem('fifa-il.discord.code_verifier');
    setMyTeam(null);
    setPickedAbbr('');
    setDiscordUser(null);
    setResults([]);
    setSquad([]);
    setBudget(10_000_000);
    setWins(0); setDraws(0); setLosses(0);
    setTab('home');
    alert('✅ כל הנתונים נמחקו!');
    window.location.reload();
  };

  const handleBuy = (player: OwnedPlayer) => {
    if (budget < player.marketValue) {
      showToast(`❌ אין מספיק כסף! צריך ₪${player.marketValue.toLocaleString()}`);
      return;
    }
    if (squad.find(p => p.id === player.id)) {
      showToast('שחקן כבר בסגל');
      return;
    }
    setBudget(b => b - player.marketValue);
    setSquad(s => [...s, player]);
    showToast(`✅ ${player.nameHe} הצטרף לסגל!`);
  };

  const handleSell = (player: OwnedPlayer) => {
    const sellPrice = Math.round(player.marketValue * 0.8);
    setBudget(b => b + sellPrice);
    setSquad(s => s.filter(p => p.id !== player.id));
    showToast(`💰 מכרת את ${player.nameHe} תמורת ₪${sellPrice.toLocaleString()}`);
  };

  const handleChangePosition = (playerId: string, nextPosition: OwnedPlayer['position']) => {
    setSquad(prev => prev.map(player => player.id === playerId ? { ...player, position: nextPosition } : player));
  };

  const handleUpgradePlayer = (playerId: string) => {
    setSquad(prev => prev.map(player => {
      if (player.id !== playerId) return player;

      const nextLevel = (player.upgrades ?? 0) + 1;
      return {
        ...player,
        upgrades: nextLevel,
        ovr: Math.min(99, player.ovr + 1),
        pac: Math.min(99, player.pac + 1),
        sho: Math.min(99, player.sho + 1),
        pas: Math.min(99, player.pas + 1),
        dri: Math.min(99, player.dri + 1),
        def: Math.min(99, player.def + 1),
        phy: Math.min(99, player.phy + 1),
        marketValue: Math.round(player.marketValue * 1.15),
      };
    }));
  };

  const handleStartLiveMatch = useCallback((automatic = aiMatch) => {
    if (!myTeam) return;
    const opponentPool = TEAMS.filter((team) => team.abbr !== myTeam.abbr);
    const opponent = opponentPool[Math.floor(Math.random() * opponentPool.length)] ?? TEAMS[0];
    setLiveOpponent(opponent);
    setLiveStarted(true);
    setLiveKey((k) => k + 1);
    if (automatic) {
      setSimState('idle');
      setSimOpponent(null);
      setSimEvents([]);
    }
  }, [myTeam, aiMatch]);

  const handleGoToGame = () => {
    setTab('match');
    handleStartLiveMatch();
  };

  const handlePlayAI = useCallback(() => {
    setAiMatch(true);
    setTab('match');
    handleStartLiveMatch(true);
  }, [handleStartLiveMatch]);

  useEffect(() => {
    if (!myTeam || !liveStarted || !canvasRef.current || !liveOpponent) return;

    const game = new PitchKickGame(canvasRef.current, setLiveHud, myTeam, liveOpponent, { aiOnly: aiMatch });
    game.setTimeScale(liveSpeed);
    gameRef.current = game;
    game.start();

    return () => {
      game.stop();
      gameRef.current = null;
    };
  }, [myTeam, liveOpponent, liveStarted, liveKey]);

  useEffect(() => {
    gameRef.current?.setTimeScale(liveSpeed);
  }, [liveSpeed]);

  // ── match simulation ──────────────────────────
  const handleSimulate = useCallback(() => {
    if (!myTeam || simState === 'running') return;
    const opp = ISRAELI_TEAMS.filter(t => t.abbr !== myTeam.abbr)[Math.floor(Math.random() * 7)];
    setSimOpponent(opp);
    setSimState('running');
    setSimEvents([]);
    setMyScore(0);
    setOppScore(0);
    setSimMinute(0);

    let ms = 0, os = 0;
    const events: MatchEvent[] = [];
    // Always include a final 90th-minute tick so the simulation cannot stop
    // at the last random event (for example, minute 24).
    const eventMinutes = [...Array.from({ length: 8 }, () => Math.floor(Math.random() * 89) + 1), 90].sort((a,b)=>a-b);
    const speedMs = Math.max(120, 700 / gameSpeed);

    const commentaries = {
      goal:  ['⚽ גוול!', '⚽ שער מדהים!', '⚽ 1-0! מה בעיטה!'],
      miss:  ['😬 פספוס גדול...', '🙈 מהמוט!', '😤 מעל השער!'],
      save:  ['🧤 הצלה מדהימה!', '🧤 השוער מציל!'],
      card:  ['🟨 כרטיס צהוב', '🟥 כרטיס אדום!'],
      info:  ['🎯 פינה', '⚠️ עבירה', '🏃 החלפה'],
    };

    let i = 0;
    const interval = setInterval(() => {
      if (i >= eventMinutes.length) {
        clearInterval(interval);
        // סיום
        if (ms > os)      { setWins((w: number) => w + 1); }
        else if (ms === os){ setDraws((d: number) => d + 1); }
        else               { setLosses((l: number) => l + 1); }

        const result = ms > os ? 'win' : ms === os ? 'draw' : 'loss';
        const reward = matchReward(result);
        setBudget(value => value + reward);
        showToast(`💰 קיבלת ₪${reward.toLocaleString()} על המשחק`);

        setResults(prev => [{
          id: Date.now(),
          homeAbbr: myTeam.abbr,
          awayAbbr: opp.abbr,
          homeScore: ms,
          awayScore: os,
          date: new Date().toLocaleDateString('he-IL'),
        }, ...prev.slice(0, 9)]);

        setSimState('done');
        setSimMinute(90);
        return;
      }

      const min = eventMinutes[i];
      const isHome = Math.random() > 0.45;
      const roll = Math.random();
      let type: MatchEvent['type'];
      let text: string;

      if (roll < 0.35) {
        type = 'goal';
        const c = commentaries.goal[Math.floor(Math.random()*commentaries.goal.length)];
        text = `${min}' ${c} ${isHome ? myTeam.name : opp.name}`;
        if (isHome) ms++; else os++;
        setMyScore(ms); setOppScore(os);
      } else if (roll < 0.6) {
        type = 'miss';
        const c = commentaries.miss[Math.floor(Math.random()*commentaries.miss.length)];
        text = `${min}' ${c}`;
      } else if (roll < 0.75) {
        type = 'save';
        const c = commentaries.save[Math.floor(Math.random()*commentaries.save.length)];
        text = `${min}' ${c}`;
      } else if (roll < 0.85) {
        type = 'card';
        const c = commentaries.card[Math.floor(Math.random()*commentaries.card.length)];
        text = `${min}' ${c} - ${isHome ? myTeam.abbr : opp.abbr}`;
      } else {
        type = 'info';
        const c = commentaries.info[Math.floor(Math.random()*commentaries.info.length)];
        text = `${min}' ${c}`;
      }

      events.push({ minute: min, text, type });
      setSimEvents([...events]);
      setSimMinute(min);
      i++;
    }, speedMs);
  }, [myTeam, simState, gameSpeed]);

  const points   = wins * 3 + draws;
  const played   = wins + draws + losses;

  const marketFiltered = MARKET_PLAYERS.filter(p => {
    const notOwned  = !squad.find(s => s.id === p.id);
    const matchPos  = posFilter === 'ALL' || p.position === posFilter;
    const isIsraeli = p.teamAbbr === 'ISR' || ISRAELI_TEAMS.some(team => team.abbr === p.teamAbbr);
    const matchCategory = marketCategory === 'ALL'
      || (marketCategory === 'ISRAELI' && isIsraeli)
      || (marketCategory === 'WORLD' && !isIsraeli);
    const matchName = p.nameHe.includes(searchTerm) || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return notOwned && matchPos && matchCategory && matchName;
  });

  // ── Team Picker ───────────────────────────────
  if (!discordUser) {
    return (
      <div className="min-h-screen bg-[#070b10] flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-3xl rounded-[22px] border border-[#1a2635] bg-[#0c1219] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#c6ff2e]/60 bg-[#0d1725] shadow-[0_0_25px_rgba(198,255,46,0.35)]">
              <img src={LOGO_URL} alt="FIFA IL" className="h-full w-full object-cover logo-brand" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[#5d738c] text-[10px] uppercase tracking-[0.28em]">FIFA IL</div>
              <div className="text-white font-display text-2xl">Manager</div>
            </div>
          </div>

          <div className="mb-4 text-[#5d738c] text-xs uppercase tracking-[0.24em]">FIFA style manager</div>
          <h2 className="font-display text-4xl md:text-5xl text-white text-center mb-4 leading-none">
            התחבר ל-<span className="text-[#c6ff2e]">Discord</span>
          </h2>
          <p className="text-[#5d738c] text-sm md:text-base mb-8">
            לפני שתבחר קבוצה ותיכנס למשחק, יש להתחבר עם חשבון Discord.
          </p>

          <button
            onClick={handleConnectDiscord}
            className="px-6 py-3 rounded-full border border-[#2f4d74] bg-[#0c1521] text-white text-sm font-bold hover:border-[#c6ff2e]/70 hover:text-[#c6ff2e] transition-colors"
          >
            כניסה ל-Discord
          </button>
        </div>
      </div>
    );
  }

  if (!myTeam) {
    return (
      <div className="min-h-screen bg-[#070b10] flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-4xl rounded-[22px] border border-[#1a2635] bg-[#0c1219] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
            <button onClick={() => navigate('/game')} className="flex items-center gap-2 text-[#5d738c] hover:text-[#c6ff2e] transition-colors">
              <ArrowLeft size={18} /> חזרה למגרש
            </button>

            <div className="flex items-center gap-3 rounded-full border border-[#1d2f44] bg-[#0b1320] px-3 py-2 text-[#dfeaf5]">
              <img src={discordUser.avatar} alt={discordUser.username} className="h-8 w-8 rounded-full border border-[#1d2f44]" onError={(event) => { event.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }} />
              <div className="text-right leading-tight">
                <div className="text-[10px] text-[#5d738c] uppercase tracking-[0.2em]">Discord</div>
                <div className="text-sm font-bold text-white">{discordUser.username}</div>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#c6ff2e]/60 bg-[#0d1725] shadow-[0_0_25px_rgba(198,255,46,0.35)]">
              <img src={LOGO_URL} alt="FIFA IL" className="h-full w-full object-cover logo-brand" />
            </div>
            <div className="text-center">
              <div className="text-[#5d738c] text-[10px] uppercase tracking-[0.28em]">FIFA IL</div>
              <div className="text-white font-display text-2xl">ברוך הבא</div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[#5d738c] text-xs uppercase tracking-[0.24em]">FIFA style manager</div>
            <div className="flex items-center gap-2">
              <button onClick={handleConnectDiscord} className="px-3 py-1.5 rounded-full border border-[#1d2f44] bg-[#0b1320] text-[#dfeaf5] text-xs">
                {discordUser ? `Discord: ${discordUser.username}` : 'התחבר ל-Discord'}
              </button>
            </div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white text-center mb-2 leading-none">
            בחר את <span className="text-[#c6ff2e]">הקבוצה שלך</span>
          </h2>
          <p className="text-[#5d738c] text-center mb-8 text-sm md:text-base">בחר קבוצה מליגת העל כדי להתחיל את קריירת הניהול</p>

          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 md:gap-5 mb-5">
              <button
                type="button"
                onClick={() => setTeamIndex(current => (current === 0 ? teamOptions.length - 1 : current - 1))}
                className="h-12 w-12 rounded-full border border-[#243344] bg-[#0b1320] text-[#dfeaf5] text-xl shadow-lg transition hover:border-[#c6ff2e]/60 hover:text-[#c6ff2e]"
                aria-label="Choose previous team"
              >
                ←
              </button>

              <div className="flex items-end justify-center gap-3 md:gap-6 overflow-hidden px-2">
                {[-1, 0, 1].map(offset => {
                  const idx = (teamIndex + offset + teamOptions.length) % teamOptions.length;
                  const team = teamOptions[idx];
                  const isCurrent = offset === 0;

                  return (
                    <button
                      key={`${team.abbr}-${offset}`}
                      type="button"
                      onClick={() => setTeamIndex(idx)}
                      className="rounded-[20px] border transition-all duration-200 ease-out flex flex-col items-center justify-center text-center"
                      style={{
                        width: isCurrent ? 200 : 128,
                        height: isCurrent ? 230 : 176,
                        background: isCurrent
                          ? `linear-gradient(180deg, ${team.color}20, rgba(12,18,25,0.94))`
                          : '#0c1219',
                        borderColor: isCurrent ? team.color : '#1e2b3a',
                        boxShadow: isCurrent ? `0 0 0 1px ${team.color}66, 0 18px 48px rgba(0,0,0,0.28)` : 'none',
                        transform: isCurrent ? 'translateY(-2px) scale(1.02)' : 'scale(0.96)',
                        opacity: isCurrent ? 1 : 0.72,
                      }}
                    >
                      <div className="mb-3">
                        <TeamBadge team={team} size={isCurrent ? 88 : 54} />
                      </div>
                      <div className="text-[#dfeaf5] font-bold text-sm md:text-base leading-tight">{team.name}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#5d738c]">{team.abbr}</div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setTeamIndex(current => (current + 1) % teamOptions.length)}
                className="h-12 w-12 rounded-full border border-[#243344] bg-[#0b1320] text-[#dfeaf5] text-xl shadow-lg transition hover:border-[#c6ff2e]/60 hover:text-[#c6ff2e]"
                aria-label="Choose next team"
              >
                →
              </button>
            </div>

            <div className="text-center text-[#5d738c] text-xs uppercase tracking-[0.28em] mb-6">
              {selectedTeam.name} · {selectedTeam.abbr}
            </div>
          </div>

          {pickedAbbr && (
            <button
              onClick={handleSelectTeam}
              className="w-full py-4 rounded-lg font-heading uppercase tracking-wider text-lg font-bold"
              style={{ background: '#c6ff2e', color: '#070b10' }}
            >
              התחל קריירה →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Sidebar nav items ─────────────────────────
  const navItems = [
    { id: 'home',     icon: Home,         label: 'בית',         badge: INBOX_MESSAGES.filter(m=>!m.read).length },
    { id: 'squad',    icon: Users,        label: 'סגל',         badge: 0 },
    { id: 'lineup',   icon: LayoutGrid,   label: 'הרכב',        badge: 0 },
    { id: 'transfer', icon: ShoppingCart, label: 'העברות',      badge: 0 },
    { id: 'match',    icon: PlayCircle,   label: 'יום משחק',    badge: 0 },
    { id: 'league',   icon: Trophy,       label: 'טבלה',        badge: 0 },
    { id: 'results',  icon: History,      label: 'תוצאות',      badge: 0 },
    { id: 'news',     icon: Newspaper,    label: 'עדכוני FIFA', badge: newsArticles.length },
    { id: 'events',   icon: Zap,          label: 'אירועים',     badge: (events as any[]).filter((e: any) => !e.completed).length },
    { id: 'friends',  icon: UserPlus,     label: 'חברים',       badge: (friends as any[]).filter((f: any) => f.direction === 'received' && f.status === 'pending').length },
  ] as const;

  const changeTab = (nextTab: Tab) => {
    if (nextTab === tab) return;
    setTabDirection(
      TAB_ORDER.indexOf(nextTab) >= TAB_ORDER.indexOf(tab) ? 'next' : 'previous',
    );
    setTab(nextTab);
  };

  // ── Main layout ───────────────────────────────
  return (
    <div className="min-h-screen bg-[#070b10] flex" dir="rtl">

      {/* ── Toast ────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg bg-[#0c1219] border border-[#c6ff2e]/40 text-white text-sm shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* ── Sidebar ──────────────────────────── */}
      <aside className="w-60 bg-[#0c1219] border-l border-[#131c27] flex flex-col shrink-0">
        {/* Team header */}
        <div className="p-5 border-b border-[#131c27]">
          <button onClick={() => navigate('/game')} className="mb-4 flex items-center gap-2 text-[#5d738c] hover:text-[#c6ff2e] transition-colors text-sm">
            <ArrowLeft size={15} /> למגרש
          </button>
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <TeamBadge team={myTeam} size={48} />
            </div>
            <div>
              <p className="text-white font-heading text-base leading-tight">{myTeam.name}</p>
              <p className="text-[#5d738c] text-xs mt-0.5">מנהל ראשי</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-[#131c27]">
          {discordUser ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-[#070b10] border border-[#1d2f44] p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <img src={discordUser.avatar} alt={discordUser.username} className="w-8 h-8 rounded-full border border-[#1d2f44]" onError={(event) => { event.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }} />
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">{discordUser.username}</p>
                  <p className="text-[#5d738c] text-[10px]">Discord</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button onClick={handleDisconnectDiscord} className="text-[#5d738c] text-[10px] hover:text-[#c6ff2e]">התנתק</button>
                <button onClick={handleResetAll} className="text-rose-500 text-[10px] hover:text-rose-300 font-bold">⚠ אפס הכל</button>
              </div>
            </div>
          ) : (
            <button onClick={handleConnectDiscord} className="w-full rounded-lg border border-[#1d2f44] bg-[#070b10] px-3 py-2 text-sm text-[#dfeaf5] hover:border-[#c6ff2e]/50 hover:text-[#c6ff2e] transition-colors">
              התחבר ל-Discord
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => changeTab(id as Tab)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1.5 border transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(30,126,242,0.18)]"
              style={{
                background: tab === id ? 'linear-gradient(135deg, #ebf5ff 0%, #cfe8ff 100%)' : 'rgba(11, 19, 32, 0.58)',
                color: tab === id ? '#071d32' : '#b8c9e8',
                borderColor: tab === id ? 'rgba(30,126,242,0.9)' : 'rgba(28,45,68,0.8)',
                boxShadow: tab === id ? '0 16px 30px rgba(30,126,242,0.18)' : 'none',
              }}
            >
              <Icon size={18} />
              <span className="font-heading flex-1 text-right">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: tab === id ? '#0b1d2d' : '#1e7ef2', color: tab === id ? '#1e7ef2' : '#ffffff' }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Budget + Go to game */}
        <div className="p-4 border-t border-[#131c27] space-y-3">
          <button
            onClick={handleGoToGame}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading uppercase text-sm tracking-wider transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(198,255,46,0.28)]"
            style={{ background: 'linear-gradient(135deg, #c6ff2e, #d6ff5e)', color: '#070b10' }}
          >
            <PlayCircle size={16} /> שחק במגרש
          </button>
          <div className="bg-[#070b10] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={13} className="text-[#c6ff2e]" />
              <span className="text-[#5d738c] text-xs">תקציב זמין</span>
            </div>
            <p className="font-display text-xl text-white">₪{budget.toLocaleString()}</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div
          key={tab}
          className={`p-6 max-w-5xl manager-tab-panel manager-tab-panel-${tabDirection}`}
        >

          {/* ══ HOME ══════════════════════════════════ */}
          {tab === 'home' && (
            <div>
              <h1 className="font-display text-5xl text-white mb-6">
                לוח <span className="text-[#c6ff2e]">ניהול</span>
              </h1>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'משחקים', value: played, sub: `${wins}W ${draws}D ${losses}L` },
                  { label: 'נקודות', value: points, sub: `מקום 1 בטבלה` },
                  { label: 'תקציב',  value: `₪${(budget/1_000_000).toFixed(1)}M`, sub: 'זמין לרכישות' },
                ].map(card => (
                  <div key={card.label} className="bg-[#0c1219] border border-[#131c27] rounded-xl p-5">
                    <p className="text-[#5d738c] text-sm mb-1">{card.label}</p>
                    <p className="font-display text-4xl text-white">{card.value}</p>
                    <p className="text-[#2c3e52] text-xs mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Inbox */}
                <div className="bg-[#0c1219] border border-[#1a2d45] rounded-2xl p-5 shadow-[0_20px_45px_rgba(11,29,45,0.28)]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e7ef2]/10 text-[#7ab9ff]">
                      <Inbox size={18} />
                    </div>
                    <h2 className="font-heading text-white text-lg">תיבת דואר</h2>
                    <span className="mr-auto text-xs text-[#9ab7d7]">{INBOX_MESSAGES.filter(m=>!m.read).length} חדשים</span>
                  </div>
                  <div className="space-y-2">
                    {INBOX_MESSAGES.map(msg => (
                      <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#071821] border border-[#18314d] hover:border-[#2d7ef3] hover:bg-[#0c1d2d] transition-all duration-200 cursor-pointer">
                        {!msg.read && <div className="w-2 h-2 rounded-full bg-[#1e7ef2] mt-1.5 shrink-0 shadow-[0_0_12px_rgba(30,126,242,0.8)]" />}
                        {msg.read  && <div className="w-2 h-2 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{msg.subject}</p>
                          <p className="text-[#8aa5c8] text-xs">{msg.from} · {msg.time}</p>
                        </div>
                        <ChevronRight size={14} className="text-[#6d8db7] shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixtures */}
                <div className="bg-[#0c1219] border border-[#1a2d45] rounded-2xl p-5 shadow-[0_20px_45px_rgba(11,29,45,0.28)] lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e7ef2]/10 text-[#7ab9ff]">
                      <Calendar size={18} />
                    </div>
                    <h2 className="font-heading text-white text-lg">משחקים קרובים</h2>
                  </div>
                  <div className="space-y-2">
                    {TEAMS.filter(t => t.abbr !== myTeam.abbr).slice(0, 4).map((opp, i) => (
                      <div key={opp.abbr} className="flex items-center gap-3 p-3 rounded-xl bg-[#071821] border border-[#18314d] hover:border-[#2d7ef3] transition-all duration-200">
                        <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                          <TeamBadge team={opp} size={36} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{opp.name}</p>
                          <p className="text-[#8aa5c8] text-xs">מחזור {i + 1}</p>
                        </div>
                        <span className="text-[#9ab7d7] text-xs">
                          {['יום ג׳', 'שבת', 'שלישי', 'ראשון'][i]} {['19:45', '20:30', '19:00', '21:00'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ FIFA NEWS ════════════════════════════ */}
          {tab === 'news' && (
            <div>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 font-heading text-xs uppercase tracking-[0.28em] text-[#6e9ed1]">FIFA IL Newsroom</p>
                  <h1 className="font-display text-5xl text-white">
                    עדכוני <span className="text-[#1e7ef2]">FIFA</span>
                  </h1>
                </div>
                {isNewsAdmin && (
                  <span className="rounded-full border border-[#1e7ef2]/50 bg-[#1e7ef2]/10 px-3 py-1.5 text-xs font-bold text-[#9dccff]">
                    מנהל מערכת · knafe3
                  </span>
                )}
              </div>

              {isNewsAdmin && (
                <section className="mb-6 rounded-2xl border border-[#1e7ef2]/40 bg-[radial-gradient(circle_at_top_right,_rgba(30,126,242,0.2),_rgba(12,18,25,0.96)_60%)] p-5 shadow-[0_20px_45px_rgba(11,29,45,0.28)]">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e7ef2] text-white">
                      <Plus size={18} />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg text-white">כתיבת כתבה חדשה</h2>
                      <p className="text-xs text-[#8aa5c8]">הכתבה תופיע לכל משתמשי המערכת</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={newsDraft.title}
                      onChange={event => setNewsDraft(draft => ({ ...draft, title: event.target.value }))}
                      placeholder="כותרת הכתבה"
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none transition focus:border-[#67b0ff]"
                    />
                    <input
                      value={newsDraft.tag}
                      onChange={event => setNewsDraft(draft => ({ ...draft, tag: event.target.value }))}
                      placeholder="תגית, לדוגמה: העברות"
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none transition focus:border-[#67b0ff]"
                    />
                    <textarea
                      value={newsDraft.excerpt}
                      onChange={event => setNewsDraft(draft => ({ ...draft, excerpt: event.target.value }))}
                      placeholder="תוכן קצר לכתבה"
                      rows={3}
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none transition focus:border-[#67b0ff] md:col-span-2"
                    />
                    <input
                      value={newsDraft.image}
                      onChange={event => setNewsDraft(draft => ({ ...draft, image: event.target.value }))}
                      placeholder="קישור לתמונה (אופציונלי)"
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none transition focus:border-[#67b0ff] md:col-span-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePublishNews}
                    className="mt-4 rounded-xl bg-[#1e7ef2] px-5 py-2.5 font-heading text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#4a9ef3]"
                  >
                    פרסם כתבה
                  </button>
                </section>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {newsArticles.map(article => (
                  <article key={article.id} className="overflow-hidden rounded-2xl border border-[#1d3a5c] bg-[#0c1219] shadow-[0_18px_40px_rgba(3,12,23,0.3)] transition duration-300 hover:-translate-y-1 hover:border-[#4fa0ff]">
                    <div className="relative h-48 overflow-hidden bg-[#071821]">
                      <img src={article.image} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1219] via-transparent to-transparent" />
                      <span className="absolute right-4 top-4 rounded-full bg-[#071821]/85 px-3 py-1 text-[10px] font-bold text-[#cfe8ff] backdrop-blur">
                        {article.tag}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] text-[#8aa5c8]">
                        <span>{new Date(article.createdAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {article.author && <span>מאת {article.author}</span>}
                      </div>
                      <h2 className="font-heading text-xl leading-tight text-white">{article.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-[#a8bfdc]">{article.excerpt}</p>
                      {isNewsAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteNews(article.id)}
                          className="mt-4 flex items-center gap-2 text-xs text-rose-300 transition hover:text-rose-200"
                        >
                          <Trash2 size={14} /> מחק כתבה
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ══ EVENTS ════════════════════════════════ */}
          {tab === 'events' && (
            <div>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 font-heading text-xs uppercase tracking-[0.28em] text-[#6e9ed1]">FIFA IL Events</p>
                  <h1 className="font-display text-5xl text-white">
                    אירועים <span className="text-[#c6ff2e]">ואתגרים</span>
                  </h1>
                </div>
                {isNewsAdmin && (
                  <button
                    type="button"
                    onClick={() => setEventDraftOpen(v => !v)}
                    className="flex items-center gap-2 rounded-xl bg-[#c6ff2e] px-4 py-2 font-heading text-sm font-bold text-[#070b10] transition hover:-translate-y-0.5"
                  >
                    <Plus size={15} /> אירוע חדש
                  </button>
                )}
              </div>

              {isNewsAdmin && eventDraftOpen && (
                <section className="mb-6 rounded-2xl border border-[#c6ff2e]/30 bg-[#0c1219] p-5">
                  <h2 className="mb-4 font-heading text-lg text-white">יצירת אירוע חדש</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={eventDraft.title} onChange={e => setEventDraft(d => ({ ...d, title: e.target.value }))}
                      placeholder="שם האירוע" className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff2e]" />
                    <select value={eventDraft.type} onChange={e => setEventDraft(d => ({ ...d, type: e.target.value as any }))}
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff2e]">
                      <option value="win_streak">ניצחונות ברצף</option>
                      <option value="goals">שערים במשחק</option>
                      <option value="matches">משחקים</option>
                    </select>
                    <textarea value={eventDraft.description} onChange={e => setEventDraft(d => ({ ...d, description: e.target.value }))}
                      placeholder="תיאור האתגר" rows={2}
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff2e] md:col-span-2" />
                    <div className="flex gap-2">
                      <input type="number" value={eventDraft.target} onChange={e => setEventDraft(d => ({ ...d, target: Number(e.target.value) }))}
                        placeholder="יעד (5=5ניצחונות)" min={1}
                        className="w-full rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff2e]" />
                      <input type="number" value={eventDraft.reward} onChange={e => setEventDraft(d => ({ ...d, reward: Number(e.target.value) }))}
                        placeholder="פרס ₪" min={0}
                        className="w-full rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff2e]" />
                    </div>
                    <input type="datetime-local" value={eventDraft.expiresAt} onChange={e => setEventDraft(d => ({ ...d, expiresAt: e.target.value }))}
                      className="rounded-xl border border-[#24466d] bg-[#071821] px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff2e]" />
                  </div>
                  <button type="button" onClick={() => createEventMutation.mutate({ ...eventDraft, expiresAt: eventDraft.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString() })}
                    className="mt-4 rounded-xl bg-[#c6ff2e] px-5 py-2.5 font-heading text-sm font-bold text-[#070b10] transition hover:-translate-y-0.5">
                    צור אירוע
                  </button>
                </section>
              )}

              {(events as any[]).length === 0 ? (
                <div className="rounded-xl border border-[#131c27] bg-[#0c1219] p-12 text-center">
                  <Zap size={48} className="mx-auto mb-4 text-[#c6ff2e]/30" />
                  <p className="text-[#5d738c]">אין אירועים פעילים כרגע</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {(events as any[]).map((ev: any) => (
                    <div key={ev.id} className={`relative rounded-2xl border p-5 transition ${ev.completed ? 'border-[#c6ff2e]/60 bg-[#c6ff2e]/5' : 'border-[#1d3a5c] bg-[#0c1219]'}`}>
                      {ev.completed && (
                        <span className="absolute left-4 top-4 rounded-full bg-[#c6ff2e] px-2 py-0.5 text-[10px] font-bold text-[#070b10]">✓ הושלם</span>
                      )}
                      <div className="mb-1 flex items-center gap-2">
                        <Zap size={16} className={ev.completed ? 'text-[#c6ff2e]' : 'text-amber-400'} />
                        <span className="font-heading text-lg text-white">{ev.title}</span>
                      </div>
                      <p className="mb-3 text-sm text-[#8aa5c8]">{ev.description}</p>
                      <div className="mb-1 flex items-center justify-between text-xs text-[#5d738c]">
                        <span>התקדמות: {ev.progress} / {ev.target}</span>
                        <span className="text-[#c6ff2e] font-bold">פרס: ₪{ev.reward.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#131c27]">
                        <div className="h-full rounded-full bg-[#c6ff2e] transition-all duration-500"
                          style={{ width: `${Math.min(100, (ev.progress / ev.target) * 100)}%` }} />
                      </div>
                      <p className="mt-2 text-[10px] text-[#3d5a78]">
                        פג תוקף: {new Date(ev.expiresAt).toLocaleDateString('he-IL')}
                      </p>
                      {isNewsAdmin && (
                        <button type="button" onClick={() => deleteEventMutation.mutate({ id: ev.id })}
                          className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300">
                          <Trash2 size={12} /> מחק
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ FRIENDS ═══════════════════════════════ */}
          {tab === 'friends' && (
            <div>
              <div className="mb-7">
                <p className="mb-2 font-heading text-xs uppercase tracking-[0.28em] text-[#6e9ed1]">FIFA IL Social</p>
                <h1 className="font-display text-5xl text-white">
                  חברים <span className="text-[#c6ff2e]">ו-1v1</span>
                </h1>
              </div>

              {!discordUser ? (
                <div className="rounded-xl border border-[#131c27] bg-[#0c1219] p-12 text-center">
                  <UserPlus size={48} className="mx-auto mb-4 text-[#c6ff2e]/40" />
                  <p className="text-[#5d738c] mb-2">יש להתחבר עם Discord כדי להשתמש בחברים</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Search + add */}
                  <div className="rounded-2xl border border-[#1d3a5c] bg-[#0c1219] p-5">
                    <h2 className="mb-3 font-heading text-lg text-white flex items-center gap-2">
                      <Search size={16} className="text-[#c6ff2e]" /> חיפוש שחקנים
                    </h2>
                    <div className="flex gap-2">
                      <input
                        value={friendSearch}
                        onChange={e => setFriendSearch(e.target.value)}
                        placeholder="חפש לפי שם משתמש Discord..."
                        className="flex-1 rounded-xl border border-[#24466d] bg-[#071821] px-4 py-2.5 text-sm text-white outline-none focus:border-[#c6ff2e]"
                      />
                    </div>
                    {(searchResults as any[]).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {(searchResults as any[]).map((u: any) => (
                          <div key={u.userId} className="flex items-center justify-between rounded-xl border border-[#1d2f44] bg-[#071821] px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              {u.avatar ? <img src={u.avatar} className="h-8 w-8 rounded-full" alt="" /> : <div className="h-8 w-8 rounded-full bg-[#1e7ef2] flex items-center justify-center text-xs font-bold text-white">{u.username[0]}</div>}
                              <div>
                                <div className="text-sm font-bold text-white">{u.username}</div>
                                <div className="text-xs text-[#5d738c]">{u.teamAbbr}</div>
                              </div>
                            </div>
                            <button type="button" onClick={() => sendFriendMutation.mutate({ toUserId: u.userId })}
                              className="rounded-lg bg-[#1e7ef2] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4a9ef3]">
                              + הוסף
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending requests */}
                  {(friends as any[]).filter((f: any) => f.direction === 'received' && f.status === 'pending').length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-[#0c1219] p-5">
                      <h2 className="mb-3 font-heading text-lg text-white flex items-center gap-2">
                        <Inbox size={16} className="text-amber-400" /> בקשות ממתינות
                      </h2>
                      <div className="space-y-2">
                        {(friends as any[]).filter((f: any) => f.direction === 'received' && f.status === 'pending').map((f: any) => (
                          <div key={f.id} className="flex items-center justify-between rounded-xl border border-[#1d2f44] bg-[#071821] px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              {f.avatar ? <img src={f.avatar} className="h-8 w-8 rounded-full" alt="" /> : <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-[#070b10]">{f.username[0]}</div>}
                              <span className="text-sm font-bold text-white">{f.username}</span>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => acceptFriendMutation.mutate({ id: f.id })}
                                className="rounded-lg bg-[#c6ff2e] px-3 py-1.5 text-xs font-bold text-[#070b10]">
                                <Check size={13} />
                              </button>
                              <button type="button" onClick={() => removeFriendMutation.mutate({ id: f.id })}
                                className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10">
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Friends list */}
                  <div className="rounded-2xl border border-[#1d3a5c] bg-[#0c1219] p-5">
                    <h2 className="mb-3 font-heading text-lg text-white flex items-center gap-2">
                      <Users size={16} className="text-[#c6ff2e]" /> החברים שלי ({(friends as any[]).filter((f: any) => f.status === 'accepted').length})
                    </h2>
                    {(friends as any[]).filter((f: any) => f.status === 'accepted').length === 0 ? (
                      <p className="text-sm text-[#5d738c] text-center py-4">עדיין אין חברים. חפש שחקנים למעלה!</p>
                    ) : (
                      <div className="space-y-2">
                        {(friends as any[]).filter((f: any) => f.status === 'accepted').map((f: any) => (
                          <div key={f.id} className="flex items-center justify-between rounded-xl border border-[#1d2f44] bg-[#071821] px-4 py-3">
                            <div className="flex items-center gap-3">
                              {f.avatar ? <img src={f.avatar} className="h-9 w-9 rounded-full" alt="" /> : <div className="h-9 w-9 rounded-full bg-[#1e7ef2] flex items-center justify-center text-sm font-bold text-white">{f.username[0]}</div>}
                              <div>
                                <div className="font-bold text-white text-sm">{f.username}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button"
                                onClick={() => sendChallengeMutation.mutate({ toUserId: f.userId })}
                                className="flex items-center gap-1.5 rounded-lg bg-[#c6ff2e] px-3 py-1.5 text-xs font-bold text-[#070b10] transition hover:-translate-y-0.5">
                                <Swords size={13} /> אתגר 1v1
                              </button>
                              <button type="button" onClick={() => removeFriendMutation.mutate({ id: f.id })}
                                className="rounded-lg border border-[#26384b] px-2 py-1.5 text-xs text-[#5d738c] hover:text-rose-400 transition">
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Challenges */}
                  {(challenges as any[]).length > 0 && (
                    <div className="rounded-2xl border border-[#c6ff2e]/20 bg-[#0c1219] p-5">
                      <h2 className="mb-3 font-heading text-lg text-white flex items-center gap-2">
                        <Swords size={16} className="text-[#c6ff2e]" /> אתגרי 1v1
                      </h2>
                      <div className="space-y-2">
                        {(challenges as any[]).map((c: any) => {
                          const isFrom = c.fromUserId === discordUser?.id;
                          const opponent = isFrom ? c.toUsername : c.fromUsername;
                          const isPending = c.status === 'pending';
                          const isIncoming = isPending && !isFrom;
                          return (
                            <div key={c.id} className="flex items-center justify-between rounded-xl border border-[#1d2f44] bg-[#071821] px-4 py-3">
                              <div>
                                <div className="text-sm font-bold text-white">
                                  {isFrom ? `אתגרת את ${opponent}` : `${opponent} אתגר אותך`}
                                </div>
                                <div className="text-xs text-[#5d738c]">
                                  {c.fromTeamAbbr} vs {c.toTeamAbbr} · {isPending ? 'ממתין' : 'הוקבל'}
                                </div>
                              </div>
                              {isIncoming && (
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => respondChallengeMutation.mutate({ id: c.id, accept: true })}
                                    className="rounded-lg bg-[#c6ff2e] px-3 py-1.5 text-xs font-bold text-[#070b10]">
                                    קבל
                                  </button>
                                  <button type="button" onClick={() => respondChallengeMutation.mutate({ id: c.id, accept: false })}
                                    className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-400">
                                    סרב
                                  </button>
                                </div>
                              )}
                              {!isPending && c.status === 'accepted' && (
                                <span className="rounded-full bg-[#c6ff2e]/10 border border-[#c6ff2e]/40 px-3 py-1 text-xs font-bold text-[#c6ff2e]">
                                  🎮 שחק עכשיו
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ SQUAD ═════════════════════════════════ */}
          {tab === 'squad' && (
            <div>
              <h1 className="font-display text-5xl text-white mb-6">
                הסגל <span className="text-[#c6ff2e]">שלי</span>
              </h1>
              {squad.length === 0 ? (
                <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-16 text-center">
                  <Users size={48} className="mx-auto mb-4" style={{ color: '#1e2b3a' }} />
                  <p className="text-[#5d738c] text-lg mb-4">עדיין אין שחקנים בסגל</p>
                  <button onClick={() => setTab('transfer')}
                    className="px-6 py-3 rounded-lg font-heading uppercase tracking-wider text-sm"
                    style={{ background: '#c6ff2e', color: '#070b10' }}>
                    לשוק העברות
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {squad.map(p => (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      action="sell"
                      onAction={() => handleSell(p)}
                      onChangePosition={handleChangePosition}
                      onUpgrade={handleUpgradePlayer}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ LINEUP ════════════════════════════════ */}
          {tab === 'lineup' && (
            <div>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h1 className="font-display text-5xl text-white">
                  <span className="text-[#c6ff2e]">הרכב</span> כדורגל
                </h1>
                <span className="rounded-full border border-[#c6ff2e]/40 bg-[#c6ff2e]/10 px-3 py-1 text-xs text-[#c6ff2e]">שינוי נשמר אוטומטית</span>
              </div>

              {squad.length === 0 ? (
                <div className="rounded-xl border border-[#131c27] bg-[#0c1219] p-16 text-center">
                  <LayoutGrid size={48} className="mx-auto mb-4 text-[#1e2b3a]" />
                  <p className="mb-4 text-lg text-[#5d738c]">קנה שחקנים כדי לבנות הרכב</p>
                  <button onClick={() => setTab('transfer')} className="rounded-lg px-6 py-3 font-heading text-sm" style={{ background: '#c6ff2e', color: '#070b10' }}>
                    לשוק ההעברות
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-[#315a43] bg-[linear-gradient(180deg,#174d35,#0d3326)] p-5">
                    <div className="pointer-events-none absolute inset-5 rounded-xl border border-white/25" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
                    {(['GK', 'DEF', 'MID', 'FWD'] as const).map((position, index) => {
                      const players = squad.filter(player => player.position === position);
                      const rowClass = ['bottom-5', 'bottom-32', 'top-1/2 -translate-y-1/2', 'top-8'][index];
                      return (
                        <div key={position} className={`absolute left-8 right-8 ${rowClass} flex justify-center gap-2 sm:gap-5`}>
                          {players.length === 0 && <span className="rounded-full border border-dashed border-white/20 px-3 py-1 text-xs text-white/40">{position}</span>}
                          {players.map(player => (
                            <div key={player.id} className="flex w-20 flex-col items-center">
                              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#c6ff2e] bg-[#0c1219] shadow-lg">
                                <PlayerPhoto player={player} />
                              </div>
                              <span className="mt-1 max-w-full truncate rounded bg-[#070b10]/80 px-1.5 text-[10px] font-bold text-white">{player.nameHe}</span>
                              <span className="text-[10px] font-bold text-[#c6ff2e]">{player.ovr}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 rounded-2xl border border-[#131c27] bg-[#0c1219] p-4">
                    <h2 className="mb-3 font-heading text-lg text-white">שחקני ההרכב</h2>
                    {squad.map(player => (
                      <div key={player.id} className="flex items-center gap-2 rounded-lg bg-[#070b10] p-2">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#26384b]"><PlayerPhoto player={player} /></div>
                        <span className="min-w-0 flex-1 truncate text-sm text-white">{player.nameHe}</span>
                        <select
                          value={player.position}
                          onChange={(event) => handleChangePosition(player.id, event.target.value as OwnedPlayer['position'])}
                          className="rounded border border-[#1d2f44] bg-[#0c1219] px-1.5 py-1 text-xs text-white outline-none"
                        >
                          <option value="GK">GK</option>
                          <option value="DEF">DEF</option>
                          <option value="MID">MID</option>
                          <option value="FWD">FWD</option>
                        </select>
                        <span className="w-6 text-center text-sm font-bold text-[#c6ff2e]">{player.ovr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TRANSFER ══════════════════════════════ */}
          {tab === 'transfer' && (
            <div>
              <h1 className="font-display text-5xl text-white mb-6">
                שוק <span className="text-[#c6ff2e]">העברות</span>
              </h1>
              <div className="flex flex-wrap gap-3 mb-5">
                {(['ALL', 'ISRAELI', 'WORLD'] as const).map(category => (
                  <button key={category} onClick={() => setMarketCategory(category)}
                    className="rounded-full px-4 py-2.5 font-heading text-sm transition-all duration-200"
                    style={{
                      background: marketCategory === category ? 'linear-gradient(135deg, #eaf4ff 0%, #d0e7ff 100%)' : '#0b1d2d',
                      color: marketCategory === category ? '#071d32' : '#b6c8e5',
                      border: marketCategory === category ? '1px solid rgba(30,126,242,0.9)' : '1px solid rgba(31,53,78,0.9)',
                      boxShadow: marketCategory === category ? '0 10px 24px rgba(30,126,242,0.2)' : 'none',
                    }}>
                    {category === 'ALL' ? 'כל השחקנים' : category === 'ISRAELI' ? 'שחקנים ישראלים' : 'שחקני העולם'}
                  </button>
                ))}
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5d738c]" />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="חפש שחקן..."
                    className="w-full pr-9 pl-4 py-2.5 rounded-lg text-white text-sm outline-none"
                    style={{ background: '#0c1219', border: '1px solid #131c27' }}
                  />
                </div>
                {(['ALL','GK','DEF','MID','FWD'] as const).map(pos => (
                  <button key={pos} onClick={() => setPosFilter(pos)}
                    className="px-4 py-2.5 rounded-full font-heading text-sm transition-all duration-200"
                    style={{
                      background: posFilter === pos ? 'linear-gradient(135deg, #eaf4ff 0%, #d0e7ff 100%)' : '#0b1d2d',
                      color: posFilter === pos ? '#071d32' : '#b6c8e5',
                      border: posFilter === pos ? '1px solid rgba(30,126,242,0.9)' : '1px solid rgba(31,53,78,0.9)',
                      boxShadow: posFilter === pos ? '0 10px 24px rgba(30,126,242,0.18)' : 'none',
                    }}>
                    {pos === 'ALL' ? 'הכל' : pos}
                  </button>
                ))}
              </div>
              {marketFiltered.length === 0 ? (
                <p className="text-[#5d738c] text-center py-12">לא נמצאו שחקנים</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {marketFiltered.map(p => (
                    <PlayerCard
                      key={p.id} player={p} action="buy"
                      canAfford={budget >= p.marketValue}
                      onAction={() => handleBuy(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ MATCH DAY ═════════════════════════════ */}
          {tab === 'match' && (
            <div>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h1 className="font-display text-5xl text-white">
                  יום <span className="text-[#c6ff2e]">משחק</span>
                </h1>
                {myTeam && liveOpponent && (
                  <button
                    onClick={() => { setLiveKey((k) => k + 1); setLiveStarted(true); }}
                    className="rounded-lg px-4 py-2 text-xs font-heading uppercase tracking-wider text-night-950 bg-volt-500 hover:bg-volt-400 transition-colors"
                  >
                    שחק שוב
                  </button>
                )}
              </div>

              {!myTeam ? (
                <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-10 text-center">
                  <Activity size={56} className="mx-auto mb-5 text-[#c6ff2e]" />
                  <h2 className="font-heading text-2xl text-white mb-2">בחר קבוצה תחילה</h2>
                  <p className="text-[#5d738c] mb-6">המשחק יפתח בתוך דף הניהול, עם הקבוצה שבחרת מול יריבה אקטריבית.</p>
                </div>
              ) : !liveStarted || !liveOpponent ? (
                <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-10 text-center">
                  <Activity size={56} className="mx-auto mb-5 text-[#c6ff2e]" />
                  <h2 className="font-heading text-2xl text-white mb-2">מוכן לשחק?</h2>
                  <p className="text-[#5d738c] mb-6">המשחק יופיע כאן, באותו דף של הניהול, בלי לעבור למסך נפרד.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => handleStartLiveMatch()}
                      className="px-8 py-3 rounded-lg font-heading uppercase tracking-wider text-lg font-bold"
                      style={{ background: '#c6ff2e', color: '#070b10' }}>
                      ▶ התחל משחק
                    </button>
                    <button onClick={handlePlayAI}
                      className="px-8 py-3 rounded-xl font-heading uppercase tracking-wider text-sm border border-[#c6ff2e]/40 text-[#c6ff2e] hover:bg-[#c6ff2e]/10 transition-all duration-200 ease-out hover:-translate-y-0.5">
                      שחקנים משחקים לבד
                    </button>
                    <button onClick={handleSimulate}
                      className="px-8 py-3 rounded-lg font-heading uppercase tracking-wider text-sm border border-[#c6ff2e]/40 text-[#c6ff2e] hover:bg-[#c6ff2e]/10 transition-colors">
                      סימולציה מהירה
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="text-[#5d738c] text-xs">מהירות משחק</span>
                    <input type="range" min="1" max="3" step="0.5" value={gameSpeed} onChange={(e) => setGameSpeed(Number(e.target.value))} className="accent-[#c6ff2e]" />
                    <span className="text-[#c6ff2e] text-xs font-bold">{gameSpeed.toFixed(1)}x</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <TeamBadge team={myTeam} size={42} />
                        <span className="font-heading text-white text-lg">{myTeam.name}</span>
                      </div>
                      <div className="text-center px-6">
                        <div className="font-display text-5xl text-white tabular-nums">
                          {liveHud.homeScore} – {liveHud.awayScore}
                        </div>
                        <div className="text-[#5d738c] text-sm mt-1 tabular-nums">{Math.floor(liveHud.clock / 60)}:{String(Math.floor(liveHud.clock % 60)).padStart(2, '0')}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-white text-lg">{liveOpponent.name}</span>
                        <TeamBadge team={liveOpponent} size={42} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-[#1d2f44] bg-[#070b10] px-3 py-2 text-sm">
                      <span className="text-[#5d738c]">הכדור אצל</span>
                      {liveHud.possessionPlayer ? (
                        <>
                          <span className="font-bold text-[#c6ff2e]">{liveHud.possessionPlayer.name}</span>
                          <span className="text-[#8295ab]">#{liveHud.possessionPlayer.num}</span>
                          <span className="text-[#5d738c]">({liveHud.possession === 'home' ? myTeam.name : liveOpponent.name})</span>
                          <span className="tabular-nums text-white">{liveHud.possessionDuration.toFixed(1)} שנ׳</span>
                        </>
                      ) : (
                        <span className="text-[#8295ab]">כדור חופשי</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="text-xs text-[#5d738c]">מהירות משחק</span>
                      {[{ value: 1, label: 'רגיל' }, { value: 2, label: 'מהיר' }, { value: 4, label: 'סיום מהיר' }].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setLiveSpeed(option.value)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${liveSpeed === option.value ? 'border-[#c6ff2e] bg-[#c6ff2e] text-[#070b10]' : 'border-[#26384b] bg-[#070b10] text-[#9ab7d7] hover:border-[#c6ff2e]/60'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {/* Skip to 80' + AI toggle */}
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleSkipTo80}
                        disabled={liveHud.clock >= 80 * 60}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FastForward size={13} /> קפוץ לדקה 80'
                      </button>
                      {!aiMatch && (
                        <button
                          type="button"
                          onClick={() => { setAiMatch(true); gameRef.current?.setAiOnly(true); }}
                          className="flex items-center gap-1.5 rounded-lg border border-[#26384b] bg-[#070b10] px-3 py-1.5 text-xs font-bold text-[#9ab7d7] transition hover:border-[#c6ff2e]/60"
                        >
                          🤖 עבור ל-AI
                        </button>
                      )}
                      {aiMatch && (
                        <button
                          type="button"
                          onClick={() => { setAiMatch(false); gameRef.current?.setAiOnly(false); }}
                          className="flex items-center gap-1.5 rounded-lg border border-[#c6ff2e]/60 bg-[#c6ff2e]/10 px-3 py-1.5 text-xs font-bold text-[#c6ff2e] transition hover:bg-[#c6ff2e]/20"
                        >
                          🎮 שחק ידנית
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-[#131c27] bg-[#070b10] shadow-2xl shadow-black/40">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      className="block w-full h-auto max-w-full bg-[#070b10]"
                      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
                    />
                    {liveHud.message && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-6xl sm:text-7xl text-volt-500 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)] animate-pop tracking-wider text-center px-6">
                          {liveHud.message}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(simState === 'running' || simState === 'done') && simOpponent && (
                <div className="space-y-4 mt-6">
                  <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: myTeam?.color ?? '#c6ff2e', color: myTeam?.textColor ?? '#070b10' }}>{myTeam?.abbr}</div>
                        <span className="font-heading text-white text-lg">{myTeam?.name}</span>
                      </div>
                      <div className="text-center px-6">
                        <div className="font-display text-6xl text-white tabular-nums">{myScore} – {oppScore}</div>
                        <div className="text-[#5d738c] text-sm mt-1">{simState === 'running' ? `${simMinute}'` : 'FT'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading text-white text-lg">{simOpponent.name}</span>
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: simOpponent.color, color: simOpponent.textColor }}>{simOpponent.abbr}</div>
                      </div>
                    </div>
                    {simState === 'running' && (
                      <div className="mt-4 h-1.5 bg-[#131c27] rounded-full overflow-hidden">
                        <div className="h-full bg-[#c6ff2e] rounded-full transition-all duration-700" style={{ width: `${(simMinute / 90) * 100}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-5">
                    <h3 className="font-heading text-white mb-3 flex items-center gap-2"><Activity size={16} className="text-[#c6ff2e]" /> אירועי המשחק</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {[...simEvents].reverse().map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-[#131c27] last:border-0">
                          <span className="text-[#5d738c] tabular-nums w-8 shrink-0">{ev.minute}'</span>
                          <span className={ev.type === 'goal' ? 'text-[#c6ff2e] font-semibold' : ev.type === 'card' ? 'text-orange-400' : ev.type === 'save' ? 'text-blue-400' : 'text-[#a6b6c8]'}>{ev.text}</span>
                        </div>
                      ))}
                      {simEvents.length === 0 && (<p className="text-[#5d738c] text-sm text-center py-4">המשחק מתחיל...</p>)}
                    </div>
                  </div>

                  {simState === 'done' && (
                    <div className="flex gap-3">
                      <button onClick={() => setSimState('idle')} className="flex-1 py-3 rounded-lg font-heading uppercase tracking-wider text-sm" style={{ background: '#c6ff2e', color: '#070b10' }}>משחק חדש</button>
                      <button onClick={() => setTab('results')} className="flex-1 py-3 rounded-lg font-heading uppercase tracking-wider text-sm border border-[#131c27] text-[#8295ab] hover:text-white transition-colors">ראה תוצאות</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ LEAGUE ════════════════════════════════ */}
          {tab === 'league' && (
            <div>
              <h1 className="font-display text-5xl text-white mb-6">
                טבלת <span className="text-[#c6ff2e]">ליגה</span>
              </h1>
              <div className="bg-[#0c1219] border border-[#131c27] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#070b10]">
                    <tr className="text-right">
                      <th className="p-4 text-[#5d738c] font-heading text-xs uppercase">#</th>
                      <th className="p-4 text-[#5d738c] font-heading text-xs uppercase">קבוצה</th>
                      <th className="p-4 text-[#5d738c] font-heading text-xs uppercase">נ</th>
                      <th className="p-4 text-[#5d738c] font-heading text-xs uppercase">מ</th>
                      <th className="p-4 text-[#5d738c] font-heading text-xs uppercase">פ</th>
                      <th className="p-4 text-[#5d738c] font-heading text-xs uppercase text-[#c6ff2e]">נק׳</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* My team first */}
                    <tr className="border-t border-[#131c27]" style={{ background: `${myTeam.color}18` }}>
                      <td className="p-4 text-white font-bold">1</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TeamBadge team={myTeam} size={28} />
                          <span className="text-white font-heading">{myTeam.name}</span>
                          <Star size={12} className="text-[#c6ff2e]" />
                        </div>
                      </td>
                      <td className="p-4 text-white">{wins}</td>
                      <td className="p-4 text-white">{draws}</td>
                      <td className="p-4 text-white">{losses}</td>
                      <td className="p-4 text-[#c6ff2e] font-bold text-lg">{points}</td>
                    </tr>
                    {ISRAELI_TEAMS.filter(t => t.abbr !== myTeam.abbr).map((team, i) => {
                      const tw = Math.floor(Math.random() * 8);
                      const td2 = Math.floor(Math.random() * 5);
                      const tl = Math.floor(Math.random() * 7);
                      const tp = tw * 3 + td2;
                      return (
                        <tr key={team.abbr} className="border-t border-[#131c27] hover:bg-[#0c1219]/50">
                          <td className="p-4 text-[#5d738c]">{i + 2}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <TeamBadge team={team} size={28} />
                              <span className="text-[#a6b6c8] font-heading">{team.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-[#8295ab]">{tw}</td>
                          <td className="p-4 text-[#8295ab]">{td2}</td>
                          <td className="p-4 text-[#8295ab]">{tl}</td>
                          <td className="p-4 text-white font-bold">{tp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ RESULTS ═══════════════════════════════ */}
          {tab === 'results' && (
            <div>
              <h1 className="font-display text-5xl text-white mb-6">
                תוצאות <span className="text-[#c6ff2e]">אחרונות</span>
              </h1>
              {results.length === 0 ? (
                <div className="bg-[#0c1219] border border-[#131c27] rounded-xl p-16 text-center">
                  <History size={48} className="mx-auto mb-4" style={{ color: '#1e2b3a' }} />
                  <p className="text-[#5d738c] text-lg">עדיין אין תוצאות</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map(r => {
                    const userScore = r.homeScore;
                    const oppScore2 = r.awayScore;
                    const won   = userScore > oppScore2;
                    const drawn = userScore === oppScore2;
                    return (
                      <div key={r.id} className="bg-[#0c1219] border border-[#131c27] rounded-xl p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                          won ? 'bg-green-500/20 text-green-400' : drawn ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {won ? <Check size={18}/> : drawn ? <span>D</span> : <X size={18}/>}
                        </div>
                        <div>
                          <p className="text-white font-heading text-lg">
                            {r.homeAbbr} {r.homeScore} – {r.awayScore} {r.awayAbbr}
                          </p>
                          <p className="text-[#5d738c] text-sm">{r.date}</p>
                        </div>
                        <div className="mr-auto">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            won ? 'bg-green-500/20 text-green-400' : drawn ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {won ? 'ניצחון' : drawn ? 'תיקו' : 'הפסד'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────
// PlayerCard component
// ────────────────────────────────────────────────
function PlayerCard({
  player, action, canAfford = true, onAction, onChangePosition, onUpgrade,
}: {
  player: OwnedPlayer;
  action: 'buy' | 'sell';
  canAfford?: boolean;
  onAction: () => void;
  onChangePosition?: (playerId: string, nextPosition: OwnedPlayer['position']) => void;
  onUpgrade?: (playerId: string) => void;
}) {
  const stats = [
    { label: 'PAC', value: player.pac },
    { label: 'SHO', value: player.sho },
    { label: 'PAS', value: player.pas },
    { label: 'DRI', value: player.dri },
    { label: 'DEF', value: player.def },
    { label: 'PHY', value: player.phy },
  ];
  const playerTeam = TEAMS.find(team => team.abbr === player.teamAbbr);

  return (
    <div className="overflow-hidden bg-[#0c1219] border border-[#26384b] rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.22)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#c6ff2e]/60">
      <div className="relative h-56 bg-[radial-gradient(circle_at_50%_20%,#29435c,#0b121b_72%)]">
        <PlayerPhoto player={player} showSearch />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c1219] to-transparent" />
        <span className="absolute top-3 right-3 font-display text-4xl font-bold drop-shadow-lg" style={{ color: ovrColor(player.ovr) }}>
          {player.ovr}
        </span>
        <span className="absolute top-3 right-16 rounded px-2 py-1 text-xs font-bold" style={{ background: positionColor(player.position) + 'dd', color: '#070b10' }}>
          {player.position}
        </span>
        <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white font-heading text-xl leading-tight truncate">{player.nameHe}</p>
            <p className="text-[#a6b6c8] text-xs truncate">{player.name}</p>
          </div>
          {playerTeam && <TeamBadge team={playerTeam} size={42} />}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">

      {action === 'sell' && onChangePosition && onUpgrade && (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <select
            value={player.position}
            onChange={(event) => onChangePosition(player.id, event.target.value as OwnedPlayer['position'])}
            className="rounded-lg border border-[#1d2f44] bg-[#070b10] px-2 py-1.5 text-sm text-white outline-none"
          >
            <option value="GK">GK</option>
            <option value="DEF">DEF</option>
            <option value="MID">MID</option>
            <option value="FWD">FWD</option>
          </select>

          <button
            type="button"
            onClick={() => onUpgrade(player.id)}
            className="rounded-lg border border-[#c6ff2e]/50 bg-[#0c1219] px-2 py-1.5 text-xs font-bold text-[#c6ff2e]"
          >
            +UP
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {stats.map(s => (
          <div key={s.label} className="bg-[#070b10] rounded-xl p-1.5 text-center border border-[#131c27]">
            <p className="text-white text-sm font-bold">{s.value}</p>
            <p className="text-[#2c3e52] text-[10px] uppercase">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#5d738c]">ערך שוק</span>
        <span className="text-white font-display">₪{player.marketValue.toLocaleString()}</span>
      </div>
      {action === 'sell' && (
        <div className="flex items-center justify-between text-xs text-[#5d738c]">
          <span>שדרוגים</span>
          <span className="text-[#c6ff2e]">{player.upgrades ?? 0}</span>
        </div>
      )}
      <button
        onClick={onAction}
        disabled={action === 'buy' && !canAfford}
        className="w-full py-2.5 rounded-xl font-heading uppercase tracking-wide text-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
        style={
          action === 'sell'
            ? { background: '#ef444422', color: '#f87171', border: '1px solid #ef444433' }
            : canAfford
            ? { background: 'linear-gradient(135deg, #c6ff2e, #d6ff5e)', color: '#070b10' }
            : { background: '#1e2b3a', color: '#5d738c', cursor: 'not-allowed' }
        }
      >
        {action === 'sell' ? '💸 מכור (80%)' : canAfford ? '✅ קנה שחקן' : '❌ אין מספיק כסף'}
      </button>
      </div>
    </div>
  );
}
