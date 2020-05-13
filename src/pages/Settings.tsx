import React, { useEffect } from 'react';
import { useForm } from 'antd/es/form/util';
import { Button, Card, Form, Input, notification, Select } from 'antd';
import { useIntl, FormattedMessage, history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getAdminAPIConfig } from '@/utils/setting';

const { Option } = Select;

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 8,
  },
};

const tailLayout = {
  wrapperCol: {
    offset: 4,
  },
};

const Settings: React.FC = () => {
  const [form] = useForm();
  const { formatMessage } = useIntl();

  useEffect(() => {
    const adminAPIConfig = getAdminAPIConfig();
    form.setFieldsValue({
      adminAPISchema: adminAPIConfig.schema,
      adminAPIHost: adminAPIConfig.host,
      adminAPIPath: adminAPIConfig.path,
      adminAPIKey: adminAPIConfig.key,
    });
  });

  const onFinish = (values: any) => {
    localStorage.setItem('GLOBAL_ADMIN_API_SCHEMA', values.adminAPISchema);
    localStorage.setItem('GLOBAL_ADMIN_API_HOST', values.adminAPIHost);
    localStorage.setItem('GLOBAL_ADMIN_API_PATH', values.adminAPIPath);
    localStorage.setItem('GLOBAL_ADMIN_API_KEY', values.adminAPIKey);

    notification.success({
      message: `${formatMessage({ id: 'component.global.update' })} Admin API ${formatMessage({
        id: 'component.status.success',
      }).toLowerCase()}`,
    });
  };

  return (
    <PageHeaderWrapper>
      <Card>
        <Form {...layout} form={form} onFinish={onFinish}>
          <Form.Item
            label={formatMessage({ id: 'app.settings.item.admin-api-schema' })}
            name="adminAPISchema"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'app.settings.description.invalid-admin-api-schema' }),
              },
            ]}
          >
            <Select defaultValue="http">
              <Option value="http">HTTP</Option>
              <Option value="https">HTTPS</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={formatMessage({ id: 'app.settings.item.admin-api-host' })}
            name="adminAPIHost"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'app.settings.description.invalid-admin-api-host' }),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={formatMessage({ id: 'app.settings.item.admin-api-path' })}
            name="adminAPIPath"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'app.settings.description.invalid-admin-api-path' }),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={formatMessage({ id: 'app.settings.item.admin-api-key' })}
            name="adminAPIKey"
          >
            <Input />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button style={{ marginRight: 10 }} onClick={() => history.goBack()}>
              <FormattedMessage id="component.global.cancel" />
            </Button>

            <Button htmlType="submit" type="primary">
              <FormattedMessage id="component.global.save" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
};

export default Settings;
