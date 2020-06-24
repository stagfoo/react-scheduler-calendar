import { isEqual, pick } from 'lodash';
import React, { Component } from 'react';
import { SchedulerData, SchedulerProps } from 'src/core';

interface RequiredProps {
  displayRenderData: any[];
  schedulerData: SchedulerData;
  onHover: (args: any) => void;
  DndResourceEvents: any;
  eventDndSource: any;
}

type Props = RequiredProps & Partial<SchedulerProps>;

class ResourceEventsList extends Component<Props> {
  shouldComponentUpdate(nextProps: any, nextState: any) {
    const pickedProps = ['resourceEvents', 'displayRenderData', 'renderEvent'];
    return !isEqual(pick(nextProps, pickedProps), pick(this.props, pickedProps)) ||
      !isEqual(nextState, this.state);
  }

  render() {
    const { displayRenderData, schedulerData, onHover, DndResourceEvents, eventDndSource, ...rest } = this.props;
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
  }
}

export default ResourceEventsList;
