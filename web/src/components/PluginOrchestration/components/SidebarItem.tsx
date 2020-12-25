import * as React from 'react';
import { INode, REACT_FLOW_CHART } from '@mrblenny/react-flow-chart';
import Button from 'antd/es/button';
import { SOuter } from '../DrawPluginStyle';

export interface ISidebarItemProps {
  type: string;
  ports: INode['ports'];
  properties?: any;
}

export const SidebarItem: React.FC<ISidebarItemProps> = ({ type, ports, properties }) => {
  return (
    <SOuter
      draggable
      onDragStart={(event: any) => {
        event.dataTransfer.setData(REACT_FLOW_CHART, JSON.stringify({ type, ports, properties }));
      }}
      style={{ padding: '5px' }}
    >
      <Button type="dashed">{type}</Button>
    </SOuter>
  );
};
