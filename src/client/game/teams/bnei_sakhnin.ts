import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// בני סח'נין — 4-2-3-1
export const bneiSakhnin: TeamData = {
  name: "Bnei Sakhnin",
  abbr: 'BSK',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/u65rj91781805478.png',
  formation: '4-2-3-1',
  color: '#006600',
  textColor: '#FFFFFF',
  kit: { shirt: '#006600', sleeve: '#005500', outline: '#FFFFFF', shorts: '#006600' },
  awayKit: { shirt: '#FFFFFF', sleeve: '#EEEEEE', outline: '#006600', shorts: '#FFFFFF' },
  gkKit: { shirt: '#FF0000', sleeve: '#DD0000', outline: '#880000' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'WAKED',      r: [48, 21, 51, 40, 68, 66] },
    { num: 2,  name: 'KABHA',      r: [73, 40, 62, 64, 72, 70] },
    { num: 5,  name: 'GHADIR',     r: [63, 37, 61, 57, 75, 77] },
    { num: 4,  name: 'SUAN',       r: [67, 36, 62, 59, 77, 75] },
    { num: 3,  name: 'JABAREEN',   r: [72, 42, 64, 66, 70, 68] },
    { num: 6,  name: 'NATCHO',     r: [69, 60, 72, 70, 69, 73] },
    { num: 8,  name: 'TOAMA',      r: [74, 62, 75, 73, 67, 71] },
    { num: 10, name: 'ZUARETZ',    r: [75, 73, 73, 77, 37, 63] },
    { num: 7,  name: 'MANSUR',     r: [80, 66, 65, 76, 36, 63] },
    { num: 9,  name: 'KASEM',      r: [67, 77, 69, 73, 33, 75] },
    { num: 11, name: 'BADIR',      r: [81, 69, 63, 77, 31, 65] },
  ]),
};
