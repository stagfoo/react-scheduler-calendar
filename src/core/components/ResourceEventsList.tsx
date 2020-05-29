import React from 'react';
import { SchedulerProps } from 'src/core/index';

interface RequiredProps {
  dndContext: any;
  displayRenderData: any[];
  schedulerData: any;
  onHover: (args: any) => void;
  onDraggingChanged: (isDragging: boolean) => void;
}

type Props = RequiredProps & Partial<SchedulerProps>;
export const ResourceEventsList: React.FC<Props> = (props) => {
  const { dndContext, displayRenderData, schedulerData, onHover, onDraggingChanged, ...rest } = props;
  const DndResourceEvents = dndContext.getDropTarget();
  const eventDndSource = dndContext.getDndSource();
  const resourceEventsList = displayRenderData.map((item: any, index: number) => (
    <DndResourceEvents
      key={item.slotId}
      resourceEvents={item}
      dndSource={eventDndSource}
      schedulerData={schedulerData}
      onHover={onHover}
      onDraggingChanged={onDraggingChanged}
      {...rest}
    />
  ));
  return <div>
    {resourceEventsList}
  </div>;
};

export default ResourceEventsList;
