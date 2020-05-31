interface Props extends PluginForm.PluginMeta {
  name: PluginForm.PluginName;
}

export const list: Props[] = [
  {
    name: 'limit-req',
    desc: '限流限制请求速度的插件，使用的是漏桶算法。',
  },
];
