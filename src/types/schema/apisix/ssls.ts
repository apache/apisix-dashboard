import { z } from 'zod';

import { APISIXCommon } from './common';

const SSLType = z.union([z.literal('server'), z.literal('client')]);

const SSLProtocols = z.union([
  z.literal('TLSv1.1'),
  z.literal('TLSv1.2'),
  z.literal('TLSv1.3'),
]);

const SSLClient = z.object({
  ca: z.string().optional(),
  depth: z.number().min(0).default(1).optional(),
  skip_mtls_uri_regex: z.array(z.string()).optional(),
});

const SSL = z
  .object({
    cert: z.string(),
    key: z.string(),
    sni: z.string().optional(),
    snis: z.array(z.string()),
    certs: z.array(z.string()),
    keys: z.array(z.string()),
    client: SSLClient.optional(),
    type: SSLType.optional(),
    status: APISIXCommon.Status.optional(),
    ssl_protocols: z.array(SSLProtocols).optional(),
  })
  .partial()
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info);

export const APISIXSSLs = {
  SSL,
  SSLStatus: APISIXCommon.Status,
  SSLType,
  SSLProtocols,
  SSLClient,
};
