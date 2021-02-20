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
import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Empty, Button, Card, Tooltip } from 'antd';
import { history, useIntl } from 'umi';

import { getGrafanaURL } from './service';
import { QuestionCircleOutlined } from '@ant-design/icons';

const Metrics: React.FC = () => {
  const [grafanaURL, setGrafanaURL] = useState<string | undefined>();
  const { formatMessage } = useIntl();

  useEffect(() => {
    getGrafanaURL().then((url) => {
      setGrafanaURL(url);
    });
  }, []);

  return (
    <PageHeaderWrapper
      title={
        <>
          {formatMessage({ id: 'menu.metrics' })}&nbsp;
          <Tooltip title={formatMessage({ id: 'page.metrics.tip' })}>
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      }
    >
      <Card>
        {!grafanaURL && (
          <Empty
            image="empty.svg"
            imageStyle={{
              height: 60,
            }}
            description={
              <span>
                {formatMessage({ id: 'page.metrics.empty.description.grafanaNotConfig' })}
              </span>
            }
          >
            <Button
              type="primary"
              onClick={() => {
                history.replace({
                  pathname: '/settings',
                });
              }}
            >
              {formatMessage({ id: 'page.metrics.button.grafanaConfig' })}
            </Button>
          </Empty>
        )}
        {grafanaURL && (
          <div>
            <iframe title="metrics" src={grafanaURL} width="100%" height="860" frameBorder="0" />
          </div>
        )}
      </Card>
    </PageHeaderWrapper>
  );
};

export default Metrics;
