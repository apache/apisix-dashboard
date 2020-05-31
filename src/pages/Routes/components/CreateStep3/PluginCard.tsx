import React from 'react';
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';

interface Props extends CardProps {
  name: string;
}

const PluginCard: React.FC<Props> = ({ name, actions }) => {
  return (
    <Card style={{ width: 300 }} actions={actions}>
      <Card.Meta title={name} description="插件描述" />
    </Card>
  );
};

export default PluginCard;
