import { Button, Form, Input, notification, Select, Tabs, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { Link, SelectLang, FormattedMessage, useIntl } from 'umi';
import logo from '@/assets/logo.svg';
import { useForm } from 'antd/es/form/util';
import styles from './style.less';
import { getAdminAPIConfig, getGrafanaConfig } from './service';

const { Option } = Select;
const { TabPane } = Tabs;

const Settings: React.FC<{}> = () => {
  const [form] = useForm();
  const { formatMessage } = useIntl();

  useEffect(() => {
    form.setFieldsValue({ ...getAdminAPIConfig(), ...getGrafanaConfig() });
  }, []);

  const onFinish = ({
    schema,
    host,
    path,
    key,
    grafanaURL,
  }: Setting.AdminAPI & Setting.GrafanaConfig) => {
    if (grafanaURL.length !== 0) {
      if (!grafanaURL.startsWith('http') || !grafanaURL.startsWith('https')) {
        notification.error({
          duration: 3,
          message: 'Grafana 地址需以 http 或 https 开头',
        });
        return;
      }
    }

    localStorage.setItem('GLOBAL_ADMIN_API_SCHEMA', schema);
    localStorage.setItem('GLOBAL_ADMIN_API_HOST', host);
    localStorage.setItem('GLOBAL_ADMIN_API_PATH', path);
    localStorage.setItem('GLOBAL_ADMIN_API_KEY', key);
    localStorage.setItem('GLOBAL_ADMIN_SETTING_GRAFANA_URL', grafanaURL);

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
            <TabPane key="TabContent" tab={formatMessage({ id: 'app.settings.admin-api' })}>
              <Form
                form={form}
                onFinish={(values) => onFinish(values as Setting.AdminAPI & Setting.GrafanaConfig)}
              >
                <Form.Item
                  name="schema"
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
                  name="host"
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
                  name="path"
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

                <Form.Item name="key">
                  <Input placeholder={formatMessage({ id: 'app.settings.item.admin-api-key' })} />
                </Form.Item>

                <Form.Item>
                  <Form.Item name="grafanaURL" noStyle>
                    <Input
                      placeholder={formatMessage({ id: 'app.settings.item.admin-api-grafana' })}
                    />
                  </Form.Item>
                  <Tooltip title="从哪里可以获取 Grafana 地址？">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://github.com/apache/incubator-apisix/blob/master/doc/plugins/prometheus-cn.md"
                      style={{ margin: '8px 8px' }}
                    >
                      帮助
                    </a>
                  </Tooltip>
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
