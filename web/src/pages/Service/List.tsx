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
import React, { useRef } from 'react';
import { history, useIntl } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { fetchList } from './service';

const Page: React.FC = () => {
  const ref = useRef<ActionType>();
  const { formatMessage } = useIntl();

  const columns: ProColumns<ServiceModule.ResponseBody>[] = [
    {
      title: formatMessage({ id: 'component.global.name' }),
      dataIndex: 'name',
    },
    {
      title: formatMessage({ id: 'page.route.service.desc' }),
    }
  ];

  return (<PageHeaderWrapper
    title={`${formatMessage({ id: 'menu.service' })} ${formatMessage({
      id: 'component.global.list',
    })}`}
  >
    <ProTable<ServiceModule.ResponseBody>
      actionRef={ref}
      rowKey="id"
      columns={columns}
      request={fetchList}
      toolBarRender={() => [
        <Button type="primary" onClick={() => history.push(`/service/create`)}>
          <PlusOutlined />
          {formatMessage({ id: 'component.global.create' })}
        </Button>,
      ]} />
  </PageHeaderWrapper>)
}

export default Page;
