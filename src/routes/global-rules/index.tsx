import { req } from '@/config/req';
import { queryClient } from '@/config/global';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { A6Type } from '@/types/schema/apisix';
import { API_GLOBAL_RULES } from '@/config/constant';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import PageHeader from '@/components/page/PageHeader';
import { RouteLinkBtn } from '@/components/Btn';
import ToAddPageBtn from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { usePagination } from '@/utils/usePagination';
import {
  pageSearchSchema,
  type PageSearchType,
} from '@/types/schema/pageSearch';

const genGlobalRulesQueryOptions = (props: PageSearchType) => {
  const { page, pageSize } = props;
  return queryOptions({
    queryKey: ['global-rules', page, pageSize],
    queryFn: () =>
      req
        .get<unknown, A6Type['RespGlobalRuleList']>(API_GLOBAL_RULES, {
          params: {
            page,
            page_size: pageSize,
          },
        })
        .then((v) => v.data),
  });
};

type DetailPageBtnProps = {
  record: A6Type['RespGlobalRuleItem'];
};
const DetailPageBtn = (props: DetailPageBtnProps) => {
  const { record } = props;
  const { t } = useTranslation();
  return (
    <RouteLinkBtn
      size="xs"
      variant="transparent"
      to="/global-rules/detail/$id"
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
    queryKey: 'global-rules',
  });

  const globalRulesQuery = useSuspenseQuery(
    genGlobalRulesQueryOptions(pagination)
  );
  const { data, isLoading } = globalRulesQuery;

  useEffect(() => {
    if (data?.total) {
      updateTotal(data.total);
    }
  }, [data?.total, updateTotal]);

  const columns = useMemo<
    ProColumns<A6Type['RespGlobalRuleList']['data']['list'][number]>[]
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
      <PageHeader title={t('globalRules.title')} />
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
                      to="/global-rules/add"
                      label={t('globalRules.add.title')}
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

export const Route = createFileRoute('/global-rules/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(genGlobalRulesQueryOptions(deps)),
});
