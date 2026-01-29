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
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getUpstreamListQueryOptions, getUpstreamQueryOptions, useUpstreamList } from '@/apis/hooks';
import { putUpstreamReq } from '@/apis/upstreams';
import { FormPartUpstream } from '@/components/form-slice/FormPartUpstream';
import { produceToUpstreamForm } from '@/components/form-slice/FormPartUpstream/util';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_UPSTREAMS } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['Upstream'] => {
  return produceToUpstreamForm(data as Partial<APISIXType['Upstream']>) as APISIXType['Upstream'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['Upstream']): APISIXType['Upstream'] => {
  return pipeProduce()(formData) as APISIXType['Upstream'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination } = useUpstreamList();
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleFormEdit = useCallback((id: string) => {
    setSelectedId(id);
    openFormDrawer();
  }, [openFormDrawer]);

  const handleJsonEdit = useCallback((id: string) => {
    setSelectedId(id);
    openJsonDrawer();
  }, [openJsonDrawer]);

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
        dataIndex: ['value', 'scheme'],
        title: t('form.upstreams.scheme'),
        key: 'scheme',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('form.upstreams.updateTime'),
        key: 'update_time',
        valueType: 'dateTime',
        renderText: (text) => {
          if (!text) return '-';
          return new Date(Number(text) * 1000).toISOString();
        },
      },
      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 60,
        render: (_, record) => (
          <TableActionMenu
            resourceName={t('upstreams.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_UPSTREAMS}/${record.value.id}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.id)}
            onJsonEdit={() => handleJsonEdit(record.value.id)}
          />
        ),
      },
    ];
  }, [t, refetch, handleFormEdit, handleJsonEdit]);

  return (
    <>
      <PageHeader title={t('sources.upstreams')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data?.list}
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
                    <ToAddPageDropdown
                      to="/upstreams/add"
                      label={t('info.add.title', {
                        name: t('upstreams.singular'),
                      })}
                    />
                  ),
                },
              ],
            },
          }}
        />
      </AntdConfigProvider>

      {selectedId && (
        <>
          <FormEditDrawer<APISIXType['Upstream'], APISIXType['Upstream']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('upstreams.singular')}
            queryOptions={getUpstreamQueryOptions(selectedId)}
            schema={APISIX.Upstream}
            toFormValues={toFormValues}
            toApiData={toApiData}
            onSave={(data) => putUpstreamReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['upstreams'] })}
          >
            <FormSectionGeneral />
            <FormPartUpstream />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('upstreams.singular')}
            queryOptions={getUpstreamQueryOptions(selectedId)}
            onSave={(data) => putUpstreamReq(req, data as APISIXType['Upstream'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['upstreams'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/upstreams/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getUpstreamListQueryOptions(deps)),
});
