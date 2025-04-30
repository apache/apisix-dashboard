import { useCallback, useState } from 'react';
import type { APISIXType } from '@/types/schema/apisix';
import { useTranslation } from 'react-i18next';
import { useListState } from '@mantine/hooks';
import { TagsInput, type TagsInputProps } from '@mantine/core';
import { useMount } from 'react-use';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from './util';

export type FormItemLabels<T extends FieldValues> = UseControllerProps<T> &
  Omit<TagsInputProps, 'value' | 'onChange' | 'onBlur' | 'defaultValue'> & {
    onChange?: (value: APISIXType['Labels']) => void;
    defaultValue?: APISIXType['Labels'];
  };

export const FormItemLabels = <T extends FieldValues>(
  props: FormItemLabels<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props);
  const {
    field: { value, onChange: fOnChange, name: fName, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const { t } = useTranslation();
  const [values, handle] = useListState<string>();
  const [internalError, setInternalError] = useState<string | null>();

  useMount(() => {
    Object.entries(value || {}).forEach(([key, value]) => {
      handle.append(`${key}:${value}`);
    });
  });

  const handleSearchChange = useCallback(
    (val: string) => {
      const tuple = val.split(':');
      // when clear input, val can be ''
      if (val && tuple.length !== 2) {
        setInternalError(t('form.basic.labels.errorFormat'));
        return;
      }
      setInternalError(null);
    },
    [t]
  );

  const handleChange = useCallback(
    (vals: string[]) => {
      const obj: APISIXType['Labels'] = {};
      for (const val of vals) {
        const tuple = val.split(':');
        if (tuple.length !== 2) {
          setInternalError(t('form.basic.labels.errorFormat'));
          return;
        }
        obj[tuple[0]] = tuple[1];
      }
      setInternalError(null);
      handle.setState(vals);
      fOnChange(obj);
      restProps.onChange?.(obj);
    },
    [handle, fOnChange, restProps, t]
  );

  return (
    <>
      <input name={fName} type="hidden" />
      <TagsInput
        acceptValueOnBlur
        clearable
        value={values}
        onSearchChange={handleSearchChange}
        splitChars={[',']}
        label={t('form.basic.labels.title')}
        placeholder={t('form.basic.labels.placeholder')}
        error={internalError || fieldState.error?.message}
        {...restField}
        {...restProps}
        onChange={handleChange}
      />
    </>
  );
};
