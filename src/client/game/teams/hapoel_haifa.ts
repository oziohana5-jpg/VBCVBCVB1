import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// הפועל חיפה — 4-2-3-1
export const hapoelHaifa: TeamData = {
  name: 'Hapoel Haifa',
  abbr: 'HHF',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ytmoe71639433126.png',
  formation: '4-2-3-1',
  color: '#CC0000',
  textColor: '#FFFFFF',
  kit: { shirt: '#CC0000', sleeve: '#AA0000', outline: '#FFFFFF', shorts: '#CC0000' },
  awayKit: { shirt: '#000000', sleeve: '#111111', outline: '#CC0000', shorts: '#000000' },
  gkKit: { shirt: '#FFE500', sleeve: '#DDCC00', outline: '#886600' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'HARUSH',     r: [52, 25, 54, 43, 72, 70] },
    { num: 2,  name: 'MENACHEM',   r: [75, 42, 64, 66, 74, 72] },
    { num: 5,  name: 'ABEID',      r: [65, 39, 63, 59, 77, 79] },
    { num: 4,  name: 'LEVY',       r: [69, 38, 64, 61, 79, 77] },
    { num: 3,  name: 'SOLOMON.A',  r: [74, 44, 66, 68, 72, 70] },
    { num: 6,  name: 'MADAR',      r: [71, 62, 74, 72, 71, 75] },
    { num: 8,  name: 'KINDA',      r: [77, 64, 77, 77, 44, 72] },
    { num: 10, name: 'MORI',       r: [78, 75, 76, 80, 40, 66] },
    { num: 7,  name: 'BROWN',      r: [83, 69, 67, 79, 39, 66] },
    { num: 9,  name: 'GOZLAN',     r: [70, 80, 72, 76, 36, 78] },
    { num: 11, name: 'YADIN.A',    r: [84, 72, 66, 80, 34, 68] },
  ]),
};
