import React from 'react';
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';

import { getPluginMeta } from '@/components/PluginForm';

interface Props extends CardProps {
  name: PluginForm.PluginName;
}

const PluginCard: React.FC<Props> = ({ name, actions }) => {
  const plugin = getPluginMeta(name);
  if (!plugin) {
    return null;
  }
  const { desc = '' } = plugin;

  return (
    <Card style={{ width: 300 }} actions={actions}>
      <Card.Meta title={name} description={desc} />
    </Card>
  );
};

export default PluginCard;
