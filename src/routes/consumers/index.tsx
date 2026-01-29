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

import { putConsumerReq } from '@/apis/consumers';
import { getConsumerListQueryOptions, getConsumerQueryOptions, useConsumerList } from '@/apis/hooks';
import { FormPartConsumer } from '@/components/form-slice/FormPartConsumer';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_CONSUMERS } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['ConsumerPut'] => {
  return data as APISIXType['ConsumerPut'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['ConsumerPut']): APISIXType['ConsumerPut'] => {
  return pipeProduce()(formData) as APISIXType['ConsumerPut'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination } = useConsumerList();
  const [formDrawerOpened, { open: openFormDrawer, close: closeFormDrawer }] = useDisclosure(false);
  const [jsonDrawerOpened, { open: openJsonDrawer, close: closeJsonDrawer }] = useDisclosure(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  const handleFormEdit = useCallback((username: string) => {
    setSelectedUsername(username);
    openFormDrawer();
  }, [openFormDrawer]);

  const handleJsonEdit = useCallback((username: string) => {
    setSelectedUsername(username);
    openJsonDrawer();
  }, [openJsonDrawer]);

  const columns = useMemo<ProColumns<APISIXType['RespConsumerItem']>[]>(() => {
    return [
      {
        dataIndex: ['value', 'username'],
        title: t('form.consumers.username'),
        key: 'username',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'desc'],
        title: t('form.basic.desc'),
        key: 'desc',
        valueType: 'text',
      },
      {
        dataIndex: ['value', 'update_time'],
        title: t('form.info.update_time'),
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
        width: 60,
        render: (_, record) => (
          <TableActionMenu
            resourceName={t('consumers.singular')}
            resourceTarget={record.value.username}
            deleteApi={`${API_CONSUMERS}/${record.value.username}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.username)}
            onJsonEdit={() => handleJsonEdit(record.value.username)}
          />
        ),
      },
    ];
  }, [refetch, t, handleFormEdit, handleJsonEdit]);

  return (
    <>
      <PageHeader title={t('sources.consumers')} />
      <AntdConfigProvider>
        <ProTable
          columns={columns}
          dataSource={data.list}
          rowKey="username"
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
                      to="/consumers/add"
                      label={t('info.add.title', {
                        name: t('consumers.singular'),
                      })}
                    />
                  ),
                },
              ],
            },
          }}
        />
      </AntdConfigProvider>

      {selectedUsername && (
        <>
          <FormEditDrawer<APISIXType['ConsumerPut'], APISIXType['ConsumerPut']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('consumers.singular')}
            queryOptions={getConsumerQueryOptions(selectedUsername)}
            schema={APISIX.ConsumerPut}
            toFormValues={toFormValues}
            toApiData={toApiData}
            onSave={(data) => putConsumerReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['consumers'] })}
          >
            <FormSectionGeneral showID={false} />
            <FormPartConsumer />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('consumers.singular')}
            queryOptions={getConsumerQueryOptions(selectedUsername)}
            onSave={(data) => putConsumerReq(req, data as APISIXType['ConsumerPut'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['consumers'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/consumers/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getConsumerListQueryOptions(deps)),
});
