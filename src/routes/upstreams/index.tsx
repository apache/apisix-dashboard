import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { APISIXType } from '@/types/schema/apisix';
import { API_UPSTREAMS } from '@/config/constant';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import PageHeader from '@/components/page/PageHeader';
import { ToDetailPageBtn, ToAddPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { usePagination } from '@/utils/usePagination';
import {
  pageSearchSchema,
  type PageSearchType,
} from '@/types/schema/pageSearch';

const genUpstreamsQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['upstreams', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespUpstreamList']>(API_UPSTREAMS, {
          params: {
            page,
            page_size: pageSize,
          },
        })
        .then((v) => v.data),
  });
};

function RouteComponent() {
  const { t } = useTranslation();

  // Use the pagination hook
  const { pagination, handlePageChange, updateTotal } = usePagination({
    queryKey: 'upstreams',
  });

  const upstreamQuery = useSuspenseQuery(genUpstreamsQueryOptions(pagination));
  const { data, isLoading } = upstreamQuery;

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<APISIXType['RespUpstreamList']['data']['list'][number]>[]
  >(() => {
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
        dataIndex: ['value', 'labels'],
        title: t('form.basic.labels.title'),
        key: 'labels',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'scheme'],
        title: t('form.upstream.scheme'),
        key: 'scheme',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('form.upstream.updateTime'),
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
            to="/upstreams/detail/$id"
            params={{ id: record.value.id }}
          />,
        ],
      },
    ];
  }, [t]);

  return (
    <>
      <PageHeader title={t('upstreams.title')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data?.list}
          rowKey="id"
          loading={isLoading}
          search={false}
          options={false}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: handlePageChange,
          }}
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
                      to="/upstreams/add"
                      label={t('upstreams.add.title')}
                    />
                  ),
                },
              ],
            },
          }}
        />
      </AntdConfigProvider>
    </>
  );
}

export const Route = createFileRoute('/upstreams/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(genUpstreamsQueryOptions(deps)),
});
