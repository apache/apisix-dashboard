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
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions, getRouteQueryOptions, useRouteList } from '@/apis/hooks';
import type { WithServiceIdFilter } from '@/apis/routes';
import { putRouteReq } from '@/apis/routes';
import { FormPartRoute } from '@/components/form-slice/FormPartRoute';
import { RoutePutSchema, type RoutePutType } from '@/components/form-slice/FormPartRoute/schema';
import { produceRoute, produceVarsToForm } from '@/components/form-slice/FormPartRoute/util';
import { produceToUpstreamForm } from '@/components/form-slice/FormPartUpstream/util';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageBtn, ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_ROUTES } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import type { ListPageKeys } from '@/utils/useTablePagination';

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
  const { data, isLoading, refetch, pagination } = useRouteList(
    routeKey,
    defaultParams
  );
  const { t } = useTranslation();

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
        width: 60,
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
        options={false}
        pagination={pagination}
        cardProps={{ bodyStyle: { padding: 0 } }}
        toolbar={{
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

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): RoutePutType => {
  const upstreamProduced = produceToUpstreamForm(
    (data.upstream as Record<string, unknown>) || {},
    data
  );
  return produceVarsToForm(upstreamProduced);
};

// Transform form values to API data
const toApiData = (formData: RoutePutType): APISIXType['Route'] => {
  return produceRoute(formData) as APISIXType['Route'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const handleFormEdit = (routeId: string) => {
    setSelectedRouteId(routeId);
    openFormDrawer();
  };

  const handleJsonEdit = (routeId: string) => {
    setSelectedRouteId(routeId);
    openJsonDrawer();
  };

  return (
    <>
      <PageHeader title={t('sources.routes')} />
      <RouteList
        routeKey="/routes/"
        ActionMenu={({ record, refetch }) => (
          <TableActionMenu
            resourceName={t('routes.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_ROUTES}/${record.value.id}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.id)}
            onJsonEdit={() => handleJsonEdit(record.value.id)}
          />
        )}
        AddButton={
          <ToAddPageDropdown
            to="/routes/add"
            label={t('info.add.title', { name: t('routes.singular') })}
          />
        }
      />

      {selectedRouteId && (
        <>
          <FormEditDrawer<RoutePutType, APISIXType['Route']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('routes.singular')}
            queryOptions={getRouteQueryOptions(selectedRouteId)}
            schema={RoutePutSchema}
            toFormValues={toFormValues}
            toApiData={toApiData}
            onSave={(data) => putRouteReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['routes'] })}
          >
            <FormSectionGeneral />
            <FormPartRoute />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('routes.singular')}
            queryOptions={getRouteQueryOptions(selectedRouteId)}
            onSave={(data) => putRouteReq(req, data as APISIXType['Route'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['routes'] })}
          />
        </>
      )}
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
