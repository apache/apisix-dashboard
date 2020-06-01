import React from 'react';
import Form, { FormInstance } from 'antd/es/form';
import { Input } from 'antd';

import PanelSection from '../PanelSection';
import { formItemLayout } from '.';
import styles from '../../Create.less';

interface Props {
  form: FormInstance;
}

const MetaView: React.FC<Props> = ({ form }) => {
  return (
    <PanelSection title="名称及其描述">
      <Form {...formItemLayout} form={form} layout="horizontal" className={styles.stepForm}>
        <Form.Item
          label="API 名称"
          name="name"
          rules={[{ required: true, message: '请输入 API 名称' }]}
        >
          <Input placeholder="请输入 API 名称" />
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </PanelSection>
  );
};

export default MetaView;
