import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// מכבי חיפה — 4-2-3-1
export const maccabiHaifa: TeamData = {
  name: 'Maccabi Haifa',
  abbr: 'MHF',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/kh3psh1781805608.png',
  formation: '4-2-3-1',
  color: '#006633',
  textColor: '#FFFFFF',
  kit: { shirt: '#006633', sleeve: '#005522', outline: '#FFFFFF', shorts: '#006633' },
  awayKit: { shirt: '#FFFFFF', sleeve: '#EEEEEE', outline: '#006633', shorts: '#FFFFFF' },
  gkKit: { shirt: '#FFE500', sleeve: '#DDCC00', outline: '#886600' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'COHEN.O',    r: [54, 28, 57, 46, 75, 73] },
    { num: 2,  name: 'SUNDGREN',   r: [79, 46, 69, 71, 77, 75] },
    { num: 5,  name: 'PLANIC',     r: [70, 42, 66, 64, 81, 83] },
    { num: 4,  name: 'BATUBINSIKA',r: [74, 41, 67, 66, 83, 81] },
    { num: 3,  name: 'CORNUD',     r: [77, 47, 71, 73, 75, 73] },
    { num: 6,  name: 'LAVI',       r: [73, 64, 79, 75, 74, 76] },
    { num: 8,  name: 'CHERY',      r: [81, 72, 76, 82, 44, 71] },
    { num: 10, name: 'PIERROT',    r: [84, 78, 76, 85, 40, 70] },
    { num: 7,  name: 'RUKAVYTSYA', r: [82, 74, 72, 83, 40, 69] },
    { num: 9,  name: 'ATZILI',     r: [88, 80, 75, 86, 36, 68] },
    { num: 11, name: 'HAZIZA',     r: [87, 77, 74, 85, 38, 68] },
  ]),
};
