import { Button, Form, Input, notification, Select, Tabs } from 'antd';
import React, { useEffect } from 'react';
import { Link, SelectLang, FormattedMessage, useIntl } from 'umi';
import logo from '@/assets/logo.svg';
import styles from './style.less';
import { useForm } from 'antd/es/form/util';
import { getAdminAPIConfig } from './service';

const { Option } = Select;
const { TabPane } = Tabs;

const Settings: React.FC<{}> = () => {
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
  }, []);

  const onFinish = (values: any) => {
    localStorage.setItem('GLOBAL_ADMIN_API_SCHEMA', values.adminAPISchema);
    localStorage.setItem('GLOBAL_ADMIN_API_HOST', values.adminAPIHost);
    localStorage.setItem('GLOBAL_ADMIN_API_PATH', values.adminAPIPath);
    localStorage.setItem('GLOBAL_ADMIN_API_KEY', values.adminAPIKey);

    notification.success({
      duration: 1,
      message: `${formatMessage({ id: 'component.global.update' })} Admin API ${formatMessage({
        id: 'component.status.success',
      }).toLowerCase()}`,
      onClose: () => {
        document.location.href = '/';
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <SelectLang />
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>APISIX Dashboard</span>
            </Link>
          </div>
          <div className={styles.desc}>Cloud-Native Microservices API Gateway</div>
        </div>

        <div className={styles.main}>
          <Tabs>
            <TabPane tab={formatMessage({ id: 'app.settings.admin-api' })}>
              <Form form={form} onFinish={onFinish}>
                <Form.Item
                  name="adminAPISchema"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'app.settings.description.invalid-admin-api-schema',
                      }),
                    },
                  ]}
                >
                  <Select
                    placeholder={formatMessage({ id: 'app.settings.item.admin-api-schema' })}
                    allowClear
                  >
                    <Option value="http">HTTP</Option>
                    <Option value="https">HTTPS</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="adminAPIHost"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'app.settings.description.invalid-admin-api-host',
                      }),
                    },
                  ]}
                >
                  <Input placeholder={formatMessage({ id: 'app.settings.item.admin-api-host' })} />
                </Form.Item>

                <Form.Item
                  name="adminAPIPath"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'app.settings.description.invalid-admin-api-path',
                      }),
                    },
                  ]}
                >
                  <Input placeholder={formatMessage({ id: 'app.settings.item.admin-api-path' })} />
                </Form.Item>

                <Form.Item name="adminAPIKey">
                  <Input placeholder={formatMessage({ id: 'app.settings.item.admin-api-key' })} />
                </Form.Item>

                <Form.Item>
                  <Button size="large" type="primary" htmlType="submit" block>
                    <FormattedMessage id="component.global.save" />
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
