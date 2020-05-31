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
    <Card actions={actions}>
      <Card.Meta
        title={name}
        description={formatMessage({
          id: `PluginForm.plugin.${name}.desc`,
          defaultMessage: 'Please view the documentation.',
        })}
      />
    </Card>
  );
};

export default PluginCard;
