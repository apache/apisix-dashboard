import { Button, Fieldset, Stack, type FieldsetProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form';
import { FormSection } from '../FormSection';
import type { SSLPostType } from './schema';
import type { PropsWithChildren } from 'react';
import { FormItemTextareaWithUpload } from '@/components/form/TextareaWithUpload';
import IconDelete from '~icons/material-symbols/delete-forever-outline';

const PairWrapper = (
  props: PropsWithChildren & Pick<FieldsetProps, 'legend'>
) => {
  const { children, legend } = props;
  return (
    <Fieldset p={8} mb={5} legend={legend}>
      <Stack flex={1} gap={1}>
        {children}
      </Stack>
    </Fieldset>
  );
};

const RequiredCertKey = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SSLPostType>();
  return (
    <PairWrapper>
      <FormItemTextareaWithUpload
        control={control}
        label={`${t('form.ssls.cert')} 1`}
        name="cert"
        required
      />
      <FormItemTextareaWithUpload
        control={control}
        label={`${t('form.ssls.key')} 1`}
        name="key"
        required
      />
    </PairWrapper>
  );
};
const CertKeyPairList = () => {
  const { t } = useTranslation();
  const certsState = useFormState<SSLPostType>({ name: 'certs' });
  const certs = useFieldArray({
    name: 'certs',
  });
  const keys = useFieldArray({
    name: 'keys',
  });
  return (
    <>
      {certs.fields.map((cert, idx) => (
        <PairWrapper
          key={cert.id}
          legend={
            !certsState.disabled && (
              <Button
                leftSection={<IconDelete />}
                justify="flex-end"
                size="compact-xs"
                color="red"
                variant="outline"
                onClick={() => {
                  certs.remove(idx);
                  keys.remove(idx);
                }}
              >
                {t('form.ssls.cert_key_list.delete')}
              </Button>
            )
          }
        >
          <FormItemTextareaWithUpload
            key={cert.id}
            name={`certs.${idx}`}
            label={`${t('form.ssls.cert')} ${idx + 2}`}
          />
          <FormItemTextareaWithUpload
            key={keys.fields[idx].id}
            name={`keys.${idx}`}
            label={`${t('form.ssls.key')} ${idx + 2}`}
          />
        </PairWrapper>
      ))}
      {!certsState.disabled && (
        <Button
          mt={16}
          fullWidth
          size="compact-sm"
          variant="outline"
          onClick={() => {
            keys.append('');
            certs.append('');
          }}
        >
          {t('form.ssls.cert_key_list.add')}
        </Button>
      )}
    </>
  );
};
export const FormItemCertKeyList = () => {
  const { t } = useTranslation();
  return (
    <FormSection legend={t('form.ssls.cert_key_list.title')}>
      <RequiredCertKey />
      <CertKeyPairList />
    </FormSection>
  );
};
