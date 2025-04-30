import { A6, type A6Type } from '@/types/schema/apisix';
import { zGetDefault } from '@/utils/zod';
import {
  EditableProTable,
  nanoid,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, InputWrapper, type InputWrapperProps } from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { equals, isNil, range } from 'rambdax';
import type { ZodObject, ZodRawShape } from 'zod';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from '../../form/util';
import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { toJS } from 'mobx';

type DataSource = A6Type['UpstreamNode'] & A6Type['ID'];

const portValueEnum = range(1, 65535).reduce((acc, val) => {
  acc[val] = { text: String(val) };
  return acc;
}, {} as Record<number, { text: string }>);

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

const genId = nanoid;

const genRecord = () => {
  return {
    id: genId(),
    ...zGetDefault(A6.UpstreamNode),
  };
};

const objToUpstreamNodes = (data: A6Type['UpstreamNodeObj']) => {
  return Object.entries(data).map(([key, val]) => {
    const [host, port] = key.split(':');
    const d: A6Type['UpstreamNode'] = {
      host,
      port: Number(port) || 1,
      weight: val,
      priority: 0,
    };
    return d;
  });
};

const parseToDataSource = (data: A6Type['UpstreamNodeListOrObj']) => {
  let val: A6Type['UpstreamNodes'];
  if (isNil(data)) val = [];
  else if (Array.isArray(data)) val = data as A6Type['UpstreamNodes'];
  else val = objToUpstreamNodes(data as A6Type['UpstreamNodeObj']);

  return val.map((item) => {
    const d: DataSource = {
      id: `${item.host}-${item.port}-${item.weight}-${item.priority}`,
      ...item,
    };
    return d;
  });
};

const parseToUpstreamNodes = (data: DataSource[] | undefined) => {
  if (!data?.length) return [];
  return data.map((item) => {
    const d: A6Type['UpstreamNode'] = {
      host: item.host,
      port: item.port,
      weight: item.weight,
      priority: item.priority,
    };
    return d;
  });
};

const genProps = (field: keyof A6Type['UpstreamNode']) => {
  return {
    rules: [
      {
        validator: (_: unknown, value: unknown) =>
          zValidateField(A6.UpstreamNode, field, value),
      },
    ],
  };
};

export type FormItemNodesProps<T extends FieldValues> =
  UseControllerProps<T> & {
    onChange?: (value: A6Type['UpstreamNode'][]) => void;
    defaultValue?: A6Type['UpstreamNode'][];
  } & Pick<InputWrapperProps, 'label' | 'required' | 'withAsterisk'>;

const ObEditableProTable = observer(EditableProTable);

const FormItemNodesCore = <T extends FieldValues>(
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
        title: t('form.upstream.nodes.host.title'),
        dataIndex: 'host',
        valueType: 'text',
        formItemProps: genProps('host'),
      },
      {
        title: t('form.upstream.nodes.port.title'),
        dataIndex: 'port',
        valueType: 'digit',
        valueEnum: portValueEnum,
        formItemProps: genProps('port'),
      },
      {
        title: t('form.upstream.nodes.weight.title'),
        dataIndex: 'weight',
        valueType: 'digit',
        formItemProps: genProps('weight'),
      },
      {
        title: t('form.upstream.nodes.priority.title'),
        dataIndex: 'priority',
        valueType: 'digit',
        formItemProps: genProps('priority'),
      },
      {
        title: t('form.upstream.nodes.action.title'),
        valueType: 'option',
        width: 100,
        hidden: disabled,
        render: () => null,
      },
    ],
    [disabled, t]
  );
  const { label, required, withAsterisk } = props;
  const ob = useLocalObservable(() => ({
    values: [] as DataSource[],
    setValues(data: DataSource[]) {
      if (equals(toJS(this.values), data)) return;
      this.values = data;
    },
    get editableKeys() {
      return disabled ? [] : ob.values.map((item) => item.id);
    },
  }));
  useEffect(() => {
    ob.setValues(parseToDataSource(value));
  }, [ob, value]);

  return (
    <InputWrapper
      error={fieldState.error?.message}
      label={label}
      required={required}
      withAsterisk={withAsterisk}
      onBlur={() => {
        const vals = parseToUpstreamNodes(ob.values);
        fOnChange?.(vals);
        restProps.onChange?.(vals);
      }}
    >
      <input name={fName} type="hidden" />
      <AntdConfigProvider>
        <ObEditableProTable<DataSource>
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
            actionRender: (row, config) => {
              return [
                <Button
                  key="delete"
                  variant="transparent"
                  size="compact-xs"
                  px={0}
                  onClick={() => {
                    config.onDelete?.(row.id, row);
                  }}
                >
                  {t('form.btn.delete')}
                </Button>,
              ];
            },
          }}
        />
      </AntdConfigProvider>
      <Button
        fullWidth
        variant="default"
        mt={8}
        size="xs"
        color="cyan"
        style={{ borderColor: 'whitesmoke' }}
        onClick={() => {
          const d = genRecord();
          ob.values.push(d);
        }}
        {...(disabled && { display: 'none' })}
      >
        {t('form.upstream.nodes.add')}
      </Button>
    </InputWrapper>
  );
};

export const FormItemNodes = observer(FormItemNodesCore);
