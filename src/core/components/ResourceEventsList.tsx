import React from 'react';
import { SchedulerProps } from 'src/core/index';

interface RequiredProps {
  displayRenderData: any[];
  schedulerData: any;
  onHover: (args: any) => void;
  DndResourceEvents: any;
  eventDndSource: any;
}

type Props = RequiredProps & Partial<SchedulerProps>;
export const ResourceEventsList: React.FC<Props> = (props) => {
  const { displayRenderData, schedulerData, onHover, DndResourceEvents, eventDndSource, ...rest } = props;
  const resourceEventsList = displayRenderData.map((item: any, index: number) => (
    <DndResourceEvents
      key={item.slotId}
      resourceEvents={item}
      dndSource={eventDndSource}
      schedulerData={schedulerData}
      onHover={onHover}
      {...rest}
    />
  ));
  return <>
    {resourceEventsList}
  </>;
};

export default ResourceEventsList;
