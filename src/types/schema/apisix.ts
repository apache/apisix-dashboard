import { z } from 'zod';

export const LabelsSchema = z.record(
  z.union([z.string(), z.array(z.string())])
);

export const PluginSchema = z.record(z.unknown());

export const PluginsSchema = z.record(PluginSchema);

export const ExprSchema = z.array(z.unknown());

export const UpstreamTimeoutSchema = z.object({
  connect: z.number(),
  send: z.number(),
  read: z.number(),
});

export const UpstreamSchema = z.record(z.any());

export const RouteSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  desc: z.string().optional(),
  labels: LabelsSchema.optional(),
  uri: z.string().optional(),
  uris: z.array(z.string()).optional(),
  host: z.string().optional(),
  hosts: z.array(z.string()).optional(),
  methods: z.array(z.string()).optional(),
  remote_addr: z.string().optional(),
  remote_addrs: z.array(z.string()).optional(),
  vars: ExprSchema.optional(),
  filter_func: z.string().optional(),
  script: z.string().optional(),
  script_id: z.string().optional(),
  plugins: PluginsSchema.optional(),
  plugin_config_id: z.string().optional(),
  upstream: UpstreamSchema.optional(),
  upstream_id: z.string().optional(),
  service_id: z.string().optional(),
  timeout: UpstreamTimeoutSchema.optional(),
  enable_websocket: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.number().optional(),
});

export const A6Schema = {
  RouteSchema,
  UpstreamSchema,
  ExprSchema,
  PluginsSchema,
  PluginSchema,
  LabelsSchema,
  UpstreamTimeoutSchema,
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace A6 {
  export type ListResponse<T> = {
    list: Array<{
      key: string;
      value: T;
      createdIndex: number;
      modifiedIndex: number;
    }>;
    total: number;
  };
  export type Route = z.infer<typeof RouteSchema>;
  export type UpstreamTimeout = z.infer<typeof UpstreamTimeoutSchema>;
  export type Upstream = z.infer<typeof UpstreamSchema>;
  export type Expr = z.infer<typeof ExprSchema>;
  export type Plugins = z.infer<typeof PluginsSchema>;
  export type Plugin = z.infer<typeof PluginSchema>;
  export type Labels = z.infer<typeof LabelsSchema>;
}
