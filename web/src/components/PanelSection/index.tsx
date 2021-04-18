import React, { CSSProperties } from 'react';
import { Divider, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const PanelSection: React.FC<{
  title: string;
  style?: CSSProperties;
  id?: string;
  tooltip?: string;
}> = ({ title, style, id, children, tooltip }) => {
  return (
    <div id={id}>
      <Divider orientation="left">
        {title}
        &nbsp;
        {tooltip && <Tooltip title={tooltip}><QuestionCircleOutlined /></Tooltip>}
      </Divider>
      <div style={style}>{children}</div>
    </div>
  );
};

export default PanelSection;
