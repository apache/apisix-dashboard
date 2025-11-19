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
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions, useRouteList } from '@/apis/hooks';
import type { WithServiceIdFilter } from '@/apis/routes';
import { getRouteListReq } from '@/apis/routes';
import { SearchForm, type SearchFormValues } from '@/components/form/SearchForm';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { ToAddPageBtn, ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_ROUTES, PAGE_SIZE_MAX } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema, type PageSearchType } from '@/types/schema/pageSearch';
import {
  filterRoutes,
  needsClientSideFiltering,
  paginateResults,
} from '@/utils/clientSideFilter';
import { useSearchParams } from '@/utils/useSearchParams';
import type { ListPageKeys } from '@/utils/useTablePagination';

export type RouteListProps = {
  routeKey: Extract<ListPageKeys, '/routes/' | '/services/detail/$id/routes/'>;
  defaultParams?: Partial<WithServiceIdFilter>;
  ToDetailBtn: (props: {
    record: APISIXType['RespRouteItem'];
  }) => React.ReactNode;
};

const RouteDetailButton = ({
  record,
}: {
  record: APISIXType['RespRouteItem'];
}) => (
  <ToDetailPageBtn
    key="detail"
    to="/routes/detail/$id"
    params={{ id: record.value.id }}
  />
);

const SEARCH_PARAM_KEYS: (keyof SearchFormValues)[] = [
  'name',
  'id',
  'host',
  'path',
  'description',
  'plugin',
  'labels',
  'version',
  'status',
];

const mapSearchParams = (values: Partial<SearchFormValues>) =>
  Object.fromEntries(SEARCH_PARAM_KEYS.map((key) => [key, values[key]])) as Partial<SearchFormValues>;

export const RouteList = (props: RouteListProps) => {
  const { routeKey, ToDetailBtn, defaultParams } = props;
  const { data, isLoading, refetch, pagination, setParams } = useRouteList(
    routeKey,
    defaultParams
  );
  const { params } = useSearchParams(routeKey);
  const { t } = useTranslation();

  // Fetch all data when client-side filtering is active
  const needsAllData = needsClientSideFiltering(params);
  const { data: allData, isLoading: isLoadingAllData } = useQuery({
    queryKey: ['routes-all', defaultParams, needsAllData],
    queryFn: () =>
      getRouteListReq(req, {
        page: 1,
        page_size: PAGE_SIZE_MAX,
        ...defaultParams,
      }),
    enabled: needsAllData,
  });

  const handleSearch = (values: SearchFormValues) => {
    // Send name filter to backend, keep others for client-side filtering
    setParams({
      page: 1,
      ...mapSearchParams(values),
    });
  };

  const handleReset = () => {
    setParams({
      page: 1,
      ...mapSearchParams({}),
    });
  };

  // Apply client-side filtering and pagination
  const { filteredData, totalCount } = useMemo(() => {
    // If client-side filtering is needed, use all data
    if (needsAllData && allData?.list) {
      const filtered = filterRoutes(allData.list, params);
      const paginated = paginateResults(
        filtered,
        (params as PageSearchType).page || 1,
        (params as PageSearchType).page_size || 10
      );
      return {
        filteredData: paginated.list,
        totalCount: paginated.total,
      };
    }
    
    // Otherwise, use paginated data from backend
    return {
      filteredData: data?.list || [],
      totalCount: data?.total || 0,
    };
  }, [needsAllData, allData, data, params]);

  const actualLoading = needsAllData ? isLoadingAllData : isLoading;

  // Update pagination to use filtered total
  const customPagination = useMemo(() => {
    return {
      ...pagination,
      total: totalCount,
    };
  }, [pagination, totalCount]);

  // Extract unique version values from route labels
  const versionOptions = useMemo(() => {
    const dataSource = needsAllData && allData?.list ? allData.list : data?.list || [];
    const versions = new Set<string>();
    
    dataSource.forEach((route) => {
      const versionLabel = route.value.labels?.version;
      if (versionLabel) {
        versions.add(versionLabel);
      }
    });
    
    return Array.from(versions)
      .sort()
      .map((version) => ({
        label: version,
        value: version,
      }));
  }, [needsAllData, allData, data]);

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
      <div style={{ marginBottom: 24 }}>
        <SearchForm
          onSearch={handleSearch}
          onReset={handleReset}
          versionOptions={versionOptions}
          initialValues={mapSearchParams(params)}
        />
      </div>
      <ProTable
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={actualLoading}
        search={false}
        options={false}
        pagination={customPagination}
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
      <RouteList routeKey="/routes/" ToDetailBtn={RouteDetailButton} />
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
