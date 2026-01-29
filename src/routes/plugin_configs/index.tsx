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

import { getPluginConfigListQueryOptions, getPluginConfigQueryOptions, usePluginConfigList } from '@/apis/hooks';
import { putPluginConfigReq } from '@/apis/plugin_configs';
import { FormPartPluginConfig } from '@/components/form-slice/FormPartPluginConfig';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { FormEditDrawer } from '@/components/page/FormEditDrawer';
import { JSONEditDrawer } from '@/components/page/JSONEditDrawer';
import PageHeader from '@/components/page/PageHeader';
import { TableActionMenu } from '@/components/page/TableActionMenu';
import { ToAddPageDropdown } from '@/components/page/ToAddPageBtn';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { API_PLUGIN_CONFIGS } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';
import { pipeProduce } from '@/utils/producer';

// Transform API data to form values
const toFormValues = (data: Record<string, unknown>): APISIXType['PluginConfigPut'] => {
  return data as APISIXType['PluginConfigPut'];
};

// Transform form values to API data
const toApiData = (formData: APISIXType['PluginConfigPut']): APISIXType['PluginConfigPut'] => {
  return pipeProduce()(formData) as APISIXType['PluginConfigPut'];
};

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, pagination } = usePluginConfigList();
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
    ProColumns<APISIXType['RespPluginConfigItem']>[]
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
            resourceName={t('pluginConfigs.singular')}
            resourceTarget={record.value.id}
            deleteApi={`${API_PLUGIN_CONFIGS}/${record.value.id}`}
            onDeleteSuccess={refetch}
            onFormEdit={() => handleFormEdit(record.value.id)}
            onJsonEdit={() => handleJsonEdit(record.value.id)}
          />
        ),
      },
    ];
  }, [refetch, t, handleFormEdit, handleJsonEdit]);

  return (
    <>
      <PageHeader title={t('sources.pluginConfigs')} />
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
                      to="/plugin_configs/add"
                      label={t('info.add.title', {
                        name: t('pluginConfigs.singular'),
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
          <FormEditDrawer<APISIXType['PluginConfigPut'], APISIXType['PluginConfigPut']>
            opened={formDrawerOpened}
            onClose={closeFormDrawer}
            title={t('pluginConfigs.singular')}
            queryOptions={getPluginConfigQueryOptions(selectedId)}
            schema={APISIX.PluginConfigPut}
            toFormValues={toFormValues}
            toApiData={(d) => toApiData({ ...d, id: selectedId })}
            onSave={(data) => putPluginConfigReq(req, data)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['pluginConfigs'] })}
          >
            <FormSectionGeneral />
            <FormPartPluginConfig basicProps={{ namePlaceholder: 'my-plugin-config-name' }} />
          </FormEditDrawer>

          <JSONEditDrawer
            opened={jsonDrawerOpened}
            onClose={closeJsonDrawer}
            title={t('pluginConfigs.singular')}
            queryOptions={getPluginConfigQueryOptions(selectedId)}
            onSave={(data) => putPluginConfigReq(req, data as APISIXType['PluginConfigPut'])}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['pluginConfigs'] })}
          />
        </>
      )}
    </>
  );
}

export const Route = createFileRoute('/plugin_configs/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getPluginConfigListQueryOptions(deps)),
});
