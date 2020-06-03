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

  let { protocols } = step1Data;
  if (step1Data.websocket) {
    protocols = protocols.concat('websocket');
  }

  const data: RouteModule.Body = {
    ...step1Data,
    ...step2Data,
    ...step3Data,
    priority: 0,
    protocols,
    uris: step1Data.paths,
    redirect: {
      redirect_to_https: true,
    },
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

  return omit(data, [
    'advancedMatchingRules',
    'upstreamProtocol',
    'upstreamHostList',
    'upstreamPath',
    'upstreamHeaderList',
    'websocket',
    'timeout',
  ]);
};
