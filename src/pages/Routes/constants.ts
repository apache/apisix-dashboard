export const HTTP_METHOD_OPTION_LIST: RouteModule.HttpMethod[] = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'PATCH',
];

export const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

export const FORM_ITEM_WITHOUT_LABEL = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 6 },
  },
};

export const DEFAULT_STEP_1_DATA: RouteModule.Step1Data = {
  name: '',
  desc: '',
  protocols: ['http', 'https'],
  websocket: false,
  hosts: [''],
  paths: [],
  forceHttps: false,
  redirectCode: 301,
  methods: HTTP_METHOD_OPTION_LIST,
  advancedMatchingRules: [],
};

export const DEFAULT_STEP_2_DATA: RouteModule.Step2Data = {
  upstreamProtocol: 'original',
  upstreamHostList: [{ host: '', port: 80, weight: 0 }],
  upstreamHeaderList: [],
  upstreamPath: '',
  timeout: {
    connect: 30000,
    send: 30000,
    read: 30000,
  },
};

export const DEFAULT_STEP_3_DATA: RouteModule.Step3Data = {
  plugins: {
    'limit-count': {
      count: 2,
      time_window: 60,
      rejected_code: 503,
      key: 'remote_addr',
    },
  },
};
