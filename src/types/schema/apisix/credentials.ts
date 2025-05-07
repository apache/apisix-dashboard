import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';

const Credential = z
  .object({
    plugins: APISIXPlugins.Plugins.optional(),
  })
  .merge(APISIXCommon.Info)
  .merge(APISIXCommon.Basic.omit({ name: true }));

const ConsumerCredentials = z.array(Credential);

export const APISIXCredentials = {
  Credential,
  CredentialPut: Credential.omit({
    create_time: true,
    update_time: true,
  }),
  ConsumerCredentials,
};
