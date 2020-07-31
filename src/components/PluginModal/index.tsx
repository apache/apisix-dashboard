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
import React from 'react';
import { Modal, Form } from 'antd';
import { useIntl } from 'umi';

import PluginForm from '@/components/PluginForm';

interface Props {
  visible: boolean;
  name: string;
  initialData?: PluginForm.PluginSchema;
  onFinish(values: any): void;
}

const PluginModal: React.FC<Props> = (props) => {
  const { name, visible } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title={`${useIntl().formatMessage({ id: 'component.global.edit.plugin' })} ${name}`}
      okText="确定"
      cancelText="取消"
    >
      <PluginForm form={form} {...props} />
    </Modal>
  );
};

export default PluginModal;
