declare namespace PluginPage {
  type PluginCategory = 'Security' | 'Limit' | 'Log' | 'Metric' | 'Other';

  type PluginMapperItem = {
    category: PluginCategory;
    hidden?: boolean;
  };

  interface PluginProps extends PluginMapperItem {
    name: string;
  }

  type PluginData = { [name: string]: any };
}
