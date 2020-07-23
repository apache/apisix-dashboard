import React from 'react';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useIntl } from 'umi';

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
  const { formatMessage } = useIntl();
  return (
    <Form {...FORM_LAYOUT} form={form}>
      <Form.Item
        label={formatMessage({ id: 'consumer.step.username' })} 
        name="username"
        rules={[
          { required: true },
          {
            pattern: new RegExp(/^[a-zA-Z][a-zA-Z0-9_]{0,100}$/, 'g'),
            message: formatMessage({ id: 'consumer.step.username.rule' }),
          },
        ]}
        extra={formatMessage({ id: 'consumer.step.username.unique' })}
      >
        <Input
          placeholder={formatMessage({ id: 'consumer.step.input.username' })}
          disabled={disabled || window.location.pathname.indexOf('edit') !== -1}
        />
      </Form.Item>
      <Form.Item label={formatMessage({ id: 'consumer.step.description' })}  name="desc">
        <Input.TextArea placeholder={formatMessage({ id: 'consumer.step.input.description' })} disabled={disabled} />
      </Form.Item>
    </Form>
  );
};

export default Step1;