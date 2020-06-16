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

  type BaseData = {
    id?: number;
    name: string;
    desc: string;
  };

  type Step1Data = {
    name: string;
    desc: string;
    protocols: RequestProtocol[];
    websocket: boolean;
    hosts: string[];
    paths: string[];
    methods: HttpMethod[];
    redirectOption: 'forceHttps' | 'customRedirect' | 'disabled';
    redirectURI?: string;
    redirectCode?: number;
    advancedMatchingRules: MatchingRule[];
  };

  type Step3Data = {
    plugins: {
      [name: string]: any;
    };
    _enabledPluginList: PluginForm.PluginProps[];
    _disabledPluginList: PluginForm.PluginProps[];
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
    upstream_protocol: 'http' | 'https' | 'keep';
    upstreamHostList: UpstreamHost[];
    upstreamPath: string | undefined;
    upstreamHeaderList: UpstreamHeader[];
    timeout: {
      connect: number;
      send: number;
      read: number;
    };
  };

  type ModalType = 'CREATE' | 'EDIT';

  type Redirect = {
    code?: number;
    uri?: string;
    http_to_https?: boolean;
  };

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
    redirect?: Redirect;
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
    upstream_path?: {
      from?: string;
      to: string;
    };
    upstream_protocol: 'keep' | 'http' | 'https';
    upstream_header: {
      [key: string]: string;
    };
    plugins: {
      [name: string]: any;
    };
  };
}
