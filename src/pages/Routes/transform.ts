import { omit } from 'lodash';

export const transformStepData = ({
  data: { step1Data, step2Data, step3Data },
}: Pick<RouteModule.Data, 'data'>) => {
  const nodes = {};
  step2Data.upstreamHostList.forEach((node) => {
    nodes[`${node.host}:${node.port}`] = node.weight;
  });

  const upstream_header = {};
  step2Data.upstreamHeaderList.forEach((header) => {
    upstream_header[header.header_name] = header.header_value;
  });

  let redirect: RouteModule.Redirect = {};
  if (step1Data.redirect) {
    if (step1Data.forceHttps) {
      redirect = { redirect_to_https: true };
    } else {
      redirect = {
        redirect_to_https: false,
        code: step1Data.redirectCode,
        uri: step1Data.redirectURI,
      };
    }
  }

  let data: RouteModule.Body = {
    ...step1Data,
    ...step2Data,
    ...step3Data,
    priority: 0,
    protocols: step1Data.protocols.concat(step1Data.websocket ? 'websocket' : []),
    uris: step1Data.paths,
    redirect,
    vars: step1Data.advancedMatchingRules.map((rule) => {
      const { operator, position, name, value } = rule;
      let key = '';
      switch (position) {
        case 'cookie':
          key = `cookie_${name}`;
          break;
        case 'header':
          key = `http_${name}`;
          break;
        default:
          key = `args_${name}`;
      }
      return [key, operator, value];
    }),
    upstream: {
      type: 'roundrobin',
      nodes,
      timeout: step2Data.timeout,
    },
    upstream_header,
    upstream_path: {
      to: step2Data.upstreamPath,
    },
  };

  data = omit(data, [
    'advancedMatchingRules',
    'upstreamProtocol',
    'upstreamHostList',
    'upstreamPath',
    'upstreamHeaderList',
    'websocket',
    'timeout',
    'redirect',
    'redirectURI',
    'redirectCode',
  ]) as RouteModule.Body;

  return data;
};
