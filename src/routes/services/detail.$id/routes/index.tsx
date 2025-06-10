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
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { getRouteListQueryOptions } from '@/apis/hooks';
import PageHeader from '@/components/page/PageHeader';
import { ToDetailPageBtn } from '@/components/page/ToAddPageBtn';
import { queryClient } from '@/config/global';
import { RouteList } from '@/routes/routes';
import { pageSearchSchema } from '@/types/schema/pageSearch';

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = useParams({ from: '/services/detail/$id/routes/' });
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
        ToDetailBtn={({ record }) => (
          <ToDetailPageBtn
            key="detail"
            to="/services/detail/$id/routes/detail/$routeId"
            params={{ id, routeId: record.value.id }}
          />
        )}
      />
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
