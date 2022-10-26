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
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';

import PluginPage from '@/components/Plugin';

import { createOrUpdate, fetchList } from './service';

const PluginMarket: React.FC = () => {
  const [initialData, setInitialData] = useState({});

  const initPageData = () => {
    fetchList().then(({ data }) => {
      const plugins: any = {};
      data.forEach(({ name, value }) => {
        plugins[name] = value;
      });
      setInitialData(plugins);
    });
  };

  useEffect(() => {
    initPageData();
  }, []);

  const { formatMessage } = useIntl();

  return (
    <PageHeaderWrapper title={formatMessage({ id: 'page.plugin.market.config' })}>
      <Card bordered={false}>
        <PluginPage
          initialData={initialData}
          type="global"
          schemaType="route"
          onChange={(pluginsData, pluginId, handleType) => {
            createOrUpdate({
              plugins: pluginsData,
            }).then(() => {
              initPageData();
              notification.success({
                message: formatMessage({
                  id: `page.plugin.${handleType}`,
                }),
              });
            });
          }}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default PluginMarket;
