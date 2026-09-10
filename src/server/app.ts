import { startApp } from 'modelence/server';
import exampleModule from '@/server/example';
import managerModule from '@/server/manager';
import { createDemoUser } from '@/server/migrations/createDemoUser';
import { provisionNewsCollection } from '@/server/migrations/provisionNewsCollection';

startApp({
  modules: [exampleModule, managerModule],

  security: {
    frameAncestors: ['https://modelence.com', 'https://*.modelence.com', 'http://localhost:*', 'https://*.exp.direct'],
  },

  migrations: [
    {
      version: 1,
      description: 'Create demo user',
      handler: createDemoUser,
    },
    {
      version: 2,
      description: 'Provision managerNews, managerEvents, managerFriends, managerChallenges collections',
      handler: provisionNewsCollection,
    },
  ],
});
