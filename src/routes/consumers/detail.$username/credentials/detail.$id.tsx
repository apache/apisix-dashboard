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
import { Button, Group,Skeleton } from '@mantine/core';
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

import {
  getCredentialQueryOptions,
  putCredentialReq,
} from '@/apis/credentials';
import { FormSubmitBtn } from '@/components/form/Btn';
import { FormPartCredential } from '@/components/form-slice/FormPartCredential';
import { FormTOCBox } from '@/components/form-slice/FormSection';
import { DeleteResourceBtn } from '@/components/page/DeleteResourceBtn';
import PageHeader from '@/components/page/PageHeader';
import { DetailCredentialsTabs } from '@/components/page-slice/consumers/DetailCredentialsTabs';
import { API_CREDENTIALS } from '@/config/constant';
import { APISIX } from '@/types/schema/apisix';
import { pipeProduce } from '@/utils/producer';

type CredentialFormProps = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const CredentialDetailForm = (props: CredentialFormProps) => {
  const { readOnly, setReadOnly } = props;
  const { t } = useTranslation();
  const { username, id } = useParams({
    from: '/consumers/detail/$username/credentials/detail/$id',
  });

  const {
    data: credentialData,
    isLoading,
    refetch,
  } = useSuspenseQuery(getCredentialQueryOptions(username, id));

  const form = useForm({
    resolver: zodResolver(APISIX.CredentialPut),
    shouldUnregister: true,
    shouldFocusError: true,
    mode: 'all',
    disabled: readOnly,
  });

  useEffect(() => {
    if (credentialData?.value && !isLoading) {
      form.reset(credentialData.value);
    }
  }, [credentialData, form, isLoading]);

  const putCredential = useMutation({
    mutationFn: putCredentialReq,
    async onSuccess() {
      notifications.show({
        message: t('consumers.credentials.edit.success'),
        color: 'green',
      });
      await refetch();
      setReadOnly(true);
    },
  });

  if (isLoading) {
    return <Skeleton height={400} />;
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) => {
          putCredential.mutateAsync({
            username,
            ...pipeProduce()(d),
          });
        })}
      >
        <FormPartCredential showDate />
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
  const { t } = useTranslation();
  const [readOnly, setReadOnly] = useBoolean(true);
  const { username, id } = useParams({
    from: '/consumers/detail/$username/credentials/detail/$id',
  });
  const navigate = useNavigate();

  return (
    <>
      <DetailCredentialsTabs />
      <PageHeader
        title={t('consumers.credentials.edit.title')}
        {...(readOnly && {
          title: t('consumers.credentials.detail.title'),
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
                key="delete"
                name={t('consumers.credentials.singular')}
                target={id}
                api={`${API_CREDENTIALS(username)}/${id}`}
                onSuccess={() =>
                  navigate({ to: `/consumers/detail/${username}/credentials` })
                }
              />
            </Group>
          ),
        })}
      />
      <FormTOCBox>
        <CredentialDetailForm readOnly={readOnly} setReadOnly={setReadOnly} />
      </FormTOCBox>
    </>
  );
}

export const Route = createFileRoute(
  '/consumers/detail/$username/credentials/detail/$id'
)({
  component: RouteComponent,
});
