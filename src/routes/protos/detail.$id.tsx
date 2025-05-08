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
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'react-use';

import { getProtoQueryOptions, putProtoReq } from '@/apis/protos';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartProto } from '@/components/form-slice/FormPartProto';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { FormSectionGeneral } from '@/components/form-slice/FormSectionGeneral';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { API_PROTOS } from '@/config/constant';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

type ProtoFormProps = {
  id: string;
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ProtoDetailForm = ({ id, readOnly, setReadOnly }: ProtoFormProps) => {
  const { t } = useTranslation();
  const {
    data: protoData,
    isLoading,
    refetch,
  } = useSuspenseQuery(getProtoQueryOptions(id));

  const form = useForm<APISIXType['Proto']>({
    resolver: zodResolver(APISIX.Proto),
    shouldUnregister: true,
    mode: 'all',
    disabled: readOnly,
  });

  const putProto = useMutation({
    mutationFn: putProtoReq,
    async onSuccess() {
      notifications.show({
        message: t('protos.edit.success'),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (protoData?.value) {
      form.reset(protoData.value);
    }
  }, [protoData, form]);

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) =>
          putProto.mutateAsync(pipeProduce()(d))
        )}
      >
        <FormSectionGeneral />
        <FormPartProto allowUpload={!readOnly} />
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
  );
};

function RouteComponent() {
  const { id } = useParams({ from: '/protos/detail/$id' });
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('protos.edit.title')}
        {...(readOnly && {
          title: t('protos.detail.title'),
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
                name={t('protos.singular')}
                target={id}
                api={`${API_PROTOS}/${id}`}
                onSuccess={() => navigate({ to: '/protos' })}
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <ProtoDetailForm
          id={id}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
        />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute('/protos/detail/$id')({
  component: RouteComponent,
});
