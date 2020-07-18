import { omit, pick } from 'lodash';

export const transformStepData = ({
  data: { step1Data, step2Data, step3Data },
}: Pick<RouteModule.Data, 'data'>) => {
  const nodes = {};
  step2Data.upstreamHostList.forEach((node) => {
    nodes[`${node.host}:${node.port}`] = node.weight;
  });

  const upstream_header = {};
  (step2Data.upstreamHeaderList || []).forEach((header) => {
    upstream_header[header.header_name] = header.header_value || '';
  });

  let redirect: RouteModule.Redirect = {};
  if (step1Data.redirectOption === 'disabled') {
    redirect = {};
  } else if (step1Data.redirectOption === 'forceHttps') {
    redirect = { http_to_https: true };
  } else if (step1Data.redirectURI !== '') {
    redirect = {
      code: step1Data.redirectCode,
      uri: step1Data.redirectURI,
    };
  }

  let { protocols } = step1Data;
  if (step1Data.websocket) {
    protocols = protocols.concat('websocket');
  }

  const data: Partial<RouteModule.Body> = {
    ...step1Data,
    ...step2Data,
    ...step3Data,
    protocols,
    uris: step1Data.paths,
    redirect,
    vars: step1Data.advancedMatchingRules.map((rule) => {
      const { operator, position, name, value } = rule;
      let key = '';
      switch (position) {
        case 'cookie':
          key = `cookie_${name}`;
          break;
        case 'http':
          key = `http_${name}`;
          break;
        default:
          key = `arg_${name}`;
      }
      return [key, operator, value];
    }),
    upstream: {
      type: 'roundrobin',
      nodes,
      timeout: step2Data.timeout,
    },
    upstream_header,
  };

  if (step2Data.upstreamPath) {
    data.upstream_path = {
      to: step2Data.upstreamPath,
    };
  }

  if (step3Data.plugins.prometheus) {
    // eslint-disable-next-line no-param-reassign
    step3Data.plugins.prometheus = {};
  }

  // 未启用 redirect
  if (!redirect.uri) {
    // 移除前端部分自定义变量
    return omit(data, [
      'advancedMatchingRules',
      'upstreamHostList',
      'upstreamPath',
      'upstreamHeaderList',
      'websocket',
      'timeout',
      'redirectURI',
      'redirectCode',
      'forceHttps',
      'redirectOption',
      step1Data.redirectOption === 'disabled' ? 'redirect' : '',
      step2Data.upstream_id ? 'upstream' : 'upstream_id',
    ]);
  }

  return pick(data, ['name', 'desc', 'protocols', 'hosts', 'uris', 'methods', 'redirect', 'vars']);
};

const transformVarsToRules = (
  data: [string, RouteModule.Operator, string][] = [],
): RouteModule.MatchingRule[] =>
  data.map(([key, operator, value]) => {
    const [position, name] = key.split('_');
    return {
      position: position as RouteModule.VarPosition,
      name,
      value,
      operator,
      key: Math.random().toString(36).slice(2),
    };
  });

export const transformUpstreamNodes = (
  nodes: { [key: string]: number } = {},
): RouteModule.UpstreamHost[] => {
  const data: RouteModule.UpstreamHost[] = [];
  Object.entries(nodes).forEach(([k, v]) => {
    const [host, port] = k.split(':');
    data.push({ host, port: Number(port), weight: Number(v) });
  });
  if (data.length === 0) {
    data.push({} as RouteModule.UpstreamHost);
  }
  return data;
};

export const transformRouteData = (data: RouteModule.Body) => {
  const { name, desc, methods, uris, protocols, hosts, vars, redirect } = data;

  const step1Data: Partial<RouteModule.Step1Data> = {
    name,
    desc,
    protocols: protocols.filter((item) => item !== 'websocket'),
    websocket: protocols.includes('websocket'),
    hosts,
    paths: uris,
    methods,
    advancedMatchingRules: transformVarsToRules(vars),
  };

  if (redirect?.http_to_https) {
    step1Data.redirectOption = 'forceHttps';
  } else if (redirect?.uri) {
    step1Data.redirectOption = 'customRedirect';
    step1Data.redirectCode = redirect?.code;
    step1Data.redirectURI = redirect?.uri;
  } else {
    step1Data.redirectOption = 'disabled';
  }

  const {
    upstream,
    upstream_path,
    upstream_header,
    upstream_protocol = 'keep',
    upstream_id,
  } = data;

  const upstreamHeaderList = Object.entries(upstream_header || {}).map(([k, v]) => {
    return {
      header_name: k,
      header_value: v,
      key: Math.random().toString(36).slice(2),
      header_action: v ? 'override' : 'remove',
    };
  });

  const step2Data: RouteModule.Step2Data = {
    upstream_protocol,
    upstreamHeaderList,
    upstreamHostList: transformUpstreamNodes(upstream?.nodes),
    upstream_id,
    upstreamPath: upstream_path?.to,
    timeout: upstream?.timeout || {
      connect: 6000,
      send: 6000,
      read: 6000,
    },
  };

  const { plugins } = data;
  if (plugins.prometheus) {
    plugins.prometheus = { enabled: true };
  }
  const step3Data: RouteModule.Step3Data = {
    plugins,
  };

  return {
    step1Data,
    step2Data,
    step3Data,
  };
};
