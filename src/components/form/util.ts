import type { FieldValues, UseControllerProps } from 'react-hook-form';

export const genControllerProps = <T extends FieldValues, R>(
  props: UseControllerProps<T> & R,
  defaultValueFallback?: unknown
) => {
  const { name, control, defaultValue, rules, shouldUnregister, ...restProps } =
    props;
  const { disabled } = restProps;
  return {
    controllerProps: {
      name,
      control,
      defaultValue:
        defaultValue ??
        (defaultValueFallback as UseControllerProps<T>['defaultValue']),
      rules,
      shouldUnregister,
      disabled,
    },
    restProps,
  };
};
