import React from 'react';
import { Divider } from 'antd';

const PanelSection: React.FC<{
  title: string;
}> = ({ title, children }) => {
  return (
    <>
      <div>{title}</div>
      <Divider />
      {children}
    </>
  );
};

export default PanelSection;
