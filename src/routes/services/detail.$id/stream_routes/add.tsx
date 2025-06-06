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
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { StreamRouteAddForm } from '@/routes/stream_routes/add';
import { CommonFormContext } from '@/utils/form-context';

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/services/detail/$id/stream_routes/add' });
  return (
    <CommonFormContext.Provider value={{ readOnlyFields: ['service_id'] }}>
      <PageHeader
        title={t('info.add.title', { name: t('streamRoutes.singular') })}
      />
      <FormTOCBox>
        <StreamRouteAddForm
          navigate={(res) =>
            navigate({
              to: '/services/detail/$id/stream_routes/detail/$routeId',
              params: { id, routeId: res.data.value.id },
            })
          }
          defaultValues={{
            service_id: id,
          }}
        />
      </FormTOCBox>
    </CommonFormContext.Provider>
  );
}

export const Route = createFileRoute('/services/detail/$id/stream_routes/add')({
  component: RouteComponent,
});
