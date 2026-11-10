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
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Button, Empty, Input } from 'antd';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions, useRouteList } from '@/apis/hooks';
import { getRouteListReq, type WithServiceIdFilter } from '@/apis/routes';
import { CopyableId } from '@/components/page/CopyableId';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import { ListEmptyState } from '@/components/page/ListEmptyState';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_ROUTES, PAGE_SIZE_MIN } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import type { ListPageKeys } from '@/utils/useTablePagination';
import IconSearch from '~icons/tabler/search';

export type RouteListProps = {
  routeKey: Extract<ListPageKeys, '/routes/' | '/services/detail/$id/routes/'>;
  defaultParams?: Partial<WithServiceIdFilter>;
  ToDetailBtn: (props: {
    record: APISIXType['RespRouteItem'];
  }) => React.ReactNode;
};

export const RouteList = (props: RouteListProps) => {
  const { routeKey, ToDetailBtn, defaultParams } = props;
  const { data, isLoading, refetch, pagination, params } = useRouteList(
    routeKey,
    defaultParams
  );
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchPageSize, setSearchPageSize] = useState<number>();
  const term = keyword.trim().toLowerCase();
  const filters: Partial<WithServiceIdFilter> = { ...params, ...defaultParams };
  delete filters.page;
  delete filters.page_size;
  const search = useQuery({
    queryKey: ['routes', 'search', filters],
    queryFn: async ({ signal }) => {
      const { list } = await getRouteListReq(req, filters, signal);
      // Unpaginated Admin API responses do not apply the paginated sort order.
      return (list ?? []).sort((a, b) => a.createdIndex - b.createdIndex);
    },
    enabled: Boolean(term),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
  const disabled = t('table.disabled');
  const enabled = t('table.enabled');
  const matches = useMemo(() => {
    if (!term || search.isError) return [];
    return (search.data ?? []).filter(({ value: route }) => {
      const fields = [
        route.name,
        route.uri,
        ...(route.uris ?? []),
        route.host,
        ...(route.hosts ?? []),
        route.desc,
        ...Object.keys(route.plugins ?? {}),
        ...Object.entries(route.labels ?? {}).map(([key, value]) => `${key}=${value}`),
        route.status === 0 ? disabled : enabled,
      ];
      return fields.some((field) => field?.toLowerCase().includes(term));
    });
  }, [term, search.data, search.isError, disabled, enabled]);
  const pageSize = searchPageSize ?? pagination.pageSize ?? PAGE_SIZE_MIN;
  const lastPage = Math.max(1, Math.ceil(matches.length / pageSize));

  let emptyText: ReactNode = <ListEmptyState resource="routes" />;
  if (term) {
    emptyText = search.isPending ? null : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t(search.isError ? 'routes.searchFailed' : 'routes.noMatches')}
      >
        {search.isError && (
          <Button onClick={() => void search.refetch()}>{t('error.retry')}</Button>
        )}
      </Empty>
    );
  }

  const columns = useMemo<ProColumns<APISIXType['RespRouteItem']>[]>(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
        render: (_, record) => <CopyableId value={record.value.id} />,
      },
      {
        dataIndex: ['value', 'name'],
        title: t('form.basic.name'),
        key: 'name',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'desc'],
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'uri'],
        title: 'URI',
        key: 'uri',
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
            name={t('routes.singular')}
            target={record.value.id}
            api={`${API_ROUTES}/${record.value.id}`}
            onSuccess={refetch}
          />,
        ],
      },
    ];
  }, [t, ToDetailBtn, refetch]);

  return (
    <AntdConfigProvider>
      <ProTable
        locale={{ emptyText }}
        columns={columns}
        dataSource={term ? matches : data.list}
        rowKey={(record) => record.value.id}
        loading={term ? search.isFetching : isLoading}
        search={false}
        options={false}
        pagination={term ? {
          ...pagination,
          current: Math.min(searchPage, lastPage),
          pageSize,
          total: matches.length,
          onChange: (page, size) => {
            setSearchPage(page);
            setSearchPageSize(size);
          },
        } : pagination}
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolbar={{
          actions: [
            <Input
              key="search"
              type="search"
              aria-label={t('routes.search')}
              placeholder={t('routes.search')}
              prefix={<IconSearch />}
              value={keyword}
              allowClear
              style={{ width: 'min(340px, 48vw)' }}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSearchPage(1);
              }}
            />,
          ],
          menu: {
            type: 'inline',
            items: [
              {
                key: 'add',
                label: (
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

function RouteComponent() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('sources.routes')} />
      <RouteList
        routeKey="/routes/"
        ToDetailBtn={({ record }) => (
          <ToDetailPageBtn
            key="detail"
            to="/routes/detail/$id"
            params={{ id: record.value.id }}
          />
        )}
      />
    </>
  );
}

export const Route = createFileRoute('/routes/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getRouteListQueryOptions(deps)),
});
