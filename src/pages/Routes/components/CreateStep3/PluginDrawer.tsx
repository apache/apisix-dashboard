import React, { useState, useEffect } from 'react';
import { Drawer, Button } from 'antd';

import PluginForm from '@/components/PluginForm';

interface Props extends PluginForm.Props {
  active?: boolean;
}

const PluginDrawer: React.FC<Props> = ({ name, active, ...rest }) => {
  const [visiable, setVisiable] = useState(false);

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
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {Boolean(active) && (
              <Button type="primary" danger>
                禁用
              </Button>
            )}
            {Boolean(!active) && <Button type="primary">启用</Button>}
          </div>
          {Boolean(active) && (
            <div>
              <Button onClick={() => setVisiable(false)}>取消</Button>
              <Button type="primary" style={{ marginRight: 8, marginLeft: 8 }}>
                提交
              </Button>
            </div>
          )}
        </div>
      }
      onClose={() => setVisiable(false)}
    >
      <PluginForm name={name!} {...rest} />
    </Drawer>
  );
};

export default PluginDrawer;
