import { buildSquad, type TeamData } from './types';
import { F_433 } from './formations';

// מכבי פתח תקווה — 4-3-3
export const maccabiPetahTikva: TeamData = {
  name: 'Maccabi Petah Tikva',
  abbr: 'MPT',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/3bvby91720417514.png',
  formation: '4-3-3',
  color: '#FFE500',
  textColor: '#000080',
  kit: { shirt: '#FFE500', sleeve: '#FFE500', outline: '#000080', shorts: '#000080' },
  awayKit: { shirt: '#000080', sleeve: '#000066', outline: '#FFE500', shorts: '#000080' },
  gkKit: { shirt: '#FF6600', sleeve: '#EE5500', outline: '#883300' },
  kickoffFwd: 9,
  players: buildSquad(F_433, [
    { num: 1,  name: 'AMOS',       r: [49, 22, 52, 41, 69, 67] },
    { num: 2,  name: 'ABU FANI',   r: [74, 41, 63, 65, 73, 71] },
    { num: 5,  name: 'TAHA.M',     r: [64, 38, 62, 58, 76, 78] },
    { num: 4,  name: 'EINBINDER.A',r: [68, 37, 63, 60, 78, 76] },
    { num: 3,  name: 'LUGASI',     r: [73, 43, 65, 67, 71, 69] },
    { num: 6,  name: 'GERSHON',    r: [70, 61, 73, 71, 70, 74] },
    { num: 8,  name: 'RIKAN',      r: [75, 63, 76, 74, 68, 72] },
    { num: 10, name: 'SAHAR.M',    r: [76, 74, 74, 78, 38, 64] },
    { num: 7,  name: 'DASA',       r: [81, 67, 66, 77, 37, 64] },
    { num: 9,  name: 'BARUCHYAN',  r: [68, 78, 70, 74, 34, 76] },
    { num: 11, name: 'ELHAMED',    r: [82, 70, 64, 78, 32, 66] },
  ]),
};
