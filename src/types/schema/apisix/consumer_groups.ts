import { APISIXPluginConfigs } from './plugin_configs';

const ConsumerGroup = APISIXPluginConfigs.PluginConfig.omit({ name: true });

export const APISIXConsumerGroups = {
  ConsumerGroup,
  ConsumerGroupPut: ConsumerGroup.omit({
    create_time: true,
    update_time: true,
  }),
};
