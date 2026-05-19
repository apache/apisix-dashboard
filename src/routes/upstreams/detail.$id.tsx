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
import { Button, Group, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { Suspense, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'react-use';
import type { z } from 'zod';

import { getUpstreamReq, putUpstreamReq } from '@/apis/upstreams';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartUpstream } from '@/components/form-slice/FormPartUpstream';
import {
  FormPartUpstreamSchema,
  type FormPartUpstreamType,
} from '@/components/form-slice/FormPartUpstream/schema';
import {
  produceRmEmptyUpstreamFields,
  produceToUpstreamForm,
} from '@/components/form-slice/FormPartUpstream/util';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { API_UPSTREAMS } from '@/config/constant';
import { req } from '@/config/req';
import type { APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

type Props = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const getUpstreamQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['upstream', id],
    queryFn: () => getUpstreamReq(req, id),
  });

const UpstreamDetailForm = (
  props: Props & Pick<APISIXType['Upstream'], 'id'>
) => {
  const { id, readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const {
    data: { value: upstreamData },
    refetch,
  } = useSuspenseQuery(getUpstreamQueryOptions(id));

  const formDefaults = useMemo(
    () => produceToUpstreamForm(upstreamData) as FormPartUpstreamType,
    [upstreamData]
  );
  type FormPartUpstreamInput = z.input<typeof FormPartUpstreamSchema>;
  const form = useForm<FormPartUpstreamInput, unknown, FormPartUpstreamType>({
    resolver: zodResolver(FormPartUpstreamSchema),
    shouldUnregister: true,
    mode: 'all',
    disabled: readOnly,
    defaultValues: formDefaults,
  });

  const putUpstream = useMutation({
    mutationFn: (d: APISIXType['Upstream']) => {
      // Merge original discovery_args into form data before processing,
      // so pipeProduce's produceRestoreEmptyPlugins can restore discovery_args: {}
      // even if the field was not touched (and thus absent from d).
      const merged = {
        ...d,
        ...(upstreamData.discovery_args !== undefined && !('discovery_args' in d)
          ? { discovery_args: upstreamData.discovery_args }
          : {}),
      };
      return putUpstreamReq(
        req,
        pipeProduce(produceRmEmptyUpstreamFields)(merged) as APISIXType['Upstream']
      );
    },
    async onSuccess() {
      notifications.show({
        message: t('info.edit.success', { name: t('upstreams.singular') }),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  useEffect(() => {
    if (upstreamData) {
      form.reset(produceToUpstreamForm(upstreamData));
    }
  }, [upstreamData, form]);

  return (
    <FormTOCBox>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((d: FormPartUpstreamType) => {
            putUpstream.mutateAsync(pipeProduce(produceRmEmptyUpstreamFields)(d));
          })}
        >
          <FormSectionGeneral readOnly />
          <FormPartUpstream />
          {!readOnly && (
            <Group>
              <FormSubmitBtn>{t('form.btn.save')}</FormSubmitBtn>
              <Button variant="outline" onClick={() => setReadOnly(true)}>
                {t('form.btn.cancel')}
              </Button>
            </Group>
          )}
        </form>
      </FormProvider>
    </FormTOCBox>
  );
};

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = useParams({ from: '/upstreams/detail/$id' });
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('info.edit.title', { name: t('upstreams.singular') })}
        {...(readOnly && {
          title: t('info.detail.title', { name: t('upstreams.singular') }),
          extra: (
            <Group>
              <Button
                onClick={() => setReadOnly(false)}
                size="compact-sm"
                variant="gradient"
              >
                {t('form.btn.edit')}
              </Button>
              <DeleteResourceBtn
                mode="detail"
                name={t('upstreams.singular')}
                target={id}
                api={`${API_UPSTREAMS}/${id}`}
                onSuccess={() => navigate({ to: '/upstreams' })}
              />
            </Group>
          ),
        })}
      />
      <Suspense fallback={<Skeleton height={400} />}>
        <UpstreamDetailForm
          id={id}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      </Suspense>
    </>
  );
}

export const Route = createFileRoute('/upstreams/detail/$id')({
  component: RouteComponent,
});
