/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Input, Row, Col, notification } from 'antd';
import { useIntl } from 'umi';

import { getUrlQuery } from '@/helpers';
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
    form.validateFields().then((value) => {
      Promise.all([
        new Promise((resolve) => {
          if (canFetchGrafana) {
            updateMonitorURL(value.grafanaURL).then(resolve);
          }
          resolve();
        }),
      ]).then(() => {
        notification.success({
          message: formatMessage({
            id: 'page.setting.notification.update.configuration.successfully',
          }),
        });
        setTimeout(() => {
          const redirect = getUrlQuery('redirect');
          window.location.href = redirect ? decodeURIComponent(redirect) : '/';
        }, 500);
      });
    });
  };

  return (
    <>
      <PageContainer title={formatMessage({ id: 'page.setting.pageContainer.title' })}>
        <Card>
          <Row>
            <Col span={10}>
              <Form form={form} labelCol={{ span: 7 }}>
                {canFetchGrafana && (
                  <Form.Item
                    label={formatMessage({ id: 'page.setting.form.item.grafanaURL' })}
                    name="grafanaURL"
                    extra={formatMessage({
                      id: 'page.setting.form.item.grafanaURL.inputHelpMessage',
                    })}
                    rules={[
                      {
                        pattern: new RegExp(/^https?:\/\//),
                        message: formatMessage({
                          id: 'page.setting.form.item.grafanaURL.inputErrorMessage',
                        }),
                      },
                    ]}
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
