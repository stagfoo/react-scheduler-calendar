import { Identifier } from 'dnd-core';
import React from 'react';
import { DragLayer, XYCoord } from 'react-dnd';

import JobCard from '../jobCard';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(props: CustomDragLayerProps) {
  const { clientOffset } = props;
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }
  const { x, y } = clientOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export interface CustomDragLayerProps {
  item?: any;
  itemType?: Identifier | null;
  clientOffset?: XYCoord | null;
  isDragging?: boolean;
}

const CustomDragLayer: React.FC<CustomDragLayerProps> = (props) => {
  const { item, itemType, isDragging } = props;

  function renderItem() {
    // if (itemType === 'task') {
      return item &&
        <div style={{ display: 'inline-block', transform: 'scale(0.8)', background: '#a0a0f0' }}>
          <JobCard name={item.name} />
        </div>;
    // }
  }

  if (!isDragging) {
    return null;
  }
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(props)}>{renderItem()}</div>
    </div>
  );
};

export default DragLayer((monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  clientOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))(CustomDragLayer);
