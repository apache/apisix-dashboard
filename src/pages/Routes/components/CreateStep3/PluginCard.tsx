import React from 'react';
import { Card } from 'antd';
import { CardProps } from 'antd/lib/card';
import { useIntl } from 'umi';

interface Props extends CardProps {
  name: string;
}

const PluginCard: React.FC<Props> = ({ name, actions }) => {
  const { formatMessage } = useIntl();

  return (
    <Card style={{ width: 300 }} actions={actions}>
      <Card.Meta
        title={name}
        description={formatMessage({ id: `PluginForm.plugin.${name}.desc` })}
      />
    </Card>
  );
};

export default PluginCard;
