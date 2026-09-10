import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// הפועל באר שבע — 4-2-3-1
export const hapoelBeersheva: TeamData = {
  name: 'Hapoel Beer Sheva',
  abbr: 'HBS',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/sgetyb1737279847.png',
  formation: '4-2-3-1',
  color: '#CC0000',
  textColor: '#FFFFFF',
  kit: { shirt: '#CC0000', sleeve: '#AA0000', outline: '#FFFFFF', shorts: '#CC0000' },
  awayKit: { shirt: '#FFFFFF', sleeve: '#EEEEEE', outline: '#CC0000', shorts: '#FFFFFF' },
  gkKit: { shirt: '#FF8800', sleeve: '#EE7700', outline: '#994400' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'LEVITA',     r: [52, 26, 56, 45, 74, 72] },
    { num: 2,  name: 'ARAD',       r: [78, 44, 66, 68, 76, 74] },
    { num: 5,  name: 'NACHMIAS',   r: [66, 40, 64, 60, 78, 80] },
    { num: 4,  name: 'TAHA',       r: [70, 38, 66, 63, 80, 78] },
    { num: 3,  name: 'DAVIDZADA',  r: [76, 46, 68, 70, 74, 72] },
    { num: 6,  name: 'OGU',        r: [72, 62, 76, 72, 74, 80] },
    { num: 8,  name: 'NWAKAEME',   r: [80, 70, 72, 80, 42, 72] },
    { num: 10, name: 'SAHAR',      r: [78, 76, 78, 80, 40, 68] },
    { num: 7,  name: 'BAREIRO',    r: [86, 74, 70, 83, 38, 70] },
    { num: 9,  name: 'ABUSE',      r: [70, 80, 72, 76, 36, 78] },
    { num: 11, name: 'SABORIDO',   r: [85, 75, 68, 82, 36, 70] },
  ]),
};
