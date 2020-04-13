export enum HttpMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  HEAD,
  OPTIONS,
  CONNECT,
  TRACE
}

export interface MatcherVars {
  var: string;
  operator: '==' | '~=' | '>' | '<' | '~~';
  val: string;
}

export interface Routes {
  uri?: string;
  uris?: string[];
  plugins?: object;
  upstream?: any;
  upstream_id?: number;
  service_id?: number;
  service_protocol: 'grpc' | 'http';
  desc?: string;
  host?: string;
  hosts?: string[];
  remote_addr?: string;
  remote_addrs?: string[];
  methods?: HttpMethod[];
  priority?: number;
  vars?: MatcherVars[];
  filter_func?: ''
}

export interface ModelState {}

export interface ModelType {
  namespace: string;
  state: ModelState;
  effects: {};
  reducers: {};
}

const model: ModelType = {
  namespace: 'routes',
  state: {},
  effects: {},
  reducers: {},
};

export default model;
