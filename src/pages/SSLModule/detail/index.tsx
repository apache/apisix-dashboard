import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useParams } from 'dva';
import { Form, Input, Card, Button, notification } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

import { getPageMode } from '@/utils/utils';
import {
  fetchItem as fetchSSLItem,
  create as createSSL,
  update as updateSSL,
} from '@/services/ssl';
import { useForm } from 'antd/es/form/util';

const layout = {
  wrapperCol: { span: 8 },
};

const Detail: React.FC = () => {
  const [mode] = useState<PageMode>(getPageMode());
  const { key } = useParams();
  const [form] = useForm();

  useEffect(() => {
    if (mode === 'EDIT' && key) {
      fetchSSLItem(key).then(data => {
        console.log(data);
        form.setFieldsValue(data.value);
      });
    }
  }, [mode]);

  const onFinish = (values: any) => {
    if (mode === 'EDIT' && key) {
      updateSSL(key, values).then(() => {
        notification.success({
          message: `${formatMessage({ id: 'component.global.update' })} SSL ${formatMessage({
            id: 'component.status.success',
          }).toLowerCase()}`,
        });

        window.history.go(-1);
      });
    }

    if (mode === 'CREATE') {
      createSSL(values).then(() => {
        notification.success({
          message: `${formatMessage({ id: 'component.global.create' })} SSL ${formatMessage({
            id: 'component.status.success',
          }).toLowerCase()}`,
        });

        window.history.go(-1);
      });
    }
  };

  return (
    <PageHeaderWrapper>
      <Card>
        <Form {...layout} form={form} onFinish={onFinish}>
          <Form.Item
            label="SNI"
            name="sni"
            rules={[
              { required: true, message: formatMessage({ id: 'component.ssl.fieldSNIInvalid' }) },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Cert"
            name="cert"
            rules={[
              { required: true, message: formatMessage({ id: 'component.ssl.fieldCertInvalid' }) },
            ]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item
            label="Key"
            name="key"
            rules={[
              { required: true, message: formatMessage({ id: 'component.ssl.fieldKeyInvalid' }) },
            ]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item>
            <Button style={{ marginRight: 10 }}>
              {formatMessage({ id: 'component.global.cancel' })}
            </Button>

            <Button htmlType="submit" type="primary">
              {mode === 'CREATE'
                ? formatMessage({ id: 'component.global.create' })
                : formatMessage({ id: 'component.global.save' })}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
};

export default Detail;
