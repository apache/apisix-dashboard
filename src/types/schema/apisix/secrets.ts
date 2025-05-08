import { z } from 'zod';

import { APISIXCommon } from './common';

const SecretBase = APISIXCommon.ID;

const VaultSecret = SecretBase.extend({
  manager: z.literal('vault'),
  uri: z.string(),
  prefix: z.string(),
  token: z.string(),
  namespace: z.string().optional(),
});

const AWSSecret = SecretBase.extend({
  manager: z.literal('aws'),
  access_key_id: z.string(),
  secret_access_key: z.string(),
  session_token: z.string().optional(),
  region: z.string().optional(),
  endpoint_url: z.string().optional(),
});

const GCPSecret = SecretBase.extend({
  manager: z.literal('gcp'),
  auth_file: z.string().optional(),
  auth_config: z
    .object({
      client_email: z.string(),
      private_key: z.string(),
      project_id: z.string(),
      token_uri: z.string().optional(),
      entries_uri: z.string().optional(),
      scope: z.array(z.string()).optional(),
    })
    .optional(),
  ssl_verify: z.boolean().optional(),
});

/**
 * Secret is not what is originally provided in apisix, and the `manager` will be parsed from the id
 */
const Secret = z.discriminatedUnion('manager', [
  VaultSecret,
  AWSSecret,
  GCPSecret,
]);

export const APISIXSecrets = {
  VaultSecret,
  AWSSecret,
  GCPSecret,
  SecretBase,
  Secret,
};
