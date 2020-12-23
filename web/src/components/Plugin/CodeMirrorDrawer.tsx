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
import React, { useRef } from 'react';
import { Drawer, Button, notification, PageHeader, Switch, Form, Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { js_beautify } from 'js-beautify';
import { LinkOutlined } from '@ant-design/icons';

type Props = {
  name: string;
  type: 'global' | 'scoped',
  visible?: boolean;
  initialData: object,
  readonly?: boolean;
  onClose?: () => void;
  onChange?: (data: PluginComponent.Data) => void;
  onSubmit?: (data: object) => void;
};

const FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 16,
  },
};

const CodeMirrorDrawer: React.FC<Props> = ({
  name,
  type = 'scoped',
  visible = false,
  readonly = false,
  initialData = {},
  onClose,
  onSubmit,
  onChange = () => { },
}) => {
  const ref = useRef<any>(null);

  const data = initialData[name];

  const formatCodes = () => {
    try {
      if (ref.current) {
        ref.current.editor.setValue(
          js_beautify(ref.current.editor.getValue(), {
            indent_size: 2,
          }),
        );
      }
    } catch (error) {
      notification.error({
        message: 'Format failed',
      });
    }
  };

  return (
    <>
      <style>
        {`
        .ant-drawer-body {
          padding: 0;
        }
        .ant-page-header.ant-page-header-compact {
          height: 100%;
        }
        .ant-page-header-content {
          height: 95%;
        }
      `}
      </style>
      <Drawer
        title={`Edit plugin: ${name}`}
        visible={visible}
        width={800}
        maskClosable={false}
        destroyOnClose
        onClose={onClose}
        footer={
          !readonly && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                style={{ marginRight: 8, marginLeft: 8 }}
                onClick={() => {
                  try {
                    if (onSubmit) {
                      onSubmit(JSON.parse(ref.current?.editor.getValue()));
                    }
                  } catch (error) {
                    notification.error({
                      message: 'Invalid JSON data',
                    });
                  }
                }}
              >
                Submit
              </Button>
            </div>
          )
        }
      >
        <Form {...FORM_ITEM_LAYOUT}>
          <Form.Item label="Enable">
            <Switch
              defaultChecked={initialData[name] && !initialData[name].disable}
              disabled={readonly}
              onChange={(isChecked) => {
                if (!isChecked) {
                  onChange({
                    ...initialData,
                    [name]: { ...initialData[name], disable: true },
                  });
                }
              }} />
          </Form.Item>
          {type === 'global' && <Form.Item label="Scope">
            <Select>
              <Select.Option value="global">global</Select.Option>
              <Select.Option value="scoped">scoped</Select.Option>
            </Select>
          </Form.Item>}
        </Form>
        <PageHeader
          title=""
          subTitle={`Current Plugin: ${name}`}
          ghost={false}
          extra={[
            <Button
              type="default"
              icon={<LinkOutlined />}
              onClick={() => {
                window.open(`https://github.com/apache/apisix/blob/master/doc/plugins/${name}.md`);
              }}
              key={1}
            >
              Document
            </Button>,
            <Button type="primary" onClick={formatCodes} key={2}>
              Format
            </Button>,
          ]}
        >
          <CodeMirror
            ref={ref}
            value={JSON.stringify(data, null, 2)}
            options={{
              mode: 'json-ld',
              readOnly: readonly ? 'nocursor' : '',
              lineWrapping: true,
              lineNumbers: true,
              showCursorWhenSelecting: true,
              autofocus: true,
            }}
          />
        </PageHeader>
      </Drawer>
    </>
  );
};

export default CodeMirrorDrawer;
