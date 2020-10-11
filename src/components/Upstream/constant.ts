export const DEFAULT_UPSTREAM = {
  type: 'roundrobin',
  timeout: {
    connect: 6000,
    send: 6000,
    read: 6000,
  },
};
