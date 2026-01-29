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
import { Badge, CloseButton, TextInput } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStreamRouteList } from '@/apis/hooks';
import type { WithServiceIdFilter } from '@/apis/routes';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { useTableSearch } from '@/hooks/useTableSearch';
import type { APISIXType } from '@/types/schema/apisix';
import type { ListPageKeys } from '@/utils/useTablePagination';
import IconSearch from '~icons/material-symbols/search';

export type StreamRouteListProps = {
  routeKey: Extract<
    ListPageKeys,
    '/stream_routes/' | '/services/detail/$id/stream_routes/'
  >;
  ActionMenu: (props: {
    record: APISIXType['RespStreamRouteItem'];
    refetch: () => void;
  }) => React.ReactNode;
  defaultParams?: Partial<WithServiceIdFilter>;
  AddButton?: React.ReactNode;
};

export const StreamRouteList = (props: StreamRouteListProps) => {
  const { routeKey, ActionMenu, defaultParams, AddButton } = props;
  const { data, isLoading, refetch, pagination, setParams } = useStreamRouteList(
    routeKey,
    defaultParams
  );
  const { t } = useTranslation();
  const { searchValue, handleChange, handleClear } = useTableSearch(setParams);

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
        ellipsis: true,
      },
      {
        dataIndex: ['value', 'server_port'],
        title: t('form.streamRoutes.serverPort'),
        key: 'server_port',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'upstream_id'],
        title: t('form.upstreams.upstreamId'),
        key: 'upstream_id',
        render: (_, record) => {
          const upstreamId = record.value.upstream_id;
          const hasInlineUpstream = record.value.upstream && Object.keys(record.value.upstream).length > 0;
          if (upstreamId) return <Badge size="xs" variant="light">{upstreamId}</Badge>;
          if (hasInlineUpstream) return <Badge size="xs" color="gray">{t('form.upstreams.inline')}</Badge>;
          return '-';
        },
      },
      {
        dataIndex: ['value', 'sni'],
        title: t('form.streamRoutes.sni'),
        key: 'sni',
        valueType: 'text',
        ellipsis: true,
        render: (_, record) => record.value.sni || '-',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('table.updateTime'),
        key: 'update_time',
        valueType: 'dateTime',
        sorter: true,
        renderText: (text) => {
          if (!text) return '-';
          return new Date(Number(text) * 1000).toISOString();
        },
      },
      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 80,
        render: (_, record) => <ActionMenu record={record} refetch={refetch} />,
      },
    ];
  }, [t, ActionMenu, refetch]);

  return (
    <AntdConfigProvider>
      <ProTable
        columns={columns}
        dataSource={data.list}
        rowKey="id"
        loading={isLoading}
        search={false}
        options={{
          reload: () => refetch(),
          density: true,
          setting: true,
        }}
        pagination={pagination}
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolbar={{
          search: (
            <TextInput
              placeholder={t('form.search')}
              leftSection={<IconSearch />}
              rightSection={searchValue && <CloseButton size="sm" onClick={handleClear} />}
              value={searchValue}
              onChange={(e) => handleChange(e.target.value)}
              style={{ width: 250 }}
            />
          ),
          menu: {
            type: 'inline',
            items: [
              {
                key: 'add',
                label: AddButton ?? (
                  <ToAddPageDropdown
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
