import React from 'react';
import { Divider } from 'antd';

const PanelSection: React.FC<{
  title: string;
}> = ({ title }) => {
  return (
    <>
      <div>{title}</div>
      <Divider />
    </>
  );
};

export default PanelSection;
