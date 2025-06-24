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
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getStreamRouteListQueryOptions, useStreamRouteList } from '@/apis/hooks';
import type { WithServiceIdFilter } from '@/apis/routes';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { StreamRoutesErrorComponent } from '@/components/page-slice/stream_routes/ErrorComponent';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_STREAM_ROUTES } from '@/config/constant';
import { queryClient } from '@/config/global';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import type { ListPageKeys } from '@/utils/useTablePagination';

export type StreamRouteListProps = {
  routeKey: Extract<
    ListPageKeys,
    '/stream_routes/' | '/services/detail/$id/stream_routes/'
  >;
  ToDetailBtn: (props: {
    record: APISIXType['RespStreamRouteItem'];
  }) => React.ReactNode;
  defaultParams?: Partial<WithServiceIdFilter>;
};

export const StreamRouteList = (props: StreamRouteListProps) => {
  const { routeKey, ToDetailBtn, defaultParams } = props;
  const { data, isLoading, refetch, pagination } = useStreamRouteList(
    routeKey,
    defaultParams
  );
  const { t } = useTranslation();

  const columns = useMemo<
    ProColumns<APISIXType['RespStreamRouteItem']>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'server_addr'],
        title: t('form.streamRoutes.serverAddr'),
        key: 'server_addr',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'server_port'],
        title: t('form.streamRoutes.serverPort'),
        key: 'server_port',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'desc'],
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [
          <ToDetailBtn key="detail" record={record} />,
          <DeleteResourceBtn
            key="delete"
            name={t('streamRoutes.singular')}
            target={record.value.id}
            api={`${API_STREAM_ROUTES}/${record.value.id}`}
            onSuccess={refetch}
          />,
        ],
      },
    ];
  }, [t, ToDetailBtn, refetch]);

  return (
    <AntdConfigProvider>
      <ProTable
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={isLoading}
        search={false}
        options={false}
        pagination={pagination}
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
                    label={t('info.add.title', {
                      name: t('streamRoutes.singular'),
                    })}
                    to={`${routeKey}add`}
                  />
                ),
              },
            ],
          },
        }}
      />
    </AntdConfigProvider>
  );
};

function StreamRouteComponent() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t('sources.streamRoutes')} />
      <StreamRouteList
        routeKey="/stream_routes/"
        ToDetailBtn={({ record }) => (
          <ToDetailPageBtn
            key="detail"
            to="/stream_routes/detail/$id"
            params={{ id: record.value.id }}
          />
        )}
      />
    </>
  );
}

export const Route = createFileRoute('/stream_routes/')({
  component: StreamRouteComponent,
  errorComponent: StreamRoutesErrorComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getStreamRouteListQueryOptions(deps)),
});
