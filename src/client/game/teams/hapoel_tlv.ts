import { buildSquad, type TeamData } from './types';
import { F_4231 } from './formations';

// הפועל תל אביב — 4-2-3-1
export const hapoelTlv: TeamData = {
  name: 'Hapoel Tel Aviv',
  abbr: 'HTA',
  logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/yrrsml1767366305.png',
  formation: '4-2-3-1',
  color: '#CC0000',
  textColor: '#FFFFFF',
  kit: { shirt: '#CC0000', sleeve: '#AA0000', outline: '#FFFFFF', shorts: '#FFFFFF' },
  awayKit: { shirt: '#FFFFFF', sleeve: '#EEEEEE', outline: '#ce0505', shorts: '#CC0000' },
  gkKit: { shirt: '#0044CC', sleeve: '#0033AA', outline: '#002288' },
  kickoffFwd: 9,
  players: buildSquad(F_4231, [
    { num: 1,  name: 'GORESH',     r: [51, 24, 54, 43, 71, 69] },
    { num: 2,  name: 'EINBINDER',  r: [76, 43, 65, 67, 75, 73] },
    { num: 5,  name: 'VERED',      r: [65, 39, 63, 59, 77, 79] },
    { num: 4,  name: 'TIBI',       r: [71, 41, 67, 64, 81, 79] },
    { num: 3,  name: 'MESHUMAR',   r: [75, 45, 67, 69, 73, 71] },
    { num: 6,  name: 'SOLOMON',    r: [73, 67, 77, 75, 72, 76] },
    { num: 8,  name: 'DGANI.R',    r: [71, 63, 78, 73, 69, 73] },
    { num: 10, name: 'SAHAR.B',    r: [79, 77, 77, 81, 41, 67] },
    { num: 7,  name: 'YADIN',      r: [83, 70, 69, 80, 40, 67] },
    { num: 9,  name: 'OHANA',      r: [71, 81, 73, 77, 37, 79] },
    { num: 11, name: 'STOLE',      r: [84, 73, 67, 81, 35, 69] },
  ]),
};
