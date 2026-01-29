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
import { Badge, CloseButton, Group, TextInput } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRouteList } from '@/apis/hooks';
import type { WithServiceIdFilter } from '@/apis/routes';
import { ToAddPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { useTableSearch } from '@/hooks/useTableSearch';
import type { APISIXType } from '@/types/schema/apisix';
import type { ListPageKeys } from '@/utils/useTablePagination';
import IconSearch from '~icons/material-symbols/search';

export type RouteListProps = {
  routeKey: Extract<ListPageKeys, '/routes/' | '/services/detail/$id/routes/'>;
  defaultParams?: Partial<WithServiceIdFilter>;
  ActionMenu: (props: {
    record: APISIXType['RespRouteItem'];
    refetch: () => void;
  }) => React.ReactNode;
  AddButton?: React.ReactNode;
};

export const RouteList = (props: RouteListProps) => {
  const { routeKey, ActionMenu, defaultParams, AddButton } = props;
  const { data, isLoading, refetch, pagination, setParams } = useRouteList(
    routeKey,
    defaultParams
  );
  const { t } = useTranslation();
  const { searchValue, handleChange, handleClear } = useTableSearch(setParams);

  const columns = useMemo<ProColumns<APISIXType['RespRouteItem']>[]>(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'name'],
        title: t('form.basic.name'),
        key: 'name',
        valueType: 'text',
        ellipsis: true,
      },
      {
        dataIndex: ['value', 'uri'],
        title: 'URI',
        key: 'uri',
        valueType: 'text',
        ellipsis: true,
      },
      {
        dataIndex: ['value', 'methods'],
        title: t('table.methods'),
        key: 'methods',
        render: (_, record) => {
          const methods = record.value.methods;
          if (!methods || methods.length === 0) {
            return <Badge size="xs" color="gray">*</Badge>;
          }
          return (
            <Group gap={4}>
              {methods.slice(0, 3).map((m) => (
                <Badge key={m} size="xs">{m}</Badge>
              ))}
              {methods.length > 3 && (
                <Badge size="xs" color="gray">+{methods.length - 3}</Badge>
              )}
            </Group>
          );
        },
      },
      {
        dataIndex: ['value', 'hosts'],
        title: t('table.hosts'),
        key: 'hosts',
        render: (_, record) => {
          const hosts = record.value.hosts;
          if (!hosts || hosts.length === 0) return '-';
          if (hosts.length === 1) return hosts[0];
          return `${hosts[0]} +${hosts.length - 1}`;
        },
      },
      {
        dataIndex: ['value', 'status'],
        title: t('form.basic.status'),
        key: 'status',
        valueEnum: {
          1: { text: t('table.enabled'), status: 'Success' },
          0: { text: t('table.disabled'), status: 'Error' },
        },
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
                  <ToAddPageBtn
                    key="add"
                    label={t('info.add.title', {
                      name: t('routes.singular'),
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
