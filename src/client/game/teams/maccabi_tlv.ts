import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// מכבי תל אביב — 4-2-3-1
export const maccabiTlv: TeamData = {
  name: 'Maccabi Tel Aviv',
  abbr: 'MTA',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/oeer261781239315.png',
  formation: '4-2-3-1',
  color: '#FFE500',
  textColor: '#003399',
  kit: { shirt: '#FFE500', sleeve: '#FFE500', outline: '#003399', shorts: '#003399' },
  awayKit: { shirt: '#003399', sleeve: '#003399', outline: '#FFE500', shorts: '#FFE500' },
  gkKit: { shirt: '#00AA44', sleeve: '#008833', outline: '#005522' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'COHEN.D',    r: [50, 25, 55, 44, 72, 70] },
    { num: 2,  name: 'KANDIL',     r: [80, 45, 68, 70, 78, 76] },
    { num: 5,  name: 'SOISALO',    r: [68, 42, 65, 62, 80, 82] },
    { num: 4,  name: 'DGANI',      r: [72, 40, 68, 65, 82, 80] },
    { num: 3,  name: 'BALTAXA',    r: [78, 48, 70, 72, 76, 74] },
    { num: 6,  name: 'PERETZ',     r: [74, 68, 78, 76, 75, 78] },
    { num: 8,  name: 'BITON',      r: [72, 65, 80, 74, 70, 74] },
    { num: 10, name: 'GLAZER',     r: [82, 78, 80, 84, 45, 70] },
    { num: 7,  name: 'IVANIR',     r: [84, 72, 74, 82, 42, 68] },
    { num: 9,  name: 'SABORIT',    r: [72, 82, 74, 78, 38, 80] },
    { num: 11, name: 'MITROVIC',   r: [88, 76, 70, 85, 38, 72] },
  ]),
};
