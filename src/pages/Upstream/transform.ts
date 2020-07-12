import { omit } from 'lodash';

const transformUpstreamNodes = (
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

export const transformCreate = (props: UpstreamModule.Body): UpstreamModule.Entity => {
  const nodes = {};
  props.upstreamHostList.forEach((node) => {
    nodes[`${node.host}:${node.port}`] = node.weight;
  });

  return {
    ...omit(props, 'upstreamHostList'),
    nodes,
  };
};

export const transformFetch = (props: UpstreamModule.Entity) => {
  const upstreamHostList = transformUpstreamNodes(props.nodes);
  return {
    ...omit(props, 'nodes'),
    upstreamHostList,
  };
};
