import { request } from 'umi';
import { transformSchemaFromAPI } from '@/transforms/plugin';

export const fetchList = () => request('/api/plugins/list');

export const fetchPluginSchema = (name: string): Promise<PluginSchema> =>
  request(`/schema/plugins/${name}`).then((data) => transformSchemaFromAPI(data, name));
