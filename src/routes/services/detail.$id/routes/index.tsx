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
import { useDisclosure } from '@mantine/hooks';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions, getRouteQueryOptions } from '@/apis/hooks';
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
import { API_ROUTES } from '@/config/constant';
import { queryClient } from '@/config/global';
import { req } from '@/config/req';
import { RouteList } from '@/routes/routes';
import type { APISIXType } from '@/types/schema/apisix';
import { pageSearchSchema } from '@/types/schema/pageSearch';

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
  const { id } = useParams({ from: '/services/detail/$id/routes/' });
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
        routeKey="/services/detail/$id/routes/"
        defaultParams={{
          filter: {
            service_id: id,
          },
        }}
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

export const Route = createFileRoute('/services/detail/$id/routes/')({
  component: RouteComponent,
  validateSearch: pageSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    queryClient.ensureQueryData(getRouteListQueryOptions(deps)),
});
