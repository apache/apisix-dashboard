import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useParams } from 'dva';
import { Form, Input, Card, Button, notification, message } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

import { getPageMode } from '@/utils/utils';
import {
  fetchItem as fetchSSLItem,
  create as createSSL,
  update as updateSSL,
} from '@/services/ssl';
import { useForm } from 'antd/es/form/util';
import { router } from 'umi';

const layout = {
  labelCol: {
    span: 2,
  },
  wrapperCol: {
    span: 8,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 2,
  },
};

const Detail: React.FC = () => {
  const [mode] = useState<PageMode>(getPageMode());
  const { key } = useParams();
  const [form] = useForm();

  useEffect(() => {
    const hideLoading = message.loading(formatMessage({ id: 'component.global.loading' }), 0);
    if (mode === 'EDIT' && key) {
      fetchSSLItem(key).then(data => {
        form.setFieldsValue(data.value);
        hideLoading();
      });
    } else {
      hideLoading();
    }
  }, [mode]);

  const onFinish = (values: any) => {
    const hideLoading = message.loading(formatMessage({ id: 'component.global.loading' }), 0);
    if (mode === 'EDIT' && key) {
      hideLoading();
      updateSSL(key, values).then(() => {
        notification.success({
          message: `${formatMessage({ id: 'component.global.update' })} SSL ${formatMessage({
            id: 'component.status.success',
          }).toLowerCase()}`,
        });

        router.goBack();
      });
    }

    if (mode === 'CREATE') {
      createSSL(values).then(() => {
        hideLoading();
        notification.success({
          message: `${formatMessage({ id: 'component.global.create' })} SSL ${formatMessage({
            id: 'component.status.success',
          }).toLowerCase()}`,
        });

        router.goBack();
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
              { min: 128, message: formatMessage({ id: 'component.ssl.fieldCertTooShort' }) },
            ]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item
            label="Key"
            name="key"
            rules={[
              { required: true, message: formatMessage({ id: 'component.ssl.fieldKeyInvalid' }) },
              { min: 128, message: formatMessage({ id: 'component.ssl.fieldKeyTooShort' }) },
            ]}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button style={{ marginRight: 10 }} onClick={() => router.goBack()}>
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
