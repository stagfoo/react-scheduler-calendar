import React from 'react';
import { SchedulerProps } from 'src/core/index';

interface RequiredProps {
  dndContext: any;
  displayRenderData: any[];
  schedulerData: any;
  onHover: (args: any) => void;
}

type Props = RequiredProps & Partial<SchedulerProps>;
export const ResourceEventsList: React.FC<Props> = (props) => {
  const { dndContext, displayRenderData, schedulerData, onHover, ...rest } = props;
  const refs = displayRenderData.map((item: any, index: number) => React.createRef());
  const DndResourceEvents = dndContext.getDropTarget();
  const eventDndSource = dndContext.getDndSource();
  const resourceEventsList = displayRenderData.map((item: any, index: number) => (
    <DndResourceEvents
      ref={refs[index]}
      key={item.slotId}
      resourceEvents={item}
      dndSource={eventDndSource}
      schedulerData={schedulerData}
      onHover={onHover}
      onHoverChanged={() => refs.findIndex(
        (ref) => ref.current && (ref.current as any).decoratedRef.current.props.isOver,
      ) >= 0}
      {...rest}
    />
  ));
  return <div>
    {resourceEventsList}
  </div>;
};

export default ResourceEventsList;
