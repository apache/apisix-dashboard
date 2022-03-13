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
import React, { useEffect } from 'react';
import { Button, Drawer, Form, notification, Space } from 'antd';
import { useIntl } from 'umi';
import Editor from '@monaco-editor/react';
import { Input } from 'antd';

import { create, update } from '../../service';
import styles from './index.less';

const ProtoDrawer: React.FC<ProtoModule.ProtoDrawerProps> = ({
  protoData,
  setProtoData,
  visible,
  setVisible,
  editMode,
  refreshTable,
}) => {
  const [form] = Form.useForm();
  const { formatMessage } = useIntl();

  useEffect(() => {
    form.setFieldsValue(protoData);
  }, [visible]);

  const submit = async () => {
    await form.validateFields();
    const formData: ProtoModule.ProtoData = form.getFieldsValue(true);
    if (editMode === 'create') {
      create(formData).then(() => {
        notification.success({
          message: formatMessage({ id: 'page.proto.drawer.create.successfully' }),
        });
        setVisible(false);
        refreshTable();
      });
    } else {
      update(formData);
      notification.success({
        message: formatMessage({ id: 'page.proto.drawer.edit.successfully' }),
      });
      setVisible(false);
      refreshTable();
    }
  };

  return (
    <Drawer
      title={formatMessage({
        id: editMode === 'create' ? 'page.proto.drawer.create' : 'page.proto.drawer.edit',
      })}
      visible={visible}
      placement="right"
      closable={false}
      maskClosable={true}
      destroyOnClose
      onClose={() => setVisible(false)}
      width={700}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              setVisible(false);
            }}
          >
            {formatMessage({ id: 'component.global.cancel' })}
          </Button>
          <Space>
            <Button type="primary" onClick={() => submit()}>
              {formatMessage({ id: 'component.global.submit' })}
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} labelAlign="left" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          label="id"
          name="id"
          tooltip={formatMessage({ id: 'page.proto.id.tooltip' })}
          rules={[
            {
              required: true,
              message: `${formatMessage({ id: 'component.global.pleaseEnter' })} id`,
            },
          ]}
          validateTrigger={['onChange', 'onBlur', 'onClick']}
        >
          <Input disabled={editMode === 'update'} required />
        </Form.Item>
        <Form.Item
          label="desc"
          name="desc"
          tooltip={formatMessage({ id: 'page.proto.desc.tooltip' })}
          validateTrigger={['onChange', 'onBlur', 'onClick']}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="content"
          name="content"
          tooltip={formatMessage({ id: 'page.proto.content.tooltip' })}
          rules={[
            {
              required: true,
              message: `${formatMessage({ id: 'component.global.pleaseEnter' })} content`,
            },
          ]}
          validateTrigger={['onChange', 'onBlur', 'onClick']}
          wrapperCol={{ span: 24 }}
          className={styles.formItemEditor}
        >
          <Editor
            height="60vh"
            value={protoData.content}
            onChange={(text) => {
              setProtoData({ ...protoData, content: text || '' });
            }}
            language="proto"
            options={{
              wordWrap: 'on',
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
              },
              minimap: { enabled: false },
            }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default ProtoDrawer;
