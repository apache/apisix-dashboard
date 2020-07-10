import { request } from 'umi';

import { JSONSchema7 } from 'json-schema';

import { PLUGIN_MAPPER_SOURCE } from './data';

export const fetchPluginList = () => request<string[]>('/plugins');

export const getList = (plugins: PluginPage.PluginData) => {
  const PLUGIN_BLOCK_LIST = Object.entries(PLUGIN_MAPPER_SOURCE)
    .filter(([, value]) => value.hidden)
    .flat()
    .filter((item) => typeof item === 'string');

  return fetchPluginList().then((data) => {
    const names = data.filter((name) => !PLUGIN_BLOCK_LIST.includes(name));

    const activeNameList = Object.keys(plugins);
    const inactiveNameList = names.filter((name) => !activeNameList.includes(name));

    return {
      activeList: activeNameList.map((name) => ({ name, ...PLUGIN_MAPPER_SOURCE[name] })),
      inactiveList: inactiveNameList.map((name) => ({ name, ...PLUGIN_MAPPER_SOURCE[name] })),
    };
  });
};

export const fetchPluginSchema = (name: string): Promise<JSONSchema7> =>
  request(`/schema/plugins/${name}`);
