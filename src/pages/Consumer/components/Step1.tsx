import React from 'react';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';

const FORM_LAYOUT = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 8,
  },
};

type Props = {
  form: FormInstance;
  disabled?: boolean;
};

const Step1: React.FC<Props> = ({ form, disabled }) => {
  return (
    <Form {...FORM_LAYOUT} form={form}>
      <Form.Item
        label="用户名"
        name="username"
        rules={[
          { required: true },
          {
            pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,100}$/, 'g'),
            message: '最大长度100，仅支持英文、数字和下划线，且只能以英文开头',
          },
        ]}
        extra="用户名全局唯一"
      >
        <Input
          placeholder="请输入用户名"
          disabled={disabled || window.location.pathname.indexOf('edit') !== -1}
        />
      </Form.Item>
      <Form.Item label="描述" name="desc">
        <Input.TextArea placeholder="在此输入描述" disabled={disabled} />
      </Form.Item>
    </Form>
  );
};

export default Step1;
