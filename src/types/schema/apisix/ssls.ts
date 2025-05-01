// filepath: /workspace/src/types/schema/apisix/ssls.ts
import { z } from 'zod';
import { APISIXCommon } from './common';

const SSLType = z.literal('server');

const SSL = z
  .object({
    cert: z.string(),
    key: z.string(),
    sni: z.string(),
    snis: z.array(z.string()),
    certs: z.array(z.string()),
    keys: z.array(z.string()),
    client: z
      .object({
        ca: z.string(),
        depth: z.number().min(0).default(1),
      })
      .partial(),
    type: SSLType,
    exptime: z.number().optional(),
    status: APISIXCommon.Status,
    validity_start: z.number().optional(),
    validity_end: z.number().optional(),
  })
  .partial()
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info)
  // Based on the issues found, APISIX requires specific combinations of fields
  .refine(
    (data) => {
      if (data.type === 'server') {
        // Server type requires one of these combinations
        const hasSingleCert =
          data.sni !== undefined &&
          data.cert !== undefined &&
          data.key !== undefined;
        const hasMultiSNI =
          data.snis !== undefined &&
          data.cert !== undefined &&
          data.key !== undefined;
        const hasMultiCerts =
          (data.sni !== undefined || data.snis !== undefined) &&
          data.certs !== undefined &&
          data.keys !== undefined &&
          data.certs.length === data.keys.length;

        return hasSingleCert || hasMultiSNI || hasMultiCerts;
      }
      // Non-server type requires at least key and cert
      return data.cert !== undefined && data.key !== undefined;
    },
    {
      message:
        'SSL object requires valid combinations of sni/snis, cert/certs, and key/keys fields',
    }
  );

export const APISIXSSLs = {
  SSL,
  // Export SSLStatus as an alias to APISIXCommon.Status for backward compatibility
  SSLStatus: APISIXCommon.Status,
  SSLType,
};
