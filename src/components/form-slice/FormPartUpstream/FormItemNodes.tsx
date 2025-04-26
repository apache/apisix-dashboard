import { A6, type A6Type } from '@/types/schema/apisix';
import { zGetDefault } from '@/utils/zod';
import {
  EditableProTable,
  nanoid,
  type ActionType,
  type EditableFormInstance,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, Input, type InputWrapperProps } from '@mantine/core';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { range } from 'rambdax';
import type { ZodObject, ZodRawShape } from 'zod';
import { useListState } from '@mantine/hooks';
import {
  useController,
  useFormContext,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from '../../form/util';
import { AntdConfigProvider } from '@/config/antdConfigProvider';

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

const parseToUpstreamNodes = (data: A6Type['UpstreamNodeObj']) => {
  return Object.entries(data).map(([key, val]) => {
    const [host, port] = key.split(':');
    const d: A6Type['UpstreamNode'] = {
      host,
      port: Number(port) || 0,
      weight: val,
      priority: 0,
    };
    return d;
  });
};

const parseToDataSource = (data: A6Type['UpstreamNodeListOrObj']) => {
  const val =
    typeof data === 'object'
      ? parseToUpstreamNodes(data as A6Type['UpstreamNodeObj'])
      : (data as A6Type['UpstreamNodes']) ?? [];
  return val.map((item) => {
    const d: DataSource = {
      ...item,
      id: genId(),
    };
    return d;
  });
};

const parseFromDataSourceToUpstreamNodes = (data: DataSource[] | undefined) => {
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
export type FormItemNodes<T extends FieldValues> = UseControllerProps<T> & {
  onChange?: (value: A6Type['UpstreamNode'][]) => void;
  defaultValue?: A6Type['UpstreamNode'][];
} & Pick<InputWrapperProps, 'label' | 'required' | 'withAsterisk'>;

export const FormItemNodes = <T extends FieldValues>(
  props: FormItemNodes<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props);
  const { control } = useFormContext<T>();
  const {
    field: { value, onChange: fOnChange, name: fName, ...restField },
    fieldState,
  } = useController<T>({ ...controllerProps, control });
  const { t } = useTranslation();
  const editorFormRef = useRef<EditableFormInstance<DataSource>>(null);
  const actionRef = useRef<ActionType | undefined>(null);
  const [values, handle] = useListState<DataSource>(parseToDataSource(value));
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    values.map((item) => item.id)
  );

  const genProps = useCallback((field: keyof A6Type['UpstreamNode']) => {
    return {
      onBlur: () => {
        editorFormRef.current?.validateFields();
      },
      rules: [
        {
          validator: (_: unknown, value: unknown) =>
            zValidateField(A6.UpstreamNode, field, value),
        },
      ],
    };
  }, []);

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
        render: (_n, r, _idx, action) => {
          return (
            <Button
              key="edit"
              variant="transparent"
              size="compact-xs"
              px={0}
              onClick={() => {
                // action?.addEditRecord
                action?.startEditable?.(r.id);
              }}
            >
              {t('form.btn.edit')}
            </Button>
          );
        },
      },
    ],
    [genProps, t]
  );
  const { label, required, withAsterisk } = props;
  return (
    <Input.Wrapper
      error={fieldState.error?.message}
      label={label}
      required={required}
      withAsterisk={withAsterisk}
    >
      <input name={fName} style={{ display: 'none' }} />
      <AntdConfigProvider>
        <EditableProTable<DataSource>
          defaultSize="small"
          rowKey="id"
          bordered
          value={values}
          onValuesChange={(d) => {
            const newVals = parseFromDataSourceToUpstreamNodes(d);
            fOnChange?.(newVals);
            restProps.onChange?.(newVals);
          }}
          recordCreatorProps={false}
          editableFormRef={editorFormRef}
          actionRef={actionRef}
          columns={columns}
          editable={{
            type: 'multiple',
            editableKeys: editableKeys,
            onChange: setEditableRowKeys,
            actionRender: (row) => {
              const idx = values.findIndex((item) => item.id === row.id);
              return [
                <Button
                  key="save"
                  variant="transparent"
                  size="compact-xs"
                  px={0}
                  onClick={async () => {
                    await editorFormRef.current?.validateFields();
                    const d = {
                      ...editorFormRef.current?.getRowData?.(row.id),
                      id: row.id,
                    } as DataSource;
                    if (idx > -1) {
                      handle.setItem(idx, d);
                    } else {
                      handle.append(d);
                    }
                    await actionRef.current?.cancelEditable(row.id);
                  }}
                >
                  {t('form.btn.save')}
                </Button>,
                <Button
                  key="delete"
                  variant="transparent"
                  size="compact-xs"
                  px={0}
                  onClick={async () => {
                    handle.remove(idx);
                    await actionRef.current?.cancelEditable(row.id);
                  }}
                >
                  {t('form.btn.delete')}
                </Button>,
              ];
            },
          }}
          {...restField}
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
          handle.append(d);
          actionRef.current?.startEditable?.(d.id);
        }}
      >
        {t('form.upstream.nodes.add')}
      </Button>
    </Input.Wrapper>
  );
};
