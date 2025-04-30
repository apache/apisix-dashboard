import { z } from 'zod';

const Labels = z.record(z.string());

const Expr = z.array(z.unknown());

const Basic = z
  .object({
    name: z.string(),
    desc: z.string(),
    labels: Labels,
  })
  .partial();

const ID = z.object({
  id: z.string(),
});

const Timestamp = z.object({
  create_time: z.number(),
  update_time: z.number(),
});

const Info = ID.merge(Timestamp);

const HttpMethod = z.union([
  z.literal('GET'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('DELETE'),
  z.literal('PATCH'),
  z.literal('HEAD'),
  z.literal('OPTIONS'),
  z.literal('CONNECT'),
  z.literal('TRACE'),
  z.literal('PURGE'),
]);

export const APISIXCommon = {
  Basic,
  Labels,
  Expr,
  ID,
  Timestamp,
  Info,
  HttpMethod,
};
