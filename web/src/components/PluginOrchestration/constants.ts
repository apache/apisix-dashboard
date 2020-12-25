export const INIT_CHART = {
  offset: { x: 0, y: 0 },
  scale: 0.577,
  nodes: {},
  links: {},
  selected: {},
  hovered: {},
};

export const PLUGINS_PORTS = {
  port1: {
    id: 'port1',
    type: 'input',
    properties: {
      custom: 'property',
    },
  },
  port2: {
    id: 'port2',
    type: 'output',
    properties: {
      custom: 'property',
    },
  },
};

export const CONDITION_PORTS = {
  port1: {
    id: 'port1',
    type: 'input',
  },
  port2: {
    id: 'port2',
    type: 'output',
    properties: {
      value: 'no',
    },
  },
  port3: {
    id: 'port3',
    type: 'output',
    properties: {
      value: 'yes',
    },
  },
};

export const CATEGOTY_OPTIONS = [
  'All',
  'Observability',
  'Security',
  'Other',
  'Authentication',
  'Limit traffic',
  'Log',
];
