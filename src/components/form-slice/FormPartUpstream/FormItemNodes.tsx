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
import { Button, InputWrapper, type InputWrapperProps } from '@mantine/core';
import { nanoid } from 'nanoid';
import { isNil } from 'rambdax';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ZodObject, ZodRawShape } from 'zod';

import { AntdConfigProvider } from '@/config/antdConfigProvider';
import { APISIX, type APISIXType } from '@/types/schema/apisix';

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

const toDataSource = (data: APISIXType['UpstreamNodeListOrObj']): DataSource[] => {
  let val: APISIXType['UpstreamNodes'];
  if (isNil(data)) val = [];
  else if (Array.isArray(data)) val = data as APISIXType['UpstreamNodes'];
  else val = objToUpstreamNodes(data as APISIXType['UpstreamNodeObj']);
  return val.map(
    (node) => ({ ...node, id: nanoid() }) as DataSource
  );
};

const toUpstreamNodes = (data: DataSource[]): APISIXType['UpstreamNode'][] => {
  if (!data?.length) return [];
  return data.map((item) => ({
    host: item.host,
    port: item.port,
    weight: item.weight,
    priority: item.priority,
  }));
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

/**
 * Upstream nodes editor.
 *
 * Architecture: react-hook-form is the single source of truth. The
 * EditableProTable is `controlled={false}` so it manages its own internal
 * cell editing state — we initialize it once from the form value and only
 * push changes UP (typing / add / remove → `fOnChange`). We never push
 * the form value DOWN into the table after mount, which eliminates the
 * feedback loop that caused #3293.
 *
 * The previous design used a MobX `useLocalObservable` mirror plus a
 * `useEffect([..., value])` that re-derived row ids from the form value
 * on every Submit-adjacent re-render. The id churn disrupted the table's
 * editable lifecycle and meant a fresh keystroke could be discarded if
 * the user clicked Save before the `useClickOutside` blur sync fired.
 */
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

  // One-shot initialization of table rows from the form value. Subsequent
  // form value changes (e.g. a parent useEffect reset) re-mount this
  // component via React keying at the route level, so a fresh init is
  // correct without us watching `value` continuously.
  const [rows, setRows] = useState<DataSource[]>(() => toDataSource(value));
  // Keep the latest rows accessible to action handlers without putting
  // them in their `useCallback` deps (which would re-render the table
  // and reset cell edit focus on every keystroke).
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  // Ref on the wrapper so the DOM-flush listener can scope its query.
  const wrapperRef = useRef<HTMLDivElement>(null);

  const pushUp = useCallback(
    (next: DataSource[]) => {
      const vals = toUpstreamNodes(next);
      fOnChange?.(vals);
      restProps.onChange?.(vals);
    },
    [fOnChange, restProps]
  );

  // Read whatever the user CURRENTLY sees in the cell inputs (DOM values)
  // and push that to react-hook-form. This is the last-resort sync that
  // fires when something outside the table is mousedowned — typically the
  // Submit button — because `valueType: "digit"` cells in
  // ant-design ProTable don't commit their typed value to Antd Form's
  // internal state until blur. Without this, a user who types into a
  // weight/port cell and clicks Save without blurring first would submit
  // stale (uncommitted) values, which was #3293.
  const flushFromDom = useCallback(() => {
    const root = wrapperRef.current;
    if (!root) return;
    const rowEls = root.querySelectorAll<HTMLElement>('tr.ant-table-row');
    if (rowEls.length === 0) return;
    const next: DataSource[] = [];
    rowEls.forEach((rowEl, index) => {
      const inputs = rowEl.querySelectorAll<HTMLInputElement>('input');
      const existing = rowsRef.current[index];
      const host = inputs[0]?.value ?? existing?.host ?? '';
      // ant-design InputNumber renders as type=number; parseInt is safe
      // because the schema rejects non-integer values upstream.
      const portRaw = inputs[1]?.value;
      const weightRaw = inputs[2]?.value;
      const priorityRaw = inputs[3]?.value;
      next.push({
        id: existing?.id ?? nanoid(),
        host,
        port:
          portRaw !== undefined && portRaw !== ''
            ? Number(portRaw)
            : (existing?.port ?? 80),
        weight:
          weightRaw !== undefined && weightRaw !== ''
            ? Number(weightRaw)
            : (existing?.weight ?? 1),
        priority:
          priorityRaw !== undefined && priorityRaw !== ''
            ? Number(priorityRaw)
            : (existing?.priority ?? 0),
      } as DataSource);
    });
    pushUp(next);
  }, [pushUp]);

  // Mousedown fires BEFORE the click-induced blur on the active cell,
  // and BEFORE the click handler on a Submit button. By flushing DOM
  // values at this point we guarantee react-hook-form sees the current
  // visible state, regardless of whether Antd Form has committed yet.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const root = wrapperRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return; // inside the table — ignore
      flushFromDom();
    };
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('touchstart', onMouseDown as EventListener, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener(
        'touchstart',
        onMouseDown as EventListener,
        true
      );
    };
  }, [flushFromDom]);

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
        formItemProps: genProps('host'),
      },
      {
        title: t('form.upstreams.nodes.port.title'),
        dataIndex: 'port',
        valueType: 'digit',
        formItemProps: genProps('port'),
        render: (_, entity) => {
          return entity.port.toString();
        },
      },
      {
        title: t('form.upstreams.nodes.weight.title'),
        dataIndex: 'weight',
        valueType: 'digit',
        formItemProps: genProps('weight'),
        render: (_, entity) => {
          return entity.weight.toString();
        },
      },
      {
        title: t('form.upstreams.nodes.priority.title'),
        dataIndex: 'priority',
        valueType: 'digit',
        formItemProps: genProps('priority'),
        render: (_, entity) => {
          return entity.priority?.toString() || '-';
        },
      },
      {
        title: t('form.upstreams.nodes.action.title'),
        valueType: 'option',
        width: 100,
        hidden: disabled,
        render: () => null,
      },
    ],
    [disabled, t]
  );

  const editableKeys = useMemo(
    () => (disabled ? [] : rows.map((r) => r.id)),
    [disabled, rows]
  );

  const handleValuesChange = useCallback(
    (_record: DataSource, dataSource: DataSource[]) => {
      // Cell-level edit: push every keystroke straight to react-hook-form
      // so a Submit fired before blur still sees the typed values.
      setRows(dataSource);
      pushUp(dataSource);
    },
    [pushUp]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const next = rowsRef.current.filter((r) => r.id !== id);
      setRows(next);
      pushUp(next);
    },
    [pushUp]
  );

  const handleAppend = useCallback(() => {
    const next: DataSource[] = [
      ...rowsRef.current,
      {
        host: '',
        port: 80,
        weight: 1,
        priority: 0,
        id: nanoid(),
      } as DataSource,
    ];
    setRows(next);
    pushUp(next);
  }, [pushUp]);

  const { label, required, withAsterisk } = props;

  return (
    <InputWrapper
      ref={wrapperRef}
      error={fieldState.error?.message}
      label={label}
      required={required}
      withAsterisk={withAsterisk}
    >
      <input name={fName} type="hidden" />
      <AntdConfigProvider>
        <EditableProTable<DataSource>
          defaultSize="small"
          rowKey="id"
          bordered
          controlled={false}
          value={rows}
          recordCreatorProps={false}
          columns={columns}
          editable={{
            type: 'multiple',
            editableKeys,
            onValuesChange: handleValuesChange,
            actionRender: (row) => {
              return [
                <Button
                  key="delete"
                  variant="transparent"
                  size="compact-xs"
                  px={0}
                  onClick={() => handleRemove(row.id)}
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
        onClick={handleAppend}
        {...(disabled && { display: 'none' })}
      >
        {t('form.upstreams.nodes.add')}
      </Button>
    </InputWrapper>
  );
};
