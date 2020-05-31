import { list2locale } from '../service';

const prefix = 'PluginForm';

const pluginList: PluginForm.PluginLocaleProps[] = [
  {
    name: 'limit-req',
    desc: '',
  },
  {
    name: 'limit-req',
    desc: 'limit request rate using the "leaky bucket" method.',
  },
  {
    name: 'key-auth',
    desc: 'key-auth is an authentication plugin, it should work with consumer together.',
  },
];

export default {
  ...list2locale(pluginList, prefix),
};
