import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Input, Row, Col, notification } from 'antd';

import { setBaseURL, getBaseURL } from '@/helpers';
import ActionBar from '@/components/ActionBar';
import { getGrafanaURL } from '@/pages/Metrics/service';

import { updateMonitorURL } from './service';

const Setting: React.FC = () => {
  const [form] = Form.useForm();

  const isSuperAdmin = true;
  const isWorkspace = false;
  const canFetchGrafana = (isSuperAdmin && !isWorkspace) || isWorkspace;

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
      notification.success({ message: '更新配置成功' });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  };

  return (
    <>
      <PageContainer title="设置">
        <Card>
          <Row>
            <Col span={10}>
              <Form form={form} labelCol={{ span: 7 }}>
                {!isWorkspace && (
                  <Form.Item label="API 地址" name="baseURL">
                    <Input />
                  </Form.Item>
                )}
                {canFetchGrafana && (
                  <Form.Item
                    label="Grafana 地址"
                    name="grafanaURL"
                    extra="Grafana 地址，需以 http 或 https 开头"
                    rules={[{ pattern: new RegExp(/^https?:\/\//), message: '非法的地址' }]}
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
