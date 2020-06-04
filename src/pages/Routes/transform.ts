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
  if (step1Data.forceHttps) {
    // TODO: 当只有步骤1预览的时候，需要清除步骤2和步骤3中的脏数据
    redirect = { redirect_to_https: true };
  }

  if (step1Data.redirectURI !== '') {
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
    priority: 0,
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

  return omit(data, [
    'advancedMatchingRules',
    'upstreamProtocol',
    'upstreamHostList',
    'upstreamPath',
    'upstreamHeaderList',
    'websocket',
    'timeout',
    'redirectURI',
    'redirectCode',
    'forceHttps',
  ]) as RouteModule.Body;
};

const transformVarsToRules = (
  data: [string, RouteModule.Operator, string][],
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

const transformUpstreamNodes = (nodes: { [key: string]: number }): RouteModule.UpstreamHost[] => {
  const data: RouteModule.UpstreamHost[] = [];
  Object.entries(nodes).forEach(([k, v]) => {
    const [host, port] = k.split(':');
    data.push({ host, port: Number(port), weight: Number(v) });
  });
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
    redirect: Boolean(redirect),
    forceHttps: Boolean(redirect.redirect_to_https),
  };

  if (redirect.code) {
    step1Data.redirectCode = redirect.code;
    step1Data.redirectURI = redirect.uri;
  }

  const { upstream, upstream_path, upstream_header } = data;

  const upstreamHeaderList = Object.entries(upstream_header).map(([k, v]) => {
    return { header_name: k, header_value: v, key: Math.random().toString(36).slice(2) };
  });

  const step2Data: RouteModule.Step2Data = {
    upstreamProtocol: 'keep',
    upstreamHeaderList,
    upstreamHostList: transformUpstreamNodes(upstream.nodes),
    upstreamPath: upstream_path.to,
    timeout: upstream.timeout,
  };

  const { plugins } = data;
  const step3Data: RouteModule.Step3Data = {
    plugins,
  };

  return {
    step1Data,
    step2Data,
    step3Data,
  };
};
