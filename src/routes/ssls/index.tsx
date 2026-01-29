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

import { getSSLListQueryOptions, getSSLQueryOptions, useSSLList } from '@/apis/hooks';
import { putSSLReq } from '@/apis/ssls';
import { FormPartSSL } from '@/components/form-slice/FormPartSSL';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_SSLS } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['SSL'] => {
  return data as APISIXType['SSL'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['SSL']): APISIXType['SSL'] => {
  return pipeProduce()(formData) as APISIXType['SSL'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination } = useSSLList();
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

  const columns = useMemo<ProColumns<APISIXType['RespSSLItem']>[]>(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'sni'],
        title: 'SNI',
        key: 'sni',
        valueType: 'text',
        render: (_, record) => {
          // Show sni if available, otherwise show the first snis entry
          const sni = record.value.sni;
          const snis = record.value.snis;
          if (sni) return sni;
          if (snis && snis.length > 0) return snis.join(', ');
          return '-';
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
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 60,
        render: (_, record) => (
          <TableActionMenu
            resourceName={t('ssls.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_SSLS}/${record.value.id}`}
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
      <PageHeader title={t('sources.ssls')} />
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
                      to="/ssls/add"
                      label={t('info.add.title', { name: t('ssls.singular') })}
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
          <FormEditDrawer<APISIXType['SSL'], APISIXType['SSL']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('ssls.singular')}
            queryOptions={getSSLQueryOptions(selectedId)}
            schema={APISIX.SSL}
            toFormValues={toFormValues}
            toApiData={toApiData}
            onSave={(data) => putSSLReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['ssls'] })}
          >
            <FormSectionGeneral />
            <FormPartSSL />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('ssls.singular')}
            queryOptions={getSSLQueryOptions(selectedId)}
            onSave={(data) => putSSLReq(req, data as APISIXType['SSL'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['ssls'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/ssls/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getSSLListQueryOptions(deps)),
});
