export const PLUGIN_MAPPER_SOURCE: { [name: string]: PluginPage.PluginMapperItem } = {
  'limit-req': {
    category: 'Limit',
  },
  'limit-count': {
    category: 'Limit',
  },
  'limit-conn': {
    category: 'Limit',
  },
  'key-auth': {
    category: 'Security',
  },
  'basic-auth': {
    category: 'Security',
  },
  prometheus: {
    category: 'Metric',
  },
  'node-status': {
    category: 'Other',
  },
  'jwt-auth': {
    category: 'Security',
  },
  zipkin: {
    category: 'Metric',
  },
  'ip-restriction': {
    category: 'Security',
  },
  'grpc-transcode': {
    category: 'Other',
    hidden: true,
  },
  'serverless-pre-function': {
    category: 'Other',
  },
  'serverless-post-function': {
    category: 'Other',
  },
  'openid-connect': {
    category: 'Security',
  },
  'proxy-rewrite': {
    category: 'Other',
    hidden: true,
  },
  redirect: {
    category: 'Other',
    hidden: true,
  },
  'response-rewrite': {
    category: 'Other',
  },
  'fault-injection': {
    category: 'Security',
  },
  'udp-logger': {
    category: 'Log',
  },
  'wolf-rbac': {
    category: 'Other',
    hidden: true,
  },
  'proxy-cache': {
    category: 'Other',
  },
  'tcp-logger': {
    category: 'Log',
  },
  'proxy-mirror': {
    category: 'Other',
  },
  'kafka-logger': {
    category: 'Log',
  },
  cors: {
    category: 'Security',
  },
  heartbeat: {
    category: 'Other',
    hidden: true,
  },
  'batch-requests': {
    category: 'Other',
  },
  'http-logger': {
    category: 'Log',
  },
  'mqtt-proxy': {
    category: 'Other',
  },
  oauth: {
    category: 'Security',
  },
};
