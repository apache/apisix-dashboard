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
          id: `PluginPage.card.${name}.desc`,
          defaultMessage: formatMessage({ id: 'PluginPage.card.refer.documents' }),
        })}
      />
    </Card>
  );
};

export default PluginCard;
