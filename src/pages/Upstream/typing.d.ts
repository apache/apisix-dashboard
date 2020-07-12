declare namespace UpstreamModule {
  type UpstreamHost = {
    host: string;
    port: number;
    weight: number;
  };

  type Base = {
    name: string;
    timeout: {
      connect: number;
      read: number;
      send: number;
    };
    type: 'roundrobin' | 'chash';
    description: string;
  };

  type Entity = Base & {
    nodes: {
      [ipWithPort: string]: number;
    };
  };

  type Body = Base & {
    upstreamHostList: UpstreamHost[];
  };

  type ResEntity = Entity & {
    id: string;
    update_time: string;
  };
}
