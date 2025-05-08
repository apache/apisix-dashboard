/**
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
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getCredentialListQueryOptions } from '@/apis/credentials';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_CREDENTIALS } from '@/config/constant';
import { queryClient } from '@/config/global';
import type { APISIXType } from '@/types/schema/apisix';

function CredentialsList() {
  const { t } = useTranslation();
  const { username } = useParams({
    from: '/consumers/detail/$username/credentials/',
  });

  const credentialsQuery = useSuspenseQuery(
    getCredentialListQueryOptions({ username })
  );
  const { data, isLoading, refetch } = credentialsQuery;

  const columns = useMemo<
    ProColumns<APISIXType['RespCredentialItem']>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'desc'],
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('form.info.update_time'),
        key: 'update_time',
        valueType: 'dateTime',
        sorter: true,
        renderText: (text) => {
          if (!text) return '-';
          return new Date(Number(text) * 1000).toISOString();
        },
      },
      {
        title: t('actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailPageBtn
            key="detail"
            to="/consumers/detail/$username/credentials/detail/$id"
            params={{
              username: username as string,
              id: record.value.id,
            }}
          />,
          <DeleteResourceBtn
            key="delete"
            name={t('consumers.credentials.singular')}
            target={record.value.id}
            api={`${API_CREDENTIALS(username)}/${record.value.id}`}
            onSuccess={refetch}
          />,
        ],
      },
    ];
  }, [refetch, t, username]);

  return (
    <AntdConfigProvider>
      <ProTable
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={isLoading}
        search={false}
        options={false}
        pagination={false}
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolbar={{
          menu: {
            type: 'inline',
            items: [
              {
                key: 'add',
                label: (
                  <ToAddPageBtn
                    key="add"
                    to="/consumers/detail/$username/credentials/add"
                    params={{ username }}
                    label={t('consumers.credentials.add.title')}
                  />
                ),
              },
            ],
          },
        }}
      />
    </AntdConfigProvider>
  );
}

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <DetailCredentialsTabs />
      <PageHeader title={t('consumers.credentials.title')} />
      <CredentialsList />
    </>
  );
}

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/'
)({
  component: RouteComponent,
  loader: ({ params }) =>
    queryClient.ensureQueryData(getCredentialListQueryOptions(params)),
});
