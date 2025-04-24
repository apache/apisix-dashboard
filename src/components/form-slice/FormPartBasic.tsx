import { zGetDefault } from '@/utils/zod';
import { withForm } from '../form';
import { A6 } from '@/types/schema/apisix';
import { useTranslation } from 'react-i18next';
import { FormItemLabels } from './FormItemLabels';
import { FormSection } from './FormSection';

export const FormPartBasic = withForm({
  defaultValues: zGetDefault(A6.Basic),
  validators: {
    onChange: A6.Basic,
  },
  props: {
    legend: '',
  } as { legend?: string },
  render: function Render({ form, legend }) {
    const { t } = useTranslation();

    return (
      <FormSection legend={legend || t('form.basic.title')}>
        <form.AppField
          name="name"
          children={(field) => <field.Text label={t('route.add.form.name')} />}
        />
        <form.AppField
          name="desc"
          children={(field) => (
            <field.Textarea label={t('route.add.form.desc')} />
          )}
        />
        <form.AppField name="labels" children={() => <FormItemLabels />} />
      </FormSection>
    );
  },
});
