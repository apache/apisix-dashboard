import { z } from 'zod';

export const pageSearchSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .default(1)
    .transform((val) => (val ? Number(val) : 1)),
  pageSize: z
    .union([z.string(), z.number()])
    .optional()
    .default(10)
    .transform((val) => (val ? Number(val) : 10)),
  name: z.string().optional(),
  label: z.string().optional(),
});

export type PageSearchType = z.infer<typeof pageSearchSchema>;
