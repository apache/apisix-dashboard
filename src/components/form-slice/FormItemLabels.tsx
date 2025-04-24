import { useFieldContext } from '../form';
import { useCallback, useEffect, useState, type FC } from 'react';
import type { A6Type } from '@/types/schema/apisix';
import { useTranslation } from 'react-i18next';
import { useListState } from '@mantine/hooks';
import { TagsInput, type TagsInputProps } from '@mantine/core';
import type { IssueData } from 'zod';

export const FormItemLabels: FC<TagsInputProps> = (props) => {
  const field = useFieldContext<A6Type['Labels']>();
  const { t } = useTranslation();
  const [values, handle] = useListState<string>();
  const [internalError, setInternalError] = useState<string | null>();

  useEffect(() => {
    Object.entries(field.state.value).forEach(([key, value]) => {
      handle.append(`${key}:${value}`);
    });
  }, []);

  const onSearchChange = useCallback(
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

  const onChange = useCallback(
    (vals: string[]) => {
      console.log('vals', vals);

      const obj: A6Type['Labels'] = {};
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
      field.handleChange(obj);
    },
    [values, t]
  );

  return (
    <TagsInput
      acceptValueOnBlur
      clearable
      value={values}
      onBlur={field.handleBlur}
      onSearchChange={onSearchChange}
      onChange={onChange}
      splitChars={[',']}
      label={t('form.basic.labels.title')}
      placeholder={t('form.basic.labels.placeholder')}
      {...(internalError && {
        error: internalError,
      })}
      {...(field.state.meta.errors.length && {
        error: (field.state.meta.errors as IssueData[])[0].message,
      })}
      {...props}
    ></TagsInput>
  );
};
