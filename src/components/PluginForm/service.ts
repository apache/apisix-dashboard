import { request } from 'umi';
import { transformSchemaFromAPI } from './transformer';

export const fetchList = () => request('/plugins/list');

export const fetchPluginSchema = (name: string): Promise<PluginForm.PluginSchema> =>
  request(`/schema/plugins/${name}`).then((data) => transformSchemaFromAPI(data, name));
