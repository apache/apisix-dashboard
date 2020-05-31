import React, { useState, useEffect } from 'react';
import { Drawer, Button } from 'antd';

import PluginForm from '@/components/PluginForm';

interface Props extends PluginForm.Props {}

const PluginDrawer: React.FC<Props> = ({ name, ...rest }) => {
  const [visiable, setVisiable] = useState(false);

  useEffect(() => {
    setVisiable(Boolean(name));
  }, [name]);

  if (!name) {
    return null;
  }

  return (
    <Drawer
      title="编辑插件"
      width={400}
      visible={visiable}
      destroyOnClose
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button style={{ marginRight: 8 }} onClick={() => setVisiable(false)}>
            取消
          </Button>
          <Button type="primary">提交</Button>
        </div>
      }
      onClose={() => setVisiable(false)}
    >
      <PluginForm name={name!} {...rest} />
    </Drawer>
  );
};

export default PluginDrawer;
