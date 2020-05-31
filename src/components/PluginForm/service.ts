import { request } from 'umi';
import { transformSchemaFromAPI } from './transformer';
import { list } from './data';

export const fetchList = () => request('/plugins/list');

export const fetchPluginSchema = (name: string): Promise<PluginForm.PluginSchema> =>
  request(`/schema/plugins/${name}`).then((data) => transformSchemaFromAPI(data, name));

export const getPluginMeta = (name: PluginForm.PluginName): PluginForm.PluginMeta | undefined =>
  list.find((item) => item.name === name);
