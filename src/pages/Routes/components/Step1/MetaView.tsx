import React from 'react';
import Form, { FormInstance } from 'antd/es/form';
import { Input } from 'antd';

import { FORM_ITEM_LAYOUT } from '@/pages/Routes/constants';
import PanelSection from '../PanelSection';
import styles from '../../Create.less';

interface Props extends RouteModule.Data {
  form: FormInstance;
}

const MetaView: React.FC<Props> = ({ form, disabled }) => {
  return (
    <PanelSection title="名称及其描述">
      <Form {...FORM_ITEM_LAYOUT} form={form} layout="horizontal" className={styles.stepForm}>
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
      </Form>
    </PanelSection>
  );
};

export default MetaView;
