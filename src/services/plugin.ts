import request from '@/utils/request';

export const fetchList = () => request('/api/plugins/list');

export const fetchPluginSchema = (name: string): Promise<PluginSchema> =>
  request(`/api/schema/plugins/${name}`);
