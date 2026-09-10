import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// בית"ר ירושלים — 4-2-3-1
export const beitarJerusalem: TeamData = {
  name: 'Beitar Jerusalem',
  abbr: 'BJM',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/lsg64h1781239463.png',
  formation: '4-2-3-1',
  color: '#FFE500',
  textColor: '#000000',
  kit: { shirt: '#FFE500', sleeve: '#FFE500', outline: '#000000', shorts: '#000000' },
  awayKit: { shirt: '#000000', sleeve: '#111111', outline: '#FFE500', shorts: '#000000' },
  gkKit: { shirt: '#00AAFF', sleeve: '#0088DD', outline: '#004488' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'GANDELMAN',  r: [50, 23, 53, 42, 70, 68] },
    { num: 2,  name: 'פלוני',      r: [75, 42, 64, 66, 74, 72] },
    { num: 5,  name: 'JOSUE',      r: [67, 40, 65, 61, 79, 81] },
    { num: 4,  name: 'VARENNE',    r: [69, 39, 65, 62, 79, 77] },
    { num: 3,  name: 'MELIKSON',   r: [74, 44, 66, 68, 72, 70] },
    { num: 6,  name: 'ISRAELOV',   r: [71, 63, 75, 73, 71, 75] },
    { num: 8,  name: 'KAYAL',      r: [76, 65, 78, 76, 73, 77] },
    { num: 10, name: 'CLAUDEMIR',  r: [77, 75, 75, 79, 39, 65] },
    { num: 7,  name: 'VARENNE.A',  r: [82, 68, 67, 78, 38, 65] },
    { num: 9,  name: 'TCHIBOTA',   r: [69, 79, 71, 75, 35, 77] },
    { num: 11, name: 'OSEDO',      r: [83, 71, 65, 79, 33, 67] },
  ]),
};
