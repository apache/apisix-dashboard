/*
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
import React, { useContext, useRef, useState, useEffect } from 'react';
import { AutoComplete, Button, Drawer, Form, Input, Popconfirm, Select, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { transformLableValueToKeyValue } from '../../transform';
import { fetchLabelList } from '../../service';

interface Props extends Pick<RouteModule.Step1PassProps, 'onChange'> {
  labelsDataSource: any;
  onClose(): void;
};

type Item = {
  key: string;
  labelKey: string;
  labelValue: string;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: Item;
  handleSave: (record: Item) => void;
}

type LabelTableProps = {
  data: RouteModule.LabelTableProps[],
  onChange?(data: RouteModule.LabelTableProps[]): void;
}

const LabelTable: React.FC<LabelTableProps> = ({ data, onChange = () => { } }) => {
  const EditableContext = React.createContext<any>();
  const [labelList, setLabelList] = useState<RouteModule.LabelList>({});

  useEffect(() => {
    fetchLabelList().then((item) => {
      setLabelList(item as RouteModule.LabelList);
    });
  }, [])


  const handleRemove = (key: string) => {
    const newDataScource = data.filter((item) => item.key !== key);
    onChange(newDataScource);
  };

  const handleSave = (row: RouteModule.LabelTableProps) => {
    const newData = [...data];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    onChange(newData)
  };

  const EditableRow = ({ index, ...props }: any) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const columns: any = [
    {
      title: 'key',
      dataIndex: 'labelKey',
      width: '30%',
      editable: true,
    },
    {
      title: 'value',
      dataIndex: 'labelValue',
      width: '30%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, { key }: any) => {
        return data.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => {
              handleRemove(key);
            }}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null;
      },
    },
  ];

  const newColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const form = useContext<FormInstance>(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let options;
    if (record) {
      if (title === 'key') {
        options = Object.keys(labelList).map(item => ({ value: item }))
      }
      if (title === 'value' && record.labelKey !== '') {
        const key = record.labelKey;
        options = labelList[key].map(item => ({ value: item }))
      }
    }

    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <AutoComplete
            ref={inputRef}
            options={options}
            onPressEnter={save}
            onBlur={save}
            style={{ width: 100 }}
            placeholder="input here"
          />
        </Form.Item>
      ) : (
          <div
            className="editable-cell-value-wrap"
            style={{
              paddingRight: 24,
              minHeight: '22px',
            }}
            onClick={toggleEdit}
          >
            {children}
          </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  return <Table
    components={components}
    rowClassName={() => 'editable-row'}
    bordered
    dataSource={data}
    columns={newColumns}
  />
}

const LabelsDrawer: React.FC<Props> = ({ labelsDataSource, onClose, onChange = () => { } }) => {
  const transFormData = transformLableValueToKeyValue(labelsDataSource);
  const [dataSource, setDataSource] = useState(transFormData);

  return (
    <Drawer
      title="Edit labels"
      placement="right"
      width={512}
      visible
      closable
      onClose={onClose}
      footer={
        (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              style={{ marginRight: 8, marginLeft: 8 }}
              onClick={() => {
                onChange({
                  action: 'labelsChange',
                  data: dataSource.map(item => (`${item.labelKey}:${item.labelValue}`))
                })
                onClose();
              }}
            >
              确认
            </Button>
          </div>
        )
      }
    >
      <Button
        onClick={() => {
          setDataSource([...dataSource, { labelKey: '', labelValue: '', key: Math.random().toString(36).slice(2) }]);
        }}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add a row
      </Button>
      <LabelTable data={dataSource} onChange={setDataSource} />
    </Drawer>
  );
};

export default LabelsDrawer;
