import React, { CSSProperties } from 'react';
import { Divider } from 'antd';

const PanelSection: React.FC<{
  title: string;
  style?: CSSProperties;
}> = ({ title, style, children }) => {
  return (
    <>
      <Divider orientation="left">{title}</Divider>
      <div style={style}>{children}</div>
    </>
  );
};

export default PanelSection;
