import React from 'react';
import Form from 'antd/es/form';
import { Input } from 'antd';

// import { FORM_ITEM_LAYOUT } from '@/pages/Routes/constants';
import PanelSection from '../PanelSection';

interface Props extends RouteModule.Data {}

const MetaView: React.FC<Props> = ({ disabled }) => {
  return (
    <PanelSection title="名称及其描述">
      <Form.Item
        label="API 名称"
        name="name"
        rules={[{ required: true, message: '请输入 API 名称' }]}
      >
        <Input placeholder="请输入 API 名称" disabled={disabled} />
      </Form.Item>
      <Form.Item label="描述" name="desc">
        <Input.TextArea placeholder="请输入描述" disabled={disabled} />
      </Form.Item>
    </PanelSection>
  );
};

export default MetaView;
