import { zGetDefault, zOneOf } from '@/utils/zod';
import { withForm } from '../form';
import { A6 } from '@/types/schema/apisix';
import { useTranslation } from 'react-i18next';

export const FormPartUpstream = withForm({
  defaultValues: zGetDefault(A6.Upstream),
  validators: {
    onChange: A6.Upstream.superRefine(zOneOf('nodes', 'service_name')),
  },
  props: {
    legend: '',
  },
  render: function Render({ form, legend }) {
    const { t } = useTranslation();
    return (
      <form.Section legend={legend || t('form.upstream.title')}></form.Section>
    );
  },
});
