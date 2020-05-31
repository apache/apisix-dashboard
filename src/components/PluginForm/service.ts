import { request } from 'umi';
import { transformSchemaFromAPI } from './transformer';

export const fetchList = () => request('/plugins/list');

export const fetchPluginSchema = (name: string): Promise<PluginForm.PluginSchema> =>
  request(`/schema/plugins/${name}`).then((data) => transformSchemaFromAPI(data, name));

export const list2locale = (list: PluginForm.PluginLocaleProps[], prefix = '') => {
  return list.reduce((prev, current) => {
    const data = {};
    Object.entries(current).map(([key, value]) => {
      data[`${prefix}.plugin.${current.name}.${key}`] = value;
      return { [key]: value };
    });
    return { ...prev, ...data };
  });
};
