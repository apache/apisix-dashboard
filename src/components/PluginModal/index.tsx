import React from 'react';
import { Modal } from 'antd';

import PluginForm from '@/components/PluginForm';

interface Props {
  visible: boolean;
  name: string;
  initialData?: PluginSchema;
  onFinish(values: any): void;
}

const PluginModal: React.FC<Props> = props => {
  const { name, visible } = props;

  return (
    // TODO: i18n
    <Modal destroyOnClose visible={visible} title={`编辑插件：${name}`}>
      <PluginForm {...props} />
    </Modal>
  );
};

export default PluginModal;
