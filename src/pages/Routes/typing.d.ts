declare namespace RouteModule {
  type Operator = '==' | '～=' | '>' | '<' | '~~';

  interface MatchingRule {
    position: 'query' | 'params' | 'header' | 'cookie';
    name: string;
    operator: Operator;
    value: string;
    key: string;
  }

  type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  type RequestProtocol = 'HTTPS' | 'HTTP' | 'websocket';

  type Step1Data = {
    name: string;
    protocols: RequestProtocol[];
    websocket: boolean;
    hosts: string[];
    paths: string[];
    methods: HttpMethod[];
    advancedMatchingRules: MatchingRule[];
  };

  type Step3Data = {
    plugins: {
      [name: string]: any;
    };
  };

  interface Data {
    disabled?: boolean;
    data: {
      step1Data: Step1Data;
      step2Data: Step2Data;
      step3Data: Step3Data;
    };
    onChange(data: T): void;
  }

  type UpstreamHost = {
    host: '';
    port: number;
    weight: number;
  };

  interface UpstreamHeader {
    header_name: string;
    header_value: string;
  }

  interface UpstreamHeader {
    key: string;
  }

  type Step2Data = {
    upstreamProtocol: 'HTTP' | 'HTTPS' | 'originalRequest';
    upstreamHostList: UpstreamHost[];
    upstreamPath: string;
    upstreamHeaderList: UpstreamHeader[];
    timeout: {
      connect: number;
      send: number;
      read: number;
    };
  };

  type ModalType = 'CREATE' | 'EDIT';

  // Request Body or Response Data for API
  type Body = {
    name: string;
    desc?: string;
    priority?: number;
    methods: HttpMethod[];
    uris: string[];
    hosts: string[];
    protocols: RequestProtocol[];
    redirect:
      | {
          code: 301 | 302;
          uri: string;
        }
      | {
          redirect_to_https?: boolean;
        };
    vars: [string, Operator, string][];
    upstream: {
      type: 'roundrobin' | 'chash';
      nodes: {
        [key: string]: number;
      };
      timeout: {
        connect: number;
        send: number;
        read: number;
      };
    };
    upstream_path: {
      from?: string;
      to: string;
    };
    upstream_header: {
      [key: string]: string;
    };
    plugins: {
      [name: string]: any;
    };
  };
}
