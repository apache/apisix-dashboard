import React from 'react';
import Form from 'antd/es/form';
import { Input } from 'antd';
import { useIntl } from 'umi';

import PanelSection from '@/components/PanelSection';

interface Props extends RouteModule.Data {}

const MetaView: React.FC<Props> = ({ disabled }) => {
  const { formatMessage } = useIntl();
  return (
    <PanelSection title={formatMessage({ id: 'route.meta.name.description' })}>
      <Form.Item
        label={formatMessage({ id: 'route.meta.api.name' })}
        name="name"
        rules={[
          { required: true, message: formatMessage({ id: 'route.meta.input.api.name' }) },
          {
            pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/, 'g'),
            message: formatMessage({ id: 'route.meta.api.name.rule' }),
          },
        ]}
        extra={formatMessage({ id: 'rotue.meta.api.rule' })}
      >
        <Input placeholder={formatMessage({ id: 'route.meta.input.api.name' })} disabled={disabled} />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'route.meta.description' })} name="desc">
        <Input.TextArea placeholder={formatMessage({ id: 'route.meta.description.rule' })} disabled={disabled} />
      </Form.Item>
    </PanelSection>
  );
};

export default MetaView;
