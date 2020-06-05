import React from 'react';
import { Drawer, Button } from 'antd';
import { useForm } from 'antd/es/form/util';

import PluginForm from '@/components/PluginForm';

interface Props extends Omit<PluginForm.Props, 'form'> {
  active?: boolean;
  disabled?: boolean;
  onActive(name: string): void;
  onInactive(name: string): void;
  onClose(): void;
}

const PluginDrawer: React.FC<Props> = ({
  name,
  active,
  disabled,
  onActive,
  onInactive,
  onClose,
  ...rest
}) => {
  const [form] = useForm();

  if (!name) {
    return null;
  }

  return (
    <Drawer
      title={`配置 ${name} 插件`}
      width={400}
      visible={Boolean(name)}
      destroyOnClose
      onClose={onClose}
      footer={
        disabled ? null : (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {Boolean(active) && (
                <Button type="primary" danger onClick={() => onInactive(name)}>
                  禁用
                </Button>
              )}
              {Boolean(!active) && (
                <Button type="primary" onClick={() => onActive(name)}>
                  启用
                </Button>
              )}
            </div>
            {Boolean(active) && (
              <div>
                <Button onClick={onClose}>取消</Button>
                <Button
                  type="primary"
                  style={{ marginRight: 8, marginLeft: 8 }}
                  onClick={() => form.submit()}
                >
                  确认
                </Button>
              </div>
            )}
          </div>
        )
      }
    >
      <PluginForm name={name!} form={form} {...rest} disabled={disabled} />
    </Drawer>
  );
};

export default PluginDrawer;
