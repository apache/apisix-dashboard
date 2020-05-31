import { list2locale } from '../service';

const prefix = 'PluginForm';

const pluginList: PluginForm.PluginLocaleProps[] = [
  // BUG: list2locale
  {
    name: 'limit-req',
    desc: '',
  },
  {
    name: 'limit-req',
    desc: '限流限制请求速度的插件，使用的是漏桶算法。',
  },
  {
    name: 'key-auth',
    desc: 'basic-auth 是一个认证插件，它需要与 consumer 一起配合才能工作。',
  },
];

export default {
  ...list2locale(pluginList, prefix),
};
