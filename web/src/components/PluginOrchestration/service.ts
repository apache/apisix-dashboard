import { JSONSchema7 } from 'json-schema';
import request from './request';

import { PluginChartPage } from './typing';

export const fetchPluginList = () => request<PluginChartPage.Response>('/plugins');

const cachedPluginSchema: Record<string, object> = {};
export const fetchPluginSchema = (name: string): Promise<{ data: JSONSchema7 }> =>
  request(`/schema/plugins/${name}`);
