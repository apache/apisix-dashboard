import { FormPartBasic, type FormPartBasicProps } from './FormPartBasic';
import { FormSectionPluginsOnly } from './FormPartConsumer';
import {
  FormSectionGeneral,
  type FormSectionGeneralProps,
} from './FormSectionGeneral';

export const FormPartPluginConfig = (
  props: {
    basicProps?: FormPartBasicProps;
    generalProps?: FormSectionGeneralProps;
  } = {}
) => {
  const { generalProps, basicProps } = props;
  return (
    <>
      <FormSectionGeneral {...generalProps} />
      <FormPartBasic {...basicProps} />
      <FormSectionPluginsOnly />
    </>
  );
};
