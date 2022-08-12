import { defineConfig } from 'cypress';
import * as globby from 'globby';
import 'dotenv/config';

export default defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: true,
  videoUploadOnPasses: false,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost:8000',
  },
  env: process.env,
  setupNodeEvents(on, config) {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on('task', {
      findFile(mask: any) {
        if (!mask) {
          throw new Error('Missing a file mask to search');
        }

        return globby(mask).then((list) => {
          if (!list.length) {
            throw new Error(`Could not find files matching mask "${mask}"`);
          }

          return list[0];
        });
      },
    });

    require('@cypress/code-coverage/task')(on, config);
    return config;
  },
});
