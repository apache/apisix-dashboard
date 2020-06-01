import React, { useState, useEffect } from 'react';
import { Drawer, Button } from 'antd';
import { useForm } from 'antd/es/form/util';

import PluginForm from '@/components/PluginForm';

interface Props extends Omit<PluginForm.Props, 'form'> {
  active?: boolean;
  onActive(name: string): void;
  onInactive(name: string): void;
}

const PluginDrawer: React.FC<Props> = ({ name, active, onActive, onInactive, ...rest }) => {
  const [visiable, setVisiable] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    setVisiable(Boolean(name));
  }, [name]);

  if (!name) {
    return null;
  }

  return (
    <Drawer
      title={`配置 ${name} 插件`}
      width={400}
      visible={visiable}
      destroyOnClose
      onClose={() => setVisiable(false)}
      footer={
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
              <Button onClick={() => setVisiable(false)}>取消</Button>
              <Button
                type="primary"
                style={{ marginRight: 8, marginLeft: 8 }}
                onClick={() => form.submit()}
              >
                提交
              </Button>
            </div>
          )}
        </div>
      }
    >
      <PluginForm name={name!} form={form} {...rest} />
    </Drawer>
  );
};

export default PluginDrawer;
