declare namespace RouteModule {
  type Operator = '==' | '～=' | '>' | '<' | '~~';

  type VarPosition = 'arg' | 'http' | 'cookie';

  interface MatchingRule {
    position: VarPosition;
    name: string;
    operator: Operator;
    value: string;
    key: string;
  }

  type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  type RequestProtocol = 'https' | 'http' | 'websocket';

  type Step1Data = {
    name: string;
    desc: string;
    protocols: RequestProtocol[];
    websocket: boolean;
    hosts: string[];
    paths: string[];
    methods: HttpMethod[];
    redirect: boolean;
    forceHttps: boolean;
    redirectURI?: string;
    redirectCode?: boolean;
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
    host: string;
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
    upstreamProtocol: 'http' | 'https' | 'original';
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

  type Redirect =
    | {
        redirect_to_https: boolean;
        code: 301 | 302;
        uri: string;
      }
    | {
        redirect_to_https: boolean;
      }
    | {};

  // Request Body or Response Data for API
  type Body = {
    id?: number;
    name: string;
    desc: string;
    priority?: number;
    methods: HttpMethod[];
    uris: string[];
    hosts: string[];
    protocols: RequestProtocol[];
    redirect: Redirect;
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
