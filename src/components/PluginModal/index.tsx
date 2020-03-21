import React from 'react';
import { Modal } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

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
    <Modal
      destroyOnClose
      visible={visible}
      title={`${formatMessage({ id: 'component.global.edit.plugin' })} ${name}`}
    >
      <PluginForm {...props} />
    </Modal>
  );
};

export default PluginModal;
