import { FormPartBasic } from './FormPartBasic';
import {
  FormSectionGeneral,
  type FormSectionGeneralProps,
} from './FormSectionGeneral';
import { FormSectionPluginsOnly } from './FormPartConsumer';

export const FormPartPluginConfig = (props: FormSectionGeneralProps) => {
  return (
    <>
      <FormSectionGeneral {...props} />
      <FormPartBasic />
      <FormSectionPluginsOnly />
    </>
  );
};
