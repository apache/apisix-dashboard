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
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { postStreamRouteReq } from '@/apis/stream_routes';
import { FormSubmitBtn } from '@/components/form/Btn';
import { produceRoute } from '@/components/form-slice/FormPartRoute/util';
import { FormPartStreamRoute } from '@/components/form-slice/FormPartStreamRoute';
import {
  StreamRoutePostSchema,
  type StreamRoutePostType,
} from '@/components/form-slice/FormPartStreamRoute/schema';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import PageHeader from '@/components/page/PageHeader';
import { StreamRoutesErrorComponent } from '@/components/page-slice/stream_routes/ErrorComponent';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';

type Props = {
  navigate: (res: APISIXType['RespStreamRouteDetail']) => Promise<void>;
  defaultValues?: Partial<StreamRoutePostType>;
};

export const StreamRouteAddForm = (props: Props) => {
  const { navigate, defaultValues } = props;
  const { t } = useTranslation();

  const postStreamRoute = useMutation({
    mutationFn: (d: StreamRoutePostType) =>
      postStreamRouteReq(req, produceRoute(d)),
    async onSuccess(res) {
      notifications.show({
        message: t('info.add.success', { name: t('streamRoutes.singular') }),
        color: 'green',
      });
      await navigate(res);
    },
  });

  const form = useForm({
    resolver: zodResolver(StreamRoutePostSchema),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((d) => postStreamRoute.mutateAsync(d))}>
        <FormPartStreamRoute />
        <FormSubmitBtn>{t('form.btn.add')}</FormSubmitBtn>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title={t('info.add.title', { name: t('streamRoutes.singular') })}
      />
      <FormTOCBox>
        <StreamRouteAddForm
          navigate={(res) =>
            navigate({
              to: '/stream_routes/detail/$id',
              params: { id: res.data.value.id },
            })
          }
        />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/stream_routes/add')({
  component: RouteComponent,
  errorComponent: StreamRoutesErrorComponent,
});
