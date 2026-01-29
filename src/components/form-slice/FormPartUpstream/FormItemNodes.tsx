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
import { EditableProTable, type ProColumns } from '@ant-design/pro-components';
import {
  ActionIcon,
  Button,
  InputWrapper,
  type InputWrapperProps,
  Tooltip,
} from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { toJS } from 'mobx';
import { useLocalObservable } from 'mobx-react-lite';
import { nanoid } from 'nanoid';
import { equals, isNil } from 'rambdax';
import { useEffect, useMemo } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ZodObject, ZodRawShape } from 'zod';

import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { zGetDefault } from '@/utils/zod';
import IconAdd from '~icons/material-symbols/add';
import IconDelete from '~icons/material-symbols/delete';

import { genControllerProps } from '../../form/util';

type DataSource = APISIXType['UpstreamNode'] & APISIXType['ID'];

const zValidateField = <T extends ZodRawShape, R extends keyof T>(
  zObj: ZodObject<T>,
  field: R,
  value: unknown
) => {
  const fieldSchema = zObj.shape[field];
  const res = fieldSchema.safeParse(value);
  if (res.success) {
    return Promise.resolve();
  }
  const error = res.error.issues[0];
  return Promise.reject(new Error(error.message));
};

const genRecord = (data?: DataSource | APISIXType['UpstreamNode']) => {
  const d = data || zGetDefault(APISIX.UpstreamNode);
  return {
    id: nanoid(),
    ...d,
  } as DataSource;
};

const objToUpstreamNodes = (data: APISIXType['UpstreamNodeObj']) => {
  return Object.entries(data).map(([key, val]) => {
    const [host, port] = key.split(':');
    const d: APISIXType['UpstreamNode'] = {
      host,
      port: Number(port) || 1,
      weight: val,
      priority: 0,
    };
    return d;
  });
};

const parseToDataSource = (data: APISIXType['UpstreamNodeListOrObj']) => {
  let val: APISIXType['UpstreamNodes'];
  if (isNil(data)) val = [];
  else if (Array.isArray(data)) val = data as APISIXType['UpstreamNodes'];
  else val = objToUpstreamNodes(data as APISIXType['UpstreamNodeObj']);
  return val.map(genRecord);
};

const parseToUpstreamNodes = (data: DataSource[] | undefined) => {
  if (!data?.length) return [];
  return data.map((item) => {
    const d: APISIXType['UpstreamNode'] = {
      host: item.host,
      port: item.port,
      weight: item.weight,
      priority: item.priority,
    };
    return d;
  });
};

const genProps = (field: keyof APISIXType['UpstreamNode']) => {
  return {
    rules: [
      {
        validator: (_: unknown, value: unknown) =>
          zValidateField(APISIX.UpstreamNode, field, value),
      },
    ],
  };
};

export type FormItemNodesProps<T extends FieldValues> =
  UseControllerProps<T> & {
    onChange?: (value: APISIXType['UpstreamNode'][]) => void;
    defaultValue?: APISIXType['UpstreamNode'][];
  } & Pick<InputWrapperProps, 'label' | 'required' | 'withAsterisk'>;

export const FormItemNodes = <T extends FieldValues>(
  props: FormItemNodesProps<T>
) => {
  const { controllerProps, restProps } = useMemo(
    () => genControllerProps(props),
    [props]
  );
  const { t } = useTranslation();
  const {
    field: { value, onChange: fOnChange, name: fName, disabled },
    fieldState,
  } = useController<T>(controllerProps);
  const columns = useMemo<ProColumns<DataSource>[]>(
    () => [
      {
        title: 'id',
        dataIndex: 'id',
        hidden: true,
      },
      {
        title: t('form.upstreams.nodes.host.title'),
        dataIndex: 'host',
        valueType: 'text',
        formItemProps: {
          ...genProps('host'),
        },
        fieldProps: {
          placeholder: 'httpbin.org',
        },
        width: '40%',
      },
      {
        title: t('form.upstreams.nodes.port.title'),
        dataIndex: 'port',
        valueType: 'digit',
        formItemProps: genProps('port'),
        fieldProps: {
          placeholder: '80',
          min: 1,
          max: 65535,
        },
        width: '15%',
        render: (_, entity) => {
          return entity.port.toString();
        },
      },
      {
        title: t('form.upstreams.nodes.weight.title'),
        dataIndex: 'weight',
        valueType: 'digit',
        formItemProps: genProps('weight'),
        fieldProps: {
          placeholder: '1',
          min: 0,
        },
        width: '15%',
        render: (_, entity) => {
          return entity.weight.toString();
        },
      },
      {
        title: t('form.upstreams.nodes.priority.title'),
        dataIndex: 'priority',
        valueType: 'digit',
        formItemProps: genProps('priority'),
        fieldProps: {
          placeholder: '0',
        },
        width: '15%',
        render: (_, entity) => {
          return entity.priority?.toString() || '0';
        },
      },
      {
        title: '',
        valueType: 'option',
        width: 50,
        hidden: disabled,
        render: () => null,
      },
    ],
    [disabled, t]
  );
  const { label, required, withAsterisk } = props;
  const ob = useLocalObservable(() => ({
    disabled: false,
    setDisabled(disabled: boolean | undefined) {
      this.disabled = disabled || false;
    },
    values: [] as DataSource[],
    setValues(data: DataSource[]) {
      if (equals(toJS(this.values), data)) return;
      this.values = data;
    },
    append(data: DataSource) {
      this.values.push(data);
    },
    remove(id: string) {
      const index = this.values.findIndex((item) => item.id === id);
      if (index === -1) return;
      this.values.splice(index, 1);
    },
    get editableKeys() {
      return this.disabled ? [] : this.values.map((item) => item.id);
    },
  }));
  useEffect(() => {
    ob.setValues(parseToDataSource(value));
  }, [ob, value]);
  useEffect(() => {
    ob.setDisabled(disabled);
  }, [disabled, ob]);

  const ref = useClickOutside(() => {
    const vals = parseToUpstreamNodes(toJS(ob.values));
    fOnChange?.(vals);
    restProps.onChange?.(vals);
  }, ['mouseup', 'touchend', 'mousedown', 'touchstart']);

  return (
    <InputWrapper
      error={fieldState.error?.message}
      label={label}
      required={required}
      withAsterisk={withAsterisk}
      ref={ref}
    >
      <input name={fName} type="hidden" />
      <AntdConfigProvider>
        <EditableProTable<DataSource>
          defaultSize="small"
          rowKey="id"
          bordered
          controlled={false}
          value={ob.values}
          recordCreatorProps={false}
          columns={columns}
          editable={{
            type: 'multiple',
            editableKeys: ob.editableKeys,
            onValuesChange(_, dataSource) {
              ob.setValues(dataSource);
            },
            actionRender: (row) => {
              return [
                <Tooltip key="delete" label={t('form.btn.delete')}>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => ob.remove(row.id)}
                  >
                    <IconDelete />
                  </ActionIcon>
                </Tooltip>,
              ];
            },
          }}
        />
      </AntdConfigProvider>
      <Button
        fullWidth
        variant="light"
        mt={8}
        size="xs"
        color="blue"
        leftSection={<IconAdd style={{ width: 16, height: 16 }} />}
        onClick={() => ob.append(genRecord())}
        {...(disabled && { display: 'none' })}
      >
        {t('form.upstreams.nodes.add')}
      </Button>
    </InputWrapper>
  );
};
