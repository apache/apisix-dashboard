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
import { Button, Drawer, Form, Input, Popconfirm, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { transformLableValueToKeyValue } from '../../transform';

interface Props extends Pick<RouteModule.Step1PassProps, 'onChange'> {
  labelsDataSource: any;
  onClose(): void;
};

const LabelsDrawer: React.FC<Props> = ({ labelsDataSource, onClose, onChange = () => { } }) => {
  const transFormData = transformLableValueToKeyValue(labelsDataSource);
  const EditableContext = React.createContext();
  const [dataSource, setDataSource] = useState(transFormData);

  const handleRemove = (key: string, value: string) => {
    const newDataScource = dataSource.filter((item) => !(item.key === key && item.value === value));
    setDataSource(newDataScource);
  };

  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const columns = [
    {
      title: 'key',
      dataIndex: 'key',
      width: '30%',
      editable: true,
    },
    {
      title: 'value',
      dataIndex: 'value',
      width: '30%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        return dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => {
              handleRemove(record.key, record.value);
            }}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null;
      },
    },
  ];

  const EditableCell = ({
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
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
          <div
            className="editable-cell-value-wrap"
            style={{
              paddingRight: 24,
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
                  data: dataSource.map(item => (`${item.key}:${item.value}`))
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
          setDataSource([...dataSource, { key: '', value: '' }]);
        }}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add a row
      </Button>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
    </Drawer>
  );
};

export default LabelsDrawer;
