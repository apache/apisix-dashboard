import React from 'react';
import { Modal } from 'antd';
import { useIntl } from 'umi';

import PluginForm from '@/components/PluginForm';
import { useForm } from 'antd/es/form/util';

interface Props {
  visible: boolean;
  name: string;
  initialData?: PluginForm.PluginSchema;
  onFinish(values: any): void;
}

const PluginModal: React.FC<Props> = (props) => {
  const { name, visible } = props;
  const [form] = useForm();

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
