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

import { putGlobalRuleReq } from '@/apis/global_rules';
import { getGlobalRuleListQueryOptions, getGlobalRuleQueryOptions, useGlobalRuleList } from '@/apis/hooks';
import { FormPartGlobalRules } from '@/components/form-slice/FormPartGlobalRules';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_GLOBAL_RULES } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['GlobalRulePut'] => {
  return data as APISIXType['GlobalRulePut'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['GlobalRulePut']): APISIXType['GlobalRulePut'] => {
  return pipeProduce()(formData) as APISIXType['GlobalRulePut'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination } = useGlobalRuleList();
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
    ProColumns<APISIXType['RespGlobalRuleItem']>[]
  >(() => {
    return [
      {
        dataIndex: ['value', 'id'],
        title: 'ID',
        key: 'id',
        valueType: 'text',
      },
      {
        title: t('table.actions'),
        valueType: 'option',
        key: 'option',
        width: 60,
        render: (_, record) => (
          <TableActionMenu
            resourceName={t('globalRules.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_GLOBAL_RULES}/${record.value.id}`}
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
      <PageHeader title={t('sources.globalRules')} />
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
                  label: (
                    <ToAddPageDropdown
                      to="/global_rules/add"
                      label={t('info.add.title', {
                        name: t('globalRules.singular'),
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
          <FormEditDrawer<APISIXType['GlobalRulePut'], APISIXType['GlobalRulePut']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('globalRules.singular')}
            queryOptions={getGlobalRuleQueryOptions(selectedId)}
            schema={APISIX.GlobalRulePut}
            toFormValues={toFormValues}
            toApiData={(d) => toApiData({ ...d, id: selectedId })}
            onSave={(data) => putGlobalRuleReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['globalRules'] })}
          >
            <FormSectionGeneral />
            <FormPartGlobalRules />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('globalRules.singular')}
            queryOptions={getGlobalRuleQueryOptions(selectedId)}
            onSave={(data) => putGlobalRuleReq(req, data as APISIXType['GlobalRulePut'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['globalRules'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/global_rules/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getGlobalRuleListQueryOptions(deps)),
});
