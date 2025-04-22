declare namespace A6 {
  export type Labels = Record<string, string | Array<string>>;
  export type Plugin = Record<string, unknown>;
  export type Plugins = Record<string, Plugin>;
  export type Expr = Array<unknown>;

  export type UpstreamTimeout = {
    connect: number;
    send: number;
    read: number;
  };

  export type Upstream = object;

  export type Route = {
    id: string;
    name?: string;
    desc?: string;
    labels?: Labels;

    // matcher
    uri?: string;
    uris?: Array<string>;
    host?: string;
    hosts?: Array<string>;
    methods?: Array<string>;
    remote_addr?: string;
    remote_addrs?: Array<string>;
    vars?: Expr;
    filter_func?: string;

    // upstream and policies
    script?: string;
    script_id?: string;
    plugins?: Plugins;
    plugin_config_id?: string;
    upstream?: Upstream;
    upstream_id?: string;
    service_id?: string;
    timeout?: UpstreamTimeout;

    // misc
    enable_websocket?: boolean;
    priority?: number;
    status?: number;
  };

  export type ListResponse<T> = {
    list: Array<{
      key: string;
      value: T;
      createdIndex: number;
      modifiedIndex: number;
    }>;
    total: number;
  };
}
