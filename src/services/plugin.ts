import request from '@/utils/request';
import { transformPluginSchema } from '@/transforms/global';

export const fetchList = () => request('/api/plugins/list');

export const fetchPluginSchema = (name: string): Promise<PluginSchema> =>
  request(`/api/schema/plugins/${name}`).then(data => transformPluginSchema(data, name));
