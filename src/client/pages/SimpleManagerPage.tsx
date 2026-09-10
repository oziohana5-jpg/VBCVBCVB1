import { useState, useEffect } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  ShoppingCart,
  PlayCircle,
  Trophy,
  History,
  ArrowLeft,
  DollarSign,
  Inbox,
  Calendar,
  ChevronRight,
  Star,
  Search,
  Check,
  X,
  Minus,
  Activity,
} from 'lucide-react';
import { ISRAELI_TEAMS } from '@/client/game/teams';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'home' | 'squad' | 'transfer' | 'match' | 'league' | 'results';

interface MatchResult {
  id: number;
  opponent: string;
  opponentColor: string;
  opponentAbbr: string;
  myScore: number;
  oppScore: number;
  date: string;
  events: string[];
}

interface InboxMessage {
  id: number;
  from: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

interface MarketPlayer {
  id: number;
  name: string;
  team: string;
  teamAbbr: string;
  teamColor: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  ovr: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  price: number;
  nationality: string;
}

interface LiveEvent {
  minute: number;
  text: string;
  type: 'goal' | 'card' | 'chance' | 'save' | 'info';
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MARKET_PLAYERS: MarketPlayer[] = [
  { id: 1,  name: 'ארן זהבי',         team: 'מכבי תל אביב',    teamAbbr: 'MTA', teamColor: '#FFE500', position: 'MID', ovr: 89, pac: 76, sho: 82, pas: 90, dri: 88, def: 62, phy: 72, price: 4500000,  nationality: '🇮🇱' },
  { id: 2,  name: 'מוחמד אבו פול',    team: 'הפועל ב"ש',       teamAbbr: 'HBS', teamColor: '#FF0000', position: 'FWD', ovr: 84, pac: 90, sho: 85, pas: 72, dri: 86, def: 38, phy: 80, price: 3200000,  nationality: '🇮🇱' },
  { id: 3,  name: 'ניר ביטון',        team: 'מכבי חיפה',       teamAbbr: 'MHA', teamColor: '#006633', position: 'MID', ovr: 82, pac: 74, sho: 75, pas: 86, dri: 80, def: 78, phy: 76, price: 2800000,  nationality: '🇮🇱' },
  { id: 4,  name: 'תמיר כהן',        team: 'בית"ר ירושלים',   teamAbbr: 'BYJ', teamColor: '#FFCC00', position: 'FWD', ovr: 80, pac: 85, sho: 82, pas: 70, dri: 82, def: 35, phy: 78, price: 2200000,  nationality: '🇮🇱' },
  { id: 5,  name: 'עמרי אמסלם',       team: 'הפועל ת"א',       teamAbbr: 'HTA', teamColor: '#CC0000', position: 'DEF', ovr: 78, pac: 72, sho: 42, pas: 68, dri: 65, def: 84, phy: 82, price: 1800000,  nationality: '🇮🇱' },
  { id: 6,  name: 'גל אלבז',         team: 'מכבי פ"ת',        teamAbbr: 'MPT', teamColor: '#0066CC', position: 'GK',  ovr: 77, pac: 58, sho: 30, pas: 62, dri: 55, def: 76, phy: 74, price: 1500000,  nationality: '🇮🇱' },
  { id: 7,  name: 'מוסה דמבלה',      team: 'בני סח\'נין',     teamAbbr: 'BSK', teamColor: '#009900', position: 'FWD', ovr: 82, pac: 92, sho: 80, pas: 70, dri: 88, def: 30, phy: 74, price: 2600000,  nationality: '🇨🇮' },
  { id: 8,  name: 'שחר ניסני',       team: 'הפועל חיפה',      teamAbbr: 'HHA', teamColor: '#CC0000', position: 'MID', ovr: 76, pac: 78, sho: 72, pas: 80, dri: 76, def: 68, phy: 70, price: 1400000,  nationality: '🇮🇱' },
  { id: 9,  name: 'ניקולה מאקסימוביץ\'', team: 'חופשי',       teamAbbr: 'FA',  teamColor: '#555555', position: 'DEF', ovr: 83, pac: 74, sho: 45, pas: 72, dri: 68, def: 88, phy: 86, price: 3000000,  nationality: '🇷🇸' },
  { id: 10, name: 'דמיטרי פולוז',    team: 'חופשי',           teamAbbr: 'FA',  teamColor: '#555555', position: 'FWD', ovr: 85, pac: 88, sho: 87, pas: 76, dri: 84, def: 28, phy: 76, price: 3500000,  nationality: '🇷🇺' },
  { id: 11, name: 'לוקס הינטר',      team: 'חופשי',           teamAbbr: 'FA',  teamColor: '#555555', position: 'GK',  ovr: 81, pac: 55, sho: 28, pas: 65, dri: 52, def: 82, phy: 78, price: 2000000,  nationality: '🇩🇪' },
  { id: 12, name: 'קארלוס ג\'ונסון',  team: 'חופשי',           teamAbbr: 'FA',  teamColor: '#555555', position: 'MID', ovr: 80, pac: 80, sho: 74, pas: 84, dri: 82, def: 65, phy: 74, price: 2100000,  nationality: '🇧🇷' },
];

const MATCH_EVENTS_POOL = [
  { type: 'chance' as const, texts: ["ניסיון שוט מרחוק!", "מהלך מסוכן בקצה העונשין!", "קרנר ל{TEAM}...", "הגנה מתוחה מנקה!"] },
  { type: 'goal' as const,   texts: ["{SCORER} בוקע! {SCORE}!", "GOOOOOL! {SCORER} עם שוט מהאלכסון! {SCORE}", "{SCORER} מקבל מסירה וסוגר! {SCORE}"] },
  { type: 'save' as const,   texts: ["הקופר מציל ברגע האחרון!", "עמוד השער עוצר את הכדור!", "שמירה נהדרת!"] },
  { type: 'card' as const,   texts: ["כרטיס צהוב לשחקן היריב", "כרטיס צהוב לשחקן שלנו", "מריבה בשטח המגרש!"] },
  { type: 'info' as const,   texts: ["החלפה: שחקן חדש נכנס", "לחץ גדול מצד {TEAM}", "המשחק מתחמם!"] },
];

const INITIAL_INBOX: InboxMessage[] = [
  { id: 1, from: 'ועד הקבוצה', subject: 'ברוכים הבאים לתפקיד!', body: 'שלום מאמן, אנחנו שמחים לברך אותך על קבלת התפקיד. המועצה מצפה לתוצאות טובות העונה.', time: 'עכשיו', read: false, type: 'info' },
  { id: 2, from: 'סוכן שחקנים', subject: 'ארן זהבי - הצעת חוזה', body: 'שלום, הלקוח שלי מעוניין להצטרף לקבוצה. מחיר ההעברה הוא 4.5 מיליון ש"ח.', time: 'לפני שעה', read: false, type: 'success' },
  { id: 3, from: 'מנהל ליגה', subject: 'לוח המשחקים - עונה 2025/26', body: 'לוח המשחקים לעונה הקרובה הועלה. ראשון המשחקים יתקיים בשבוע הבא.', time: 'אתמול', read: true, type: 'info' },
  { id: 4, from: 'מנהל ספורטיבי', subject: '⚠️ פציעת שחקן', body: 'אחד מהשחקנים נפצע באימון ויהיה בצל ל-2 שבועות.', time: 'לפני 2 ימים', read: true, type: 'warning' },
];

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `₪${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₪${(n / 1_000).toFixed(0)}K`;
  return `₪${n}`;
}

function getPositionColor(pos: string) {
  switch (pos) {
    case 'GK':  return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'DEF': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'MID': return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'FWD': return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:    return 'bg-night-700 text-night-300';
  }
}

function getOvrColor(ovr: number) {
  if (ovr >= 85) return 'text-yellow-400';
  if (ovr >= 80) return 'text-green-400';
  if (ovr >= 75) return 'text-blue-400';
  return 'text-night-300';
}

// ─── Team Logo SVG Component ──────────────────────────────────────────────────

function TeamLogo({ team, size = 40 }: { team: typeof ISRAELI_TEAMS[0], size?: number }) {
  const logos: Record<string, React.ReactElement> = {
    MTA: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#FFE500" stroke="#003399" strokeWidth="1.5"/>
        <polygon points="20,6 23.5,15 33,15 25.5,20.5 28,30 20,24.5 12,30 14.5,20.5 7,15 16.5,15" fill="#003399"/>
        <text x="20" y="37" textAnchor="middle" fontSize="5" fill="#003399" fontWeight="bold" fontFamily="Arial">מכבי ת"א</text>
      </svg>
    ),
    HBS: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#CC0000" stroke="#CC0000" strokeWidth="1.5"/>
        <text x="20" y="16" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" fontFamily="Arial">הפועל</text>
        <text x="20" y="26" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="Arial">ב"ש</text>
        <circle cx="20" cy="32" r="2.5" fill="white"/>
      </svg>
    ),
    MHA: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2L33 6V17C33 26 28 32 20 37C12 32 7 26 7 17V6L20 2Z" fill="#0F5F33" stroke="#F4D13B" strokeWidth="1.4"/>
        <path d="M20 8L25 16L33 17L27 22L28 30L20 26L12 30L13 22L7 17L15 16L20 8Z" fill="#F4D13B"/>
        <text x="20" y="35" textAnchor="middle" fontSize="4.2" fill="#F4D13B" fontWeight="700" fontFamily="Arial">MHA</text>
      </svg>
    ),
    HTA: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#CC0000" stroke="#CC0000" strokeWidth="1.5"/>
        <text x="20" y="14" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="Arial">הפועל</text>
        <text x="20" y="24" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="Arial">ת"א</text>
        <rect x="8" y="28" width="24" height="3" fill="white" rx="1"/>
      </svg>
    ),
    BYJ: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#1a1a1a" stroke="#FFCC00" strokeWidth="1.5"/>
        <polygon points="20,5 24,14 34,14 26,20 29,30 20,24 11,30 14,20 6,14 16,14" fill="#FFCC00"/>
        <text x="20" y="37" textAnchor="middle" fontSize="4.5" fill="#FFCC00" fontWeight="bold" fontFamily="Arial">בית"ר י-ם</text>
      </svg>
    ),
    MPT: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#0066CC" stroke="#0066CC" strokeWidth="1.5"/>
        <polygon points="20,5 23.5,14 33,14 25.5,19.5 28,29 20,23.5 12,29 14.5,19.5 7,14 16.5,14" fill="#FFE500"/>
        <text x="20" y="37" textAnchor="middle" fontSize="4.5" fill="#FFE500" fontWeight="bold" fontFamily="Arial">מכבי פ"ת</text>
      </svg>
    ),
    BSK: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#006600" stroke="#006600" strokeWidth="1.5"/>
        <text x="20" y="13" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="Arial">בני</text>
        <text x="20" y="22" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="Arial">סח'נין</text>
        <path d="M10 27 Q20 32 30 27" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    ),
    HHA: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2L33 6V17C33 26 28 32 20 37C12 32 7 26 7 17V6L20 2Z" fill="#C60B17" stroke="#F4F1EB" strokeWidth="1.5"/>
        <path d="M10 15H30V27H10Z" fill="#1E3A5F" opacity="0.35"/>
        <text x="20" y="18" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontWeight="800" fontFamily="Arial">H</text>
        <text x="20" y="27" textAnchor="middle" fontSize="6" fill="#FFFFFF" fontWeight="800" fontFamily="Arial">HAIFA</text>
      </svg>
    ),
  };

  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      {logos[team.abbr] ?? (
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-bold"
          style={{ backgroundColor: team.color, color: team.textColor, fontSize: size * 0.3 }}
        >
          {team.abbr}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SimpleManagerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState<Tab>('home');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [myTeam, setMyTeam]             = useState<typeof ISRAELI_TEAMS[0] | null>(null);
  const [budget, setBudget]             = useState(10_000_000);
  const [wins, setWins]                 = useState(0);
  const [draws, setDraws]               = useState(0);
  const [losses, setLosses]             = useState(0);
  const [_goalsFor, setGoalsFor]         = useState(0);
  const [_goalsAgainst, setGoalsAgainst] = useState(0);
  const [results, setResults]           = useState<MatchResult[]>([]);
  const [inbox, setInbox]               = useState<InboxMessage[]>(INITIAL_INBOX);
  const [myPlayers, setMyPlayers]       = useState<MarketPlayer[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [posFilter, setPosFilter]       = useState<'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD'>('ALL');
  const [selectedMsg, setSelectedMsg]   = useState<InboxMessage | null>(null);

  // Live match state
  const [matchPhase, setMatchPhase]     = useState<'idle' | 'live' | 'done'>('idle');
  const [liveMinute, setLiveMinute]     = useState(0);
  const [liveEvents, setLiveEvents]     = useState<LiveEvent[]>([]);
  const [liveMyScore, setLiveMyScore]   = useState(0);
  const [liveOppScore, setLiveOppScore] = useState(0);
  const [liveOpponent, setLiveOpponent] = useState<typeof ISRAELI_TEAMS[0] | null>(null);

  // League table state
  const [leagueTable, setLeagueTable] = useState(() =>
    ISRAELI_TEAMS.map(t => ({ abbr: t.abbr, name: t.name, color: t.color, textColor: t.textColor,
      p: Math.floor(Math.random() * 10), w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 })).map(t => ({
      ...t,
      w: Math.floor(t.p * 0.5), d: Math.floor(t.p * 0.2), l: Math.floor(t.p * 0.3),
      gf: Math.floor(t.p * 1.5), ga: Math.floor(t.p * 1.2),
      pts: Math.floor(t.p * 0.5) * 3 + Math.floor(t.p * 0.2),
    }))
  );

  const unreadCount = inbox.filter(m => !m.read).length;
  const played = wins + draws + losses;
  const points = wins * 3 + draws;

  // ── Team selection ──────────────────────────────────────────────────────────

  const handleSelectTeam = () => {
    if (!selectedTeam) return;
    const team = ISRAELI_TEAMS.find(t => t.abbr === selectedTeam)!;
    setMyTeam(team);
    // Update league table to put our team at position with 0 played
    setLeagueTable(prev =>
      prev.map(t => t.abbr === team.abbr ? { ...t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 } : t)
    );
  };

  // ── Sell player ─────────────────────────────────────────────────────────────

  const handleSellPlayer = (player: MarketPlayer) => {
    const salePrice = Math.floor(player.price * 0.85);
    setMyPlayers(prev => prev.filter(p => p.id !== player.id));
    setBudget(prev => prev + salePrice);
    setInbox(prev => [{
      id: Date.now(), from: 'מנהל ספורטיבי',
      subject: `✅ מכירת ${player.name} הושלמה`,
      body: `${player.name} נמכר תמורת ${formatMoney(salePrice)}. התקציב עודכן.`,
      time: 'עכשיו', read: false, type: 'success',
    }, ...prev]);
  };

  // ── Buy player ──────────────────────────────────────────────────────────────

  const handleBuyPlayer = (player: MarketPlayer) => {
    if (budget < player.price) {
      alert('אין מספיק כסף לרכישת השחקן הזה!');
      return;
    }
    if (myPlayers.find(p => p.id === player.id)) {
      alert('השחקן כבר ברשימתך!');
      return;
    }
    setBudget(prev => prev - player.price);
    setMyPlayers(prev => [...prev, player]);
    setInbox(prev => [{
      id: Date.now(), from: 'סוכן שחקנים',
      subject: `🏅 ${player.name} הצטרף לקבוצה!`,
      body: `${player.name} (${player.position}, ${player.ovr} OVR) הצטרף לסגל תמורת ${formatMoney(player.price)}.`,
      time: 'עכשיו', read: false, type: 'success',
    }, ...prev]);
  };

  // ── Live match simulation ───────────────────────────────────────────────────

  const startMatch = () => {
    if (!myTeam) return;
    const opponents = ISRAELI_TEAMS.filter(t => t.abbr !== myTeam.abbr);
    const opp = opponents[Math.floor(Math.random() * opponents.length)];
    setLiveOpponent(opp);
    setLiveMyScore(0);
    setLiveOppScore(0);
    setLiveEvents([]);
    setLiveMinute(0);
    setMatchPhase('live');
    setActiveTab('match');
  };

  useEffect(() => {
    if (matchPhase !== 'live') return;
    if (liveMinute >= 90) {
      setMatchPhase('done');
      finishMatch();
      return;
    }
    const timer = setTimeout(() => {
      setLiveMinute(m => m + 1);
      // Chance of an event every minute (~25%)
      if (Math.random() < 0.25) {
        generateEvent();
      }
    }, 120); // 120ms per minute = ~11 seconds for full match
    return () => clearTimeout(timer);
  }, [matchPhase, liveMinute]);

  const generateEvent = () => {
    if (!myTeam || !liveOpponent) return;
    const roll = Math.random();
    let pool: typeof MATCH_EVENTS_POOL[0];
    if (roll < 0.12) pool = MATCH_EVENTS_POOL[1]; // goal
    else if (roll < 0.25) pool = MATCH_EVENTS_POOL[2]; // save
    else if (roll < 0.4) pool = MATCH_EVENTS_POOL[3]; // card
    else pool = MATCH_EVENTS_POOL[0]; // chance

    const isMyGoal = pool.type === 'goal' && Math.random() < 0.5;
    const myPlayerNames = ['כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'דוד', 'יוסף'];
    const scorer = myPlayerNames[Math.floor(Math.random() * myPlayerNames.length)];

    let text = pool.texts[Math.floor(Math.random() * pool.texts.length)];

    if (pool.type === 'goal') {
      if (isMyGoal) {
        setLiveMyScore(s => {
          const next = s + 1;
          text = text.replace('{SCORER}', scorer).replace('{SCORE}', `${next}-${liveOppScore}`);
          return next;
        });
      } else {
        setLiveOppScore(s => {
          const next = s + 1;
          text = text.replace('{SCORER}', liveOpponent.name).replace('{SCORE}', `${liveMyScore}-${next}`);
          return next;
        });
      }
    }

    text = text.replace('{TEAM}', Math.random() < 0.5 ? myTeam.name : liveOpponent.name);

    setLiveEvents(prev => [{
      minute: liveMinute,
      text,
      type: pool.type,
    }, ...prev.slice(0, 14)]);
  };

  const finishMatch = () => {
    if (!myTeam || !liveOpponent) return;
    const ms = liveMyScore;
    const os = liveOppScore;
    if (ms > os) {
      setWins(w => w + 1);
      setBudget(b => b + 200_000);
    } else if (ms === os) setDraws(d => d + 1);
    else setLosses(l => l + 1);

    setGoalsFor(g => g + ms);
    setGoalsAgainst(g => g + os);

    const newResult: MatchResult = {
      id: Date.now(),
      opponent: liveOpponent.name, opponentAbbr: liveOpponent.abbr,
      opponentColor: liveOpponent.color,
      myScore: ms, oppScore: os,
      date: new Date().toLocaleDateString('he-IL'),
      events: liveEvents.map(e => e.text),
    };
    setResults(prev => [newResult, ...prev]);

    // Update league table
    setLeagueTable(prev => prev.map(t => {
      if (t.abbr === myTeam.abbr) {
        const w = t.w + (ms > os ? 1 : 0);
        const d = t.d + (ms === os ? 1 : 0);
        const l = t.l + (ms < os ? 1 : 0);
        return { ...t, p: t.p + 1, w, d, l, gf: t.gf + ms, ga: t.ga + os, pts: w * 3 + d };
      }
      return t;
    }));

    const resultText = ms > os ? '🏆 ניצחון!' : ms < os ? '❌ הפסד' : '🤝 תיקו';
    setInbox(prev => [{
      id: Date.now(), from: 'עורך דין קבוצה',
      subject: `${resultText} ${myTeam.name} ${ms}-${os} ${liveOpponent.name}`,
      body: `המשחק הסתיים עם תוצאה של ${ms}-${os}. ${ms > os ? 'כל הכבוד! +₪200,000 בונוס!' : 'נמשיך להתאמן.'}`,
      time: 'עכשיו', read: false, type: ms > os ? 'success' : ms < os ? 'warning' : 'info',
    }, ...prev]);
  };

  const sortedTable = [...leagueTable].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    return (b.gf - b.ga) - (a.gf - a.ga);
  });

  // ─── Team Selection Screen ─────────────────────────────────────────────────

  if (!myTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-950 p-4">
        <div className="max-w-5xl w-full">
          <button onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-night-300 hover:text-volt-400 transition-colors">
            <ArrowLeft size={20} /><span>חזרה</span>
          </button>
          <div className="bg-night-900 border border-night-800 rounded-2xl p-8">
            <h2 className="font-display text-5xl text-white mb-2 text-center">
              בחר את <span className="text-volt-500">הקבוצה שלך</span>
            </h2>
            <p className="text-night-400 text-center mb-8">ליגת העל הישראלית · עונה 2025/26</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ISRAELI_TEAMS.map((team) => (
                <button key={team.abbr} onClick={() => setSelectedTeam(team.abbr)}
                  className={`p-6 rounded-xl border-2 transition-all text-right ${
                    selectedTeam === team.abbr
                      ? 'border-volt-500 bg-volt-500/10 scale-105'
                      : 'border-night-700 bg-night-950/50 hover:border-night-600 hover:scale-102'
                  }`}>
                  <div className="flex justify-center mb-3">
                    <TeamLogo team={team} size={56} />
                  </div>
                  <h3 className="font-heading text-white text-sm text-center">{team.name}</h3>
                  <p className="text-night-500 text-xs text-center mt-1">{team.abbr}</p>
                </button>
              ))}
            </div>
            {selectedTeam && (
              <button onClick={handleSelectTeam}
                className="mt-8 w-full py-4 bg-volt-500 text-night-950 font-heading uppercase tracking-wider text-lg rounded-lg hover:bg-volt-400 transition-colors">
                התחל קריירה →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Manager Layout ──────────────────────────────────────────────────

  const filteredMarket = MARKET_PLAYERS.filter(p => {
    const inSquad = myPlayers.find(mp => mp.id === p.id);
    if (inSquad) return false;
    const matchesSearch = p.name.includes(searchQuery) || p.team.includes(searchQuery);
    const matchesPos = posFilter === 'ALL' || p.position === posFilter;
    return matchesSearch && matchesPos;
  });

  return (
    <div className="min-h-screen bg-night-950 flex" dir="rtl">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-night-900 border-l border-night-800 flex flex-col fixed top-0 right-0 h-full z-10">
        {/* Logo & team */}
        <div className="p-5 border-b border-night-800">
          <button onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 text-night-400 hover:text-volt-400 transition-colors text-sm">
            <ArrowLeft size={14} /><span>FIFA IL</span>
          </button>
          <div className="flex items-center gap-3">
            <TeamLogo team={myTeam} size={44} />
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-white text-base truncate">{myTeam.name}</h3>
              <p className="text-night-400 text-xs">מנהל · 2025/26</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {([
            { id: 'home',     icon: Home,        label: 'בית',          badge: unreadCount, pulse: false },
            { id: 'squad',    icon: Users,        label: `הסגל (${myPlayers.length})`, badge: 0, pulse: false },
            { id: 'transfer', icon: ShoppingCart, label: 'שוק העברות', badge: 0, pulse: false },
            { id: 'match',    icon: PlayCircle,   label: 'יום משחק',   badge: 0, pulse: matchPhase === 'live' },
            { id: 'league',   icon: Trophy,       label: 'טבלה',         badge: 0, pulse: false },
            { id: 'results',  icon: History,      label: `תוצאות (${results.length})`, badge: 0, pulse: false },
          ] as const).map(({ id, icon: Icon, label, badge, pulse }) => (
            <button key={id} onClick={() => setActiveTab(id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all relative ${
                activeTab === id
                  ? 'bg-volt-500 text-night-950 font-semibold'
                  : 'text-night-300 hover:bg-night-800 hover:text-white'
              }`}>
              {pulse && (
                <span className="absolute left-2 top-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
              <Icon size={18} />
              <span className="font-heading text-sm flex-1 text-right">{label}</span>
              {badge != null && badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Budget + play button */}
        <div className="p-4 border-t border-night-800">
          <button onClick={startMatch}
            className="w-full mb-3 py-3 bg-gradient-to-r from-volt-500 to-volt-400 text-night-950 font-heading uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 text-sm">
            <PlayCircle size={18} />
            {matchPhase === 'live' ? 'משחק חי! ←' : 'שחק משחק'}
          </button>
          <div className="bg-night-950 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-volt-400" />
              <span className="text-night-400 text-xs">תקציב</span>
            </div>
            <p className="font-display text-xl text-white">{formatMoney(budget)}</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content (offset for sidebar) ─────────────────────────────── */}
      <main className="flex-1 mr-64 overflow-y-auto p-8 min-h-screen">

        {/* ── HOME TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <div className="max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
              <TeamLogo team={myTeam} size={60} />
              <div>
                <h1 className="font-display text-4xl text-white">{myTeam.name}</h1>
                <p className="text-night-400">עונה 2025/26 · ליגת העל</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'משחקים', value: played, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'נקודות', value: points, icon: Star, color: 'text-volt-400', bg: 'bg-volt-500/10' },
                { label: 'תקציב', value: formatMoney(budget), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'שחקנים', value: myPlayers.length, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-night-900 border border-night-800 rounded-xl p-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-night-400 text-xs mb-1">{label}</p>
                  <p className="font-display text-3xl text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Win/Draw/Loss bar */}
            {played > 0 && (
              <div className="bg-night-900 border border-night-800 rounded-xl p-5 mb-6">
                <p className="text-night-400 text-sm mb-3">יחס משחקים</p>
                <div className="flex rounded-full overflow-hidden h-4 mb-2">
                  {wins > 0 && <div className="bg-green-500 transition-all" style={{ width: `${(wins / played) * 100}%` }} />}
                  {draws > 0 && <div className="bg-yellow-500 transition-all" style={{ width: `${(draws / played) * 100}%` }} />}
                  {losses > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(losses / played) * 100}%` }} />}
                </div>
                <div className="flex gap-4 text-xs text-night-300">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"/> נצ' {wins}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"/> תיקו {draws}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"/> הפסד {losses}</span>
                </div>
              </div>
            )}

            {/* Inbox */}
            <div className="bg-night-900 border border-night-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-night-800">
                <div className="flex items-center gap-2">
                  <Inbox size={18} className="text-volt-400" />
                  <h2 className="font-heading text-white text-lg">תיבת דואר</h2>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount} חדשים</span>
                )}
              </div>
              <div className="divide-y divide-night-800">
                {inbox.slice(0, 5).map(msg => (
                  <button key={msg.id} onClick={() => {
                    setSelectedMsg(msg);
                    setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
                  }}
                    className={`w-full p-4 text-right hover:bg-night-800/50 transition-colors flex items-start gap-3 ${
                      !msg.read ? 'bg-night-800/30' : ''
                    }`}>
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      msg.type === 'success' ? 'bg-green-400' :
                      msg.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    } ${!msg.read ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-heading text-sm truncate ${!msg.read ? 'text-white' : 'text-night-300'}`}>
                          {msg.subject}
                        </p>
                        <span className="text-night-500 text-xs flex-shrink-0 mr-2">{msg.time}</span>
                      </div>
                      <p className="text-night-500 text-xs truncate">{msg.from}</p>
                    </div>
                    <ChevronRight size={14} className="text-night-600 mt-1 flex-shrink-0 rotate-180" />
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming fixtures */}
            <div className="mt-6 bg-night-900 border border-night-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 p-5 border-b border-night-800">
                <Calendar size={18} className="text-volt-400" />
                <h2 className="font-heading text-white text-lg">משחקים קרובים</h2>
              </div>
              <div className="divide-y divide-night-800">
                {ISRAELI_TEAMS.filter(t => t.abbr !== myTeam.abbr).slice(0, 4).map((opp, i) => (
                  <div key={opp.abbr} className="p-4 flex items-center gap-4">
                    <span className="text-night-500 text-xs w-16 text-center">
                      {new Date(Date.now() + (i + 1) * 7 * 86400000).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-heading text-white text-sm">{myTeam.name}</span>
                        <TeamLogo team={myTeam} size={28} />
                      </div>
                      <span className="text-night-500 text-xs px-2">VS</span>
                      <div className="flex items-center gap-2 flex-1 justify-start">
                        <TeamLogo team={opp} size={28} />
                        <span className="font-heading text-night-300 text-sm">{opp.name}</span>
                      </div>
                    </div>
                    <button onClick={startMatch}
                      className="text-xs text-volt-400 hover:text-volt-300 border border-volt-500/30 hover:border-volt-400 px-3 py-1 rounded-full transition-colors">
                      שחק
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Message modal */}
            {selectedMsg && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMsg(null)}>
                <div className="bg-night-900 border border-night-700 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-heading text-white text-lg">{selectedMsg.subject}</h3>
                    <button onClick={() => setSelectedMsg(null)} className="text-night-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-night-400 text-sm mb-3">מ: {selectedMsg.from} · {selectedMsg.time}</p>
                  <p className="text-night-200 leading-relaxed">{selectedMsg.body}</p>
                  <button onClick={() => setSelectedMsg(null)}
                    className="mt-6 w-full py-2 bg-volt-500 text-night-950 font-heading rounded-lg hover:bg-volt-400 transition-colors">
                    סגור
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SQUAD TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'squad' && (
          <div className="max-w-5xl">
            <h1 className="font-display text-4xl text-white mb-6">הסגל שלי</h1>
            {myPlayers.length === 0 ? (
              <div className="bg-night-900 border border-night-800 rounded-xl p-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-night-600" />
                <p className="text-night-300 text-lg mb-2">הסגל ריק</p>
                <p className="text-night-500 mb-6">לך לשוק העברות וקנה שחקנים</p>
                <button onClick={() => setActiveTab('transfer')}
                  className="px-6 py-3 bg-volt-500 text-night-950 font-heading rounded-lg hover:bg-volt-400 transition-colors">
                  לשוק העברות
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPlayers.map(player => (
                  <div key={player.id} className="bg-night-900 border border-night-800 rounded-xl p-5 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center ${getPositionColor(player.position)}`}>
                        <span className={`font-display text-2xl font-bold ${getOvrColor(player.ovr)}`}>{player.ovr}</span>
                        <span className="text-xs font-heading">{player.position}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading text-white text-base">{player.nationality} {player.name}</h3>
                          <p className="text-night-500 text-xs">{player.team}</p>
                        </div>
                        <button onClick={() => handleSellPlayer(player)}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-2 py-1 rounded transition-colors">
                          מכור
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {[['PAC', player.pac], ['SHO', player.sho], ['PAS', player.pas], ['DRI', player.dri], ['DEF', player.def], ['PHY', player.phy]].map(([k, v]) => (
                          <div key={k} className="text-center">
                            <div className={`text-sm font-bold ${getOvrColor(Number(v))}`}>{v}</div>
                            <div className="text-night-600 text-xs">{k}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TRANSFER TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'transfer' && (
          <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-4xl text-white">שוק העברות</h1>
              <div className="flex items-center gap-2 bg-night-900 border border-night-800 rounded-lg px-3 py-2">
                <DollarSign size={16} className="text-volt-400" />
                <span className="text-white font-heading">{formatMoney(budget)}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex-1 min-w-48 relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-night-500" />
                <input type="text" placeholder="חפש שחקן..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-night-900 border border-night-700 rounded-lg pr-9 pl-4 py-2 text-white placeholder-night-500 focus:border-volt-500 focus:outline-none text-sm" />
              </div>
              <div className="flex gap-2">
                {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map(pos => (
                  <button key={pos} onClick={() => setPosFilter(pos)}
                    className={`px-3 py-2 rounded-lg text-xs font-heading border transition-colors ${
                      posFilter === pos
                        ? 'bg-volt-500 text-night-950 border-volt-500'
                        : 'text-night-300 border-night-700 hover:border-night-500'
                    }`}>
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Players grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMarket.map(player => {
                const canAfford = budget >= player.price;
                return (
                  <div key={player.id}
                    className={`bg-night-900 border rounded-xl p-5 flex gap-4 transition-all hover:border-night-600 ${
                      !canAfford ? 'opacity-60 border-night-800' : 'border-night-800'
                    }`}>
                    <div className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${getPositionColor(player.position)}`}>
                      <span className={`font-display text-2xl font-bold ${getOvrColor(player.ovr)}`}>{player.ovr}</span>
                      <span className="text-xs font-heading">{player.position}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-heading text-white">{player.nationality} {player.name}</h3>
                          <p className="text-night-500 text-xs">{player.team}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-display text-lg font-bold ${canAfford ? 'text-volt-400' : 'text-red-400'}`}>
                            {formatMoney(player.price)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-1 mb-3">
                        {[['PAC', player.pac], ['SHO', player.sho], ['PAS', player.pas], ['DRI', player.dri], ['DEF', player.def], ['PHY', player.phy]].map(([k, v]) => (
                          <div key={k} className="text-center">
                            <div className={`text-sm font-bold ${getOvrColor(Number(v))}`}>{v}</div>
                            <div className="text-night-600 text-xs">{k}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleBuyPlayer(player)} disabled={!canAfford}
                        className={`w-full py-2 rounded-lg font-heading text-sm transition-colors ${
                          canAfford
                            ? 'bg-volt-500 text-night-950 hover:bg-volt-400'
                            : 'bg-night-800 text-night-500 cursor-not-allowed'
                        }`}>
                        {canAfford ? `קנה · ${formatMoney(player.price)}` : 'אין מספיק כסף'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredMarket.length === 0 && (
                <div className="col-span-2 bg-night-900 border border-night-800 rounded-xl p-12 text-center">
                  <p className="text-night-400">לא נמצאו שחקנים</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MATCH TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'match' && (
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl text-white mb-6 text-center">יום משחק</h1>

            {matchPhase === 'idle' && (
              <div className="bg-night-900 border border-night-800 rounded-xl p-12 text-center">
                <PlayCircle size={64} className="mx-auto mb-6 text-volt-500" />
                <p className="text-night-300 text-lg mb-8">בחר יריבה ושחק משחק ליגה</p>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8">
                  {ISRAELI_TEAMS.filter(t => t.abbr !== myTeam.abbr).map(opp => (
                    <button key={opp.abbr} onClick={() => { setLiveOpponent(opp); }}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        liveOpponent?.abbr === opp.abbr
                          ? 'border-volt-500 bg-volt-500/10'
                          : 'border-night-700 hover:border-night-600'
                      }`}>
                      <TeamLogo team={opp} size={28} />
                      <span className="font-heading text-white text-xs text-right">{opp.name}</span>
                    </button>
                  ))}
                </div>
                <button onClick={startMatch}
                  className="px-8 py-4 bg-volt-500 text-night-950 font-heading uppercase tracking-wider text-lg rounded-lg hover:bg-volt-400 transition-colors">
                  שחק!
                </button>
              </div>
            )}

            {(matchPhase === 'live' || matchPhase === 'done') && liveOpponent && (
              <div>
                {/* Scoreboard */}
                <div className="bg-gradient-to-r from-night-900 via-night-800 to-night-900 border border-night-700 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 justify-start">
                      <TeamLogo team={myTeam} size={48} />
                      <span className="font-heading text-white text-lg">{myTeam.name}</span>
                    </div>
                    <div className="text-center px-6">
                      <div className="font-display text-5xl text-white">
                        {liveMyScore} - {liveOppScore}
                      </div>
                      <div className={`mt-2 text-sm font-heading ${matchPhase === 'live' ? 'text-red-400' : 'text-night-400'}`}>
                        {matchPhase === 'live' ? (
                          <span className="flex items-center gap-1 justify-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            {liveMinute}'
                          </span>
                        ) : 'סיום'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-heading text-night-300 text-lg">{liveOpponent.name}</span>
                      <TeamLogo team={liveOpponent} size={48} />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-night-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-volt-500 to-volt-400 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${(liveMinute / 90) * 100}%` }} />
                  </div>
                </div>

                {/* Live events feed */}
                <div className="bg-night-900 border border-night-800 rounded-xl overflow-hidden mb-4">
                  <div className="p-4 border-b border-night-800 flex items-center gap-2">
                    <Activity size={16} className="text-volt-400" />
                    <span className="font-heading text-white text-sm">אירועי המשחק</span>
                  </div>
                  <div className="divide-y divide-night-800 max-h-72 overflow-y-auto">
                    {liveEvents.length === 0 && (
                      <p className="p-6 text-center text-night-500">המשחק מתחיל...</p>
                    )}
                    {liveEvents.map((ev, i) => (
                      <div key={i} className="flex items-start gap-3 p-4">
                        <span className="text-night-400 text-xs w-10 flex-shrink-0 font-heading">{ev.minute}'</span>
                        <span className={`text-lg flex-shrink-0 ${
                          ev.type === 'goal' ? '⚽' :
                          ev.type === 'card' ? '🟨' :
                          ev.type === 'save' ? '🧤' : '💨'
                        }`}>
                          {ev.type === 'goal' ? '⚽' : ev.type === 'card' ? '🟨' : ev.type === 'save' ? '🧤' : '💨'}
                        </span>
                        <p className={`text-sm ${ev.type === 'goal' ? 'text-volt-300 font-semibold' : 'text-night-300'}`}>
                          {ev.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {matchPhase === 'done' && (
                  <div className="flex gap-4">
                    <button onClick={startMatch}
                      className="flex-1 py-3 bg-volt-500 text-night-950 font-heading uppercase tracking-wider rounded-lg hover:bg-volt-400 transition-colors">
                      משחק נוסף
                    </button>
                    <button onClick={() => { setMatchPhase('idle'); setActiveTab('results'); }}
                      className="flex-1 py-3 border border-night-700 text-night-300 font-heading rounded-lg hover:border-night-600 hover:text-white transition-colors">
                      ראה תוצאות
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LEAGUE TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'league' && (
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl text-white mb-6">טבלת הליגה</h1>
            <div className="bg-night-900 border border-night-800 rounded-xl overflow-hidden">
              <div className="bg-night-950 px-4 py-3 grid grid-cols-12 gap-2 text-night-400 text-xs font-heading border-b border-night-800">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">קבוצה</div>
                <div className="col-span-1 text-center">מ'</div>
                <div className="col-span-1 text-center">נ'</div>
                <div className="col-span-1 text-center">ת'</div>
                <div className="col-span-1 text-center">ה'</div>
                <div className="col-span-2 text-center">שערים</div>
                <div className="col-span-1 text-center font-bold text-volt-400">נק'</div>
              </div>
              {sortedTable.map((t, i) => {
                const isMyTeam = myTeam && t.abbr === myTeam.abbr;
                const team = ISRAELI_TEAMS.find(tm => tm.abbr === t.abbr)!;
                return (
                  <div key={t.abbr}
                    className={`px-4 py-3 grid grid-cols-12 gap-2 items-center border-b border-night-800/50 transition-colors ${
                      isMyTeam ? 'bg-volt-500/10 border-l-2 border-l-volt-500' : 'hover:bg-night-800/30'
                    }`}>
                    <div className={`col-span-1 text-center font-bold ${i < 3 ? 'text-volt-400' : 'text-night-400'}`}>{i + 1}</div>
                    <div className="col-span-4 flex items-center gap-2">
                      <TeamLogo team={team} size={28} />
                      <span className={`font-heading text-sm ${isMyTeam ? 'text-white font-semibold' : 'text-night-300'}`}>
                        {t.name}
                      </span>
                    </div>
                    <div className="col-span-1 text-center text-night-300 text-sm">{t.p}</div>
                    <div className="col-span-1 text-center text-green-400 text-sm">{t.w}</div>
                    <div className="col-span-1 text-center text-yellow-400 text-sm">{t.d}</div>
                    <div className="col-span-1 text-center text-red-400 text-sm">{t.l}</div>
                    <div className="col-span-2 text-center text-night-300 text-sm">{t.gf}:{t.ga}</div>
                    <div className={`col-span-1 text-center font-display text-lg font-bold ${isMyTeam ? 'text-volt-400' : 'text-white'}`}>
                      {t.pts}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULTS TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'results' && (
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl text-white mb-6">תוצאות</h1>
            {results.length === 0 ? (
              <div className="bg-night-900 border border-night-800 rounded-xl p-12 text-center">
                <History size={48} className="mx-auto mb-4 text-night-600" />
                <p className="text-night-300 text-lg mb-2">אין תוצאות עדיין</p>
                <button onClick={() => setActiveTab('match')}
                  className="mt-4 px-6 py-3 bg-volt-500 text-night-950 font-heading rounded-lg hover:bg-volt-400 transition-colors">
                  שחק משחק ראשון
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map(r => {
                  const opp = ISRAELI_TEAMS.find(t => t.abbr === r.opponentAbbr) || ISRAELI_TEAMS[0];
                  const isWin = r.myScore > r.oppScore;
                  const isDraw = r.myScore === r.oppScore;
                  return (
                    <div key={r.id}
                      className={`bg-night-900 border rounded-xl p-5 flex items-center gap-4 ${
                        isWin ? 'border-green-500/30' : isDraw ? 'border-yellow-500/30' : 'border-red-500/30'
                      }`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isWin ? 'bg-green-500/20' : isDraw ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        {isWin ? <Check size={24} className="text-green-400" /> :
                         isDraw ? <Minus size={24} className="text-yellow-400" /> :
                         <X size={24} className="text-red-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <TeamLogo team={myTeam} size={24} />
                            <span className="font-heading text-white text-sm">{myTeam.name}</span>
                          </div>
                          <span className={`font-display text-2xl font-bold ${
                            isWin ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {r.myScore} - {r.oppScore}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-night-300 text-sm">{r.opponent}</span>
                            <TeamLogo team={opp} size={24} />
                          </div>
                        </div>
                        <p className="text-night-500 text-xs">{r.date}</p>
                      </div>
                      <span className={`text-sm font-heading font-bold ${
                        isWin ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {isWin ? 'נצחון' : isDraw ? 'תיקו' : 'הפסד'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
