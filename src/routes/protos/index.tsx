import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { APISIXType } from '@/types/schema/apisix';
import { API_PROTOS } from '@/config/constant';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import PageHeader from '@/components/page/PageHeader';
import { RouteLinkBtn } from '@/components/Btn';
import { ToAddPageBtn } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { usePagination } from '@/utils/usePagination';
import {
  pageSearchSchema,
  type PageSearchType,
} from '@/types/schema/pageSearch';

const genProtosQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['protos', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, APISIXType['RespProtoList']>(API_PROTOS, {
          params: {
            page,
            page_size: pageSize,
          },
        })
        .then((v) => v.data),
  });
};

type DetailPageBtnProps = {
  record: APISIXType['RespProtoItem'];
};
const DetailPageBtn = (props: DetailPageBtnProps) => {
  const { record } = props;
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <RouteLinkBtn
      size="xs"
      variant="transparent"
      to={router.routesById['/protos/detail/$id'].to}
      params={{ id: record.value.id }}
    >
      {t('view')}
    </RouteLinkBtn>
  );
};

function RouteComponent() {
  const { t } = useTranslation();

  // Use the pagination hook
  const { pagination, handlePageChange, updateTotal } = usePagination({
    queryKey: 'protos',
  });

  const protosQuery = useSuspenseQuery(genProtosQueryOptions(pagination));
  const { data, isLoading } = protosQuery;

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<APISIXType['RespProtoList']['data']['list'][number]>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        title: t('actions'),
        valueType: 'option',
        key: 'option',
        width: 120,
        render: (_, record) => [<DetailPageBtn key="detail" record={record} />],
      },
    ];
  }, [t]);

  return (
    <>
      <PageHeader title={t('protos.title')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data?.list || []}
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
                      to="/protos/add"
                      label={t('protos.add.title')}
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

export const Route = createFileRoute('/protos/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(genProtosQueryOptions(deps)),
});
