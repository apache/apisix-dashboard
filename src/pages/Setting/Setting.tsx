import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Input, Row, Col, notification } from 'antd';
import { useIntl } from 'umi';

import { setBaseURL, getBaseURL } from '@/helpers';
import ActionBar from '@/components/ActionBar';
import { getGrafanaURL } from '@/pages/Metrics/service';

import { updateMonitorURL } from './service';

const Setting: React.FC = () => {
  const [form] = Form.useForm();

  const isSuperAdmin = true;
  const isWorkspace = false;
  const canFetchGrafana = (isSuperAdmin && !isWorkspace) || isWorkspace;

  const { formatMessage } = useIntl();

  useEffect(() => {
    form.setFieldsValue({
      baseURL: getBaseURL(),
    });

    if (!canFetchGrafana) {
      return;
    }
    getGrafanaURL().then((url) => {
      form.setFieldsValue({
        grafanaURL: url,
      });
    });
  }, [canFetchGrafana]);

  const onSubmit = () => {
    const { grafanaURL, baseURL } = form.getFieldsValue();
    Promise.all([
      new Promise((resolve) => {
        if (canFetchGrafana) {
          updateMonitorURL(grafanaURL).then(resolve);
        }
        resolve();
      }),
      new Promise((resolve) => {
        if (!isWorkspace) {
          setBaseURL(baseURL);
        }
        resolve();
      }),
    ]).then(() => {
      notification.success({ message: formatMessage({ id: 'setting.update.configuration.successfully' }) });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  };

  return (
    <>
      <PageContainer title={formatMessage({ id: 'set' })}>
        <Card>
          <Row>
            <Col span={10}>
              <Form form={form} labelCol={{ span: 7 }}>
                {!isWorkspace && (
                  <Form.Item label={formatMessage({ id: 'setting.api.address' })} name="baseURL">
                    <Input />
                  </Form.Item>
                )}
                {canFetchGrafana && (
                  <Form.Item
                    label={formatMessage({ id: 'setting.grafana.address' })}
                    name="grafanaURL"
                    extra={formatMessage({ id: 'setting.grafana.address.rule' })}
                    rules={[{ pattern: new RegExp(/^https?:\/\//), message: formatMessage({ id: 'setting.grafana.address.illegality' }) }]}
                  >
                    <Input />
                  </Form.Item>
                )}
              </Form>
            </Col>
          </Row>
        </Card>
      </PageContainer>
      <ActionBar step={1} lastStep={1} onChange={onSubmit} />
    </>
  );
};

export default Setting;
