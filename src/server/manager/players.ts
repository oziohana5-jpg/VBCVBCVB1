// מאגר שחקנים ישראלים מלא עם ערכי שוק

export interface IsraeliPlayer {
  id: string;
  name: string;
  nameHe: string;
  team: string;
  position: 'GK' | 'DF' | 'MF' | 'ST';
  age: number;
  ovr: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  marketValue: number; // ערך שוק בשקלים
  nationality: string;
}

export const ISRAELI_PLAYERS: IsraeliPlayer[] = [
  // ========== מכבי תל אביב ==========
  { id: 'mta_cohen',    name: 'Daniel Cohen',        nameHe: 'דניאל כהן',     team: 'MTA', nationality: '🇮🇱', position: 'GK', age: 28, ovr: 74, pac: 50, sho: 25, pas: 55, dri: 44, def: 72, phy: 70, marketValue: 2_500_000 },
  { id: 'mta_glazer',   name: 'Dor Glazer',          nameHe: 'דור גלזר',      team: 'MTA', nationality: '🇮🇱', position: 'MF', age: 23, ovr: 79, pac: 82, sho: 78, pas: 80, dri: 84, def: 45, phy: 70, marketValue: 6_000_000 },
  { id: 'mta_biton',    name: 'Idan Biton',          nameHe: 'עידן ביטון',    team: 'MTA', nationality: '🇮🇱', position: 'MF', age: 26, ovr: 75, pac: 72, sho: 65, pas: 80, dri: 74, def: 70, phy: 74, marketValue: 3_500_000 },
  { id: 'mta_peretz',   name: 'Eran Peretz',         nameHe: 'ארן פרץ',       team: 'MTA', nationality: '🇮🇱', position: 'MF', age: 24, ovr: 76, pac: 74, sho: 68, pas: 78, dri: 76, def: 75, phy: 78, marketValue: 4_000_000 },
  { id: 'mta_kandil',   name: 'Shoval Kandil',       nameHe: 'שובל קנדיל',    team: 'MTA', nationality: '🇮🇱', position: 'DF', age: 25, ovr: 75, pac: 80, sho: 45, pas: 68, dri: 70, def: 78, phy: 76, marketValue: 3_000_000 },
  { id: 'mta_mitrovic', name: 'Strahinja Mitrovic',  nameHe: "מיטרוביץ'",     team: 'MTA', nationality: '🇷🇸', position: 'ST', age: 27, ovr: 78, pac: 88, sho: 76, pas: 70, dri: 85, def: 38, phy: 72, marketValue: 5_500_000 },
  { id: 'mta_saborit',  name: 'Jordi Saborit',       nameHe: 'סבוריט',        team: 'MTA', nationality: '🇪🇸', position: 'ST', age: 29, ovr: 76, pac: 72, sho: 82, pas: 74, dri: 78, def: 38, phy: 80, marketValue: 4_500_000 },

  // ========== הפועל באר שבע ==========
  { id: 'hbs_ogu',        name: 'John Ogu',           nameHe: 'אוגו',          team: 'HBS', nationality: '🇳🇬', position: 'MF', age: 34, ovr: 76, pac: 72, sho: 62, pas: 76, dri: 72, def: 74, phy: 80, marketValue: 1_500_000 },
  { id: 'hbs_nwakaeme',   name: 'Anthony Nwakaeme',   nameHe: 'נוואקאמה',      team: 'HBS', nationality: '🇳🇬', position: 'MF', age: 33, ovr: 77, pac: 80, sho: 70, pas: 72, dri: 80, def: 42, phy: 72, marketValue: 2_000_000 },
  { id: 'hbs_sahar',      name: 'Ben Sahar',          nameHe: 'בן סהר',        team: 'HBS', nationality: '🇮🇱', position: 'MF', age: 35, ovr: 74, pac: 78, sho: 76, pas: 78, dri: 80, def: 40, phy: 68, marketValue: 800_000 },
  { id: 'hbs_davidzada',  name: 'Dor Davidzada',      nameHe: 'דור דוידזדה',   team: 'HBS', nationality: '🇮🇱', position: 'DF', age: 30, ovr: 74, pac: 76, sho: 46, pas: 68, dri: 70, def: 74, phy: 72, marketValue: 2_200_000 },
  { id: 'hbs_levita',     name: 'Boris Kleiman',      nameHe: 'לויטא',         team: 'HBS', nationality: '🇮🇱', position: 'GK', age: 27, ovr: 73, pac: 52, sho: 26, pas: 56, dri: 45, def: 74, phy: 72, marketValue: 1_800_000 },

  // ========== מכבי חיפה ==========
  { id: 'mhf_atzili',   name: 'Hatem Abd Elhamed',   nameHe: 'עטזילי',        team: 'MHF', nationality: '🇮🇱', position: 'ST', age: 31, ovr: 80, pac: 88, sho: 80, pas: 75, dri: 86, def: 36, phy: 68, marketValue: 3_000_000 },
  { id: 'mhf_haziza',   name: 'Dolev Haziza',        nameHe: 'דולב חזיזה',    team: 'MHF', nationality: '🇮🇱', position: 'ST', age: 26, ovr: 79, pac: 87, sho: 77, pas: 74, dri: 85, def: 38, phy: 68, marketValue: 5_000_000 },
  { id: 'mhf_chery',    name: 'Tjaronn Chery',       nameHe: "צ'רי",          team: 'MHF', nationality: '🇳🇱', position: 'MF', age: 34, ovr: 76, pac: 81, sho: 72, pas: 76, dri: 82, def: 44, phy: 71, marketValue: 1_200_000 },
  { id: 'mhf_pierrot',  name: 'Frantzdy Pierrot',    nameHe: 'פיירו',         team: 'MHF', nationality: '🇭🇹', position: 'MF', age: 30, ovr: 78, pac: 84, sho: 78, pas: 76, dri: 85, def: 40, phy: 70, marketValue: 3_500_000 },
  { id: 'mhf_lavi',     name: 'Mohammad Lavi',       nameHe: 'מוחמד לווי',    team: 'MHF', nationality: '🇮🇱', position: 'MF', age: 24, ovr: 75, pac: 73, sho: 64, pas: 79, dri: 75, def: 74, phy: 76, marketValue: 4_500_000 },
  { id: 'mhf_sundgren', name: 'Pontus Sundgren',     nameHe: 'סונדגרן',       team: 'MHF', nationality: '🇸🇪', position: 'DF', age: 29, ovr: 75, pac: 79, sho: 46, pas: 69, dri: 71, def: 77, phy: 75, marketValue: 2_500_000 },

  // ========== הפועל תל אביב ==========
  { id: 'hta_tibi',     name: 'Renat Tibi',          nameHe: 'רנת טיבי',      team: 'HTA', nationality: '🇮🇱', position: 'DF', age: 36, ovr: 73, pac: 71, sho: 41, pas: 67, dri: 64, def: 81, phy: 79, marketValue: 500_000 },
  { id: 'hta_solomon',  name: 'Munas Dabbur',        nameHe: 'שלמה',          team: 'HTA', nationality: '🇮🇱', position: 'MF', age: 28, ovr: 74, pac: 73, sho: 67, pas: 77, dri: 75, def: 72, phy: 76, marketValue: 2_000_000 },
  { id: 'hta_ohana',    name: 'Itay Shechter',       nameHe: 'אוהנה',         team: 'HTA', nationality: '🇮🇱', position: 'ST', age: 32, ovr: 74, pac: 71, sho: 81, pas: 73, dri: 77, def: 37, phy: 79, marketValue: 1_000_000 },

  // ========== בית"ר ירושלים ==========
  { id: 'bjm_kayal',     name: 'Beram Kayal',        nameHe: 'ברם קיאל',      team: 'BJM', nationality: '🇮🇱', position: 'MF', age: 35, ovr: 74, pac: 76, sho: 65, pas: 78, dri: 76, def: 73, phy: 77, marketValue: 600_000 },
  { id: 'bjm_claudemir', name: 'Claudemir',          nameHe: 'קלאודמיר',      team: 'BJM', nationality: '🇧🇷', position: 'MF', age: 34, ovr: 74, pac: 77, sho: 75, pas: 75, dri: 79, def: 39, phy: 65, marketValue: 800_000 },
  { id: 'bjm_tchibota',  name: 'Gabriel Tchibota',   nameHe: "צ'יבוטה",       team: 'BJM', nationality: '🇫🇷', position: 'ST', age: 28, ovr: 74, pac: 69, sho: 79, pas: 71, dri: 75, def: 35, phy: 77, marketValue: 3_000_000 },

  // ========== בני סח'נין ==========
  { id: 'bsk_natcho',   name: 'Bibras Natkho',       nameHe: 'ביברס נתכו',    team: 'BSK', nationality: '🇮🇱', position: 'MF', age: 37, ovr: 73, pac: 69, sho: 60, pas: 72, dri: 70, def: 69, phy: 73, marketValue: 400_000 },

  // ========== שחקנים חופשיים / כוכבים ==========
  { id: 'free_zaabi',     name: 'Aran Zaabi',         nameHe: 'ארן זעבי',      team: 'FREE', nationality: '🇮🇱', position: 'ST', age: 24, ovr: 82, pac: 90, sho: 84, pas: 76, dri: 87, def: 35, phy: 75, marketValue: 8_000_000 },
  { id: 'free_dabbur',    name: 'Munas Dabbur',       nameHe: 'מוניס דבור',    team: 'FREE', nationality: '🇮🇱', position: 'ST', age: 32, ovr: 80, pac: 82, sho: 85, pas: 78, dri: 82, def: 35, phy: 76, marketValue: 3_000_000 },
  { id: 'free_einbinder', name: 'Dan Einbinder',      nameHe: 'דן אינבינדר',   team: 'FREE', nationality: '🇮🇱', position: 'DF', age: 26, ovr: 76, pac: 77, sho: 43, pas: 65, dri: 67, def: 76, phy: 74, marketValue: 3_500_000 },
  { id: 'free_dgani',     name: 'Omer Dgani',         nameHe: 'עומר דגני',     team: 'FREE', nationality: '🇮🇱', position: 'MF', age: 27, ovr: 77, pac: 75, sho: 70, pas: 80, dri: 78, def: 72, phy: 76, marketValue: 4_000_000 },
  { id: 'free_abu_fani',  name: 'Oday Abu Fani',      nameHe: 'אודאי אבו פאני',team: 'FREE', nationality: '🇮🇱', position: 'MF', age: 23, ovr: 78, pac: 80, sho: 72, pas: 79, dri: 81, def: 65, phy: 74, marketValue: 6_500_000 },
  { id: 'free_solomon',   name: 'Manor Solomon',      nameHe: 'מנור שלמה',     team: 'FREE', nationality: '🇮🇱', position: 'MF', age: 24, ovr: 81, pac: 87, sho: 76, pas: 78, dri: 85, def: 42, phy: 70, marketValue: 9_000_000 },
  { id: 'free_abada',     name: 'Liel Abada',         nameHe: 'ליאל אבאדה',    team: 'FREE', nationality: '🇮🇱', position: 'ST', age: 23, ovr: 80, pac: 89, sho: 78, pas: 74, dri: 84, def: 38, phy: 68, marketValue: 8_500_000 },
  { id: 'free_jehezkel',  name: 'Sagiv Jehezkel',     nameHe: 'סגיב יחזקאל',   team: 'FREE', nationality: '🇮🇱', position: 'ST', age: 27, ovr: 77, pac: 85, sho: 79, pas: 72, dri: 82, def: 36, phy: 70, marketValue: 5_000_000 },
  { id: 'free_gloukh',    name: 'Oscar Gloukh',       nameHe: 'אוסקר גלוך',    team: 'FREE', nationality: '🇮🇱', position: 'MF', age: 21, ovr: 83, pac: 84, sho: 80, pas: 83, dri: 88, def: 44, phy: 68, marketValue: 15_000_000 },
  { id: 'free_david',     name: 'Lior David',         nameHe: 'ליאור דוד',     team: 'FREE', nationality: '🇮🇱', position: 'GK', age: 29, ovr: 76, pac: 55, sho: 28, pas: 60, dri: 50, def: 78, phy: 76, marketValue: 3_000_000 },
];

export function getPlayersByTeam(teamAbbr: string): IsraeliPlayer[] {
  return ISRAELI_PLAYERS.filter(p => p.team === teamAbbr);
}

export function getFreeAgents(): IsraeliPlayer[] {
  return ISRAELI_PLAYERS.filter(p => p.team === 'FREE');
}

export function getTransferMarket(): IsraeliPlayer[] {
  return ISRAELI_PLAYERS;
}

export function getPlayerById(id: string): IsraeliPlayer | undefined {
  return ISRAELI_PLAYERS.find(p => p.id === id);
}
