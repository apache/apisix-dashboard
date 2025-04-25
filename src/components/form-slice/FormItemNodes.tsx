import { A6, type A6Type } from '@/types/schema/apisix';
import { zGetDefault } from '@/utils/zod';
import {
  EditableProTable,
  type EditableFormInstance,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, Input } from '@mantine/core';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { range } from 'rambdax';
import type { ZodObject, ZodRawShape } from 'zod';
import { useListState } from '@mantine/hooks';
import '@ant-design/v5-patch-for-react-19';
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { genControllerProps } from '../form/util';

type DataSource = A6Type['UpstreamNode'] & {
  id: string;
};

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

const genId = (val: A6Type['UpstreamNode']) => {
  return `${val.host}-${val.port}-${val.weight}`;
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
      : (data as A6Type['UpstreamNodes']);
  return val.map((item) => {
    const d: DataSource = {
      ...item,
      id: genId(item),
    };
    return d;
  });
};
export type FormItemNodes<T extends FieldValues> = UseControllerProps<T> & {
  onChange?: (value: A6Type['UpstreamNode'][]) => void;
  defaultValue?: A6Type['UpstreamNode'][];
  label: ReactNode;
};

export const FormItemNodes = <T extends FieldValues>(
  props: FormItemNodes<T>
) => {
  const { controllerProps, restProps } = genControllerProps(props);
  const {
    field: { value, onChange: fOnChange, name: fName, ...restField },
    fieldState,
  } = useController<T>(controllerProps);
  const { t } = useTranslation();
  const editorFormRef = useRef<EditableFormInstance<DataSource>>(null);
  const [values, handle] = useListState<DataSource>(parseToDataSource(value));
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() =>
    values.map((item) => item.id)
  );

  const saveChange = useCallback(
    (vals: DataSource[]) => {
      editorFormRef.current?.validateFields().then(() => {
        handle.setState(vals);
        fOnChange(vals);
        restProps.onChange?.(vals);
      });
    },
    [handle, fOnChange, restProps]
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

  return (
    <Input.Wrapper error={fieldState.error?.message} label={props.label}>
      <input name={fName} style={{ display: 'none' }} />
      <ConfigProvider
        virtual
        locale={enUS}
        renderEmpty={() => <div>{t('noData')}</div>}
        theme={{
          token: {
            borderRadiusSM: 2,
          },
        }}
      >
        <EditableProTable<DataSource>
          defaultSize="small"
          rowKey="id"
          bordered
          controlled
          value={values}
          onValuesChange={(values) => {
            saveChange(values);
          }}
          editableFormRef={editorFormRef}
          columns={columns}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: () => {
              return {
                id: Date.now().toString(),
                ...zGetDefault(A6.UpstreamNode),
              };
            },
            icon: false,
            creatorButtonText: t('form.upstream.nodes.add'),
            style: { borderStyle: 'solid' },
          }}
          editable={{
            type: 'multiple',
            editableKeys: editableKeys,
            onChange: setEditableRowKeys,
            actionRender: (row, config) => {
              const idx = values.findIndex((item) => item.id === row.id);
              return [
                <Button
                  key="save"
                  variant="transparent"
                  size="compact-xs"
                  px={0}
                  onClick={() => {
                    const newData = {
                      ...row,
                      id: genId(row),
                    };
                    if (idx > -1) {
                      editorFormRef.current?.validateFields().then(() => {
                        handle.setItem(idx, newData);
                        config.cancelEditable?.(row.id);
                      });
                    }
                  }}
                >
                  {t('form.btn.save')}
                </Button>,
                <Button
                  key="delete"
                  variant="transparent"
                  size="compact-xs"
                  px={0}
                  onClick={() => handle.remove(idx)}
                >
                  {t('form.btn.delete')}
                </Button>,
              ];
            },
          }}
          {...restField}
        />
      </ConfigProvider>
    </Input.Wrapper>
  );
};
