import { FormPartBasic, type FormPartBasicProps } from './FormPartBasic';
import {
  FormSectionGeneral,
  type FormSectionGeneralProps,
} from './FormSectionGeneral';
import { FormSectionPluginsOnly } from './FormPartConsumer';

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
