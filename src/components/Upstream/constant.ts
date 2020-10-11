export const DEFAULT_UPSTREAM = {
  nodes: [{ host: '', port: 80, weight: 1 }],
  type: 'roundrobin',
  timeout: {
    connect: 6000,
    send: 6000,
    read: 6000,
  },
};
