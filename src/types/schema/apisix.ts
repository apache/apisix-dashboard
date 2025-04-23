import type { AxiosResponse } from 'axios';
import { z } from 'zod';

const Labels = z.record(z.union([z.string(), z.array(z.string())]));

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const Expr = z.array(z.unknown());

const UpstreamTimeout = z.object({
  connect: z.number(),
  send: z.number(),
  read: z.number(),
});

const Upstream = z.record(z.any());

const Route = z.object({
  id: z.string(),
  name: z.string().optional(),
  desc: z.string().optional(),
  labels: Labels.optional(),
  uri: z.string().optional(),
  uris: z.array(z.string()).optional(),
  host: z.string().optional(),
  hosts: z.array(z.string()).optional(),
  methods: z.array(z.string()).optional(),
  remote_addr: z.string().optional(),
  remote_addrs: z.array(z.string()).optional(),
  vars: Expr.optional(),
  filter_func: z.string().optional(),
  script: z.string().optional(),
  script_id: z.string().optional(),
  plugins: Plugins.optional(),
  plugin_config_id: z.string().optional(),
  upstream: Upstream.optional(),
  upstream_id: z.string().optional(),
  service_id: z.string().optional(),
  timeout: UpstreamTimeout.partial(),
  enable_websocket: z.boolean().optional(),
  priority: z.number().optional(),
  status: z.number(),
});

export const A6 = {
  Route,
  Upstream,
  Expr,
  Plugins,
  Plugin,
  Labels,
  UpstreamTimeout,
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace A6Type {
  export type ListResponse<T> = {
    list: Array<{
      key: string;
      value: T;
      createdIndex: number;
      modifiedIndex: number;
    }>;
    total: number;
  };
  export type Route = z.infer<typeof Route>;
  export type UpstreamTimeout = z.infer<typeof UpstreamTimeout>;
  export type Upstream = z.infer<typeof Upstream>;
  export type Expr = z.infer<typeof Expr>;
  export type Plugins = z.infer<typeof Plugins>;
  export type Plugin = z.infer<typeof Plugin>;
  export type Labels = z.infer<typeof Labels>;

  export type RespRouteList = AxiosResponse<A6Type.ListResponse<A6Type.Route>>;
}
