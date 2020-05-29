import React from 'react';
import { useDragLayer } from 'react-dnd';

interface Props {
  onDraggingChanged: (isDragging: boolean) => void;
}

export const DnDObserver: React.FC<Props> = ({ onDraggingChanged }) => {
  const [isDragging, setIsDragging] = React.useState<undefined | boolean>(undefined);
  const { isDragging: currentIsDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  if (isDragging !== currentIsDragging) {
    setIsDragging(currentIsDragging);
    onDraggingChanged(currentIsDragging);
  }

  return (<div/>);
};

export default DnDObserver;
