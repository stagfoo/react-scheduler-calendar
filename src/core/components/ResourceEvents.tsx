import React from 'react';
import { isEqual, omit } from 'lodash';

import { CellUnits, DATETIME_FORMAT, SchedulerData, SummaryPos } from 'src/core';
import { DnDTypes } from 'src/lib/DnDTypes';
import { getPos } from '../utils/Util';
import SelectedArea from './SelectedArea';
import Summary from './Summary';

const supportTouch = 'ontouchstart' in window;

interface ResourceEventsProps {
  resourceEvents?: any;
  schedulerData: SchedulerData;
  dndSource?: any;
  onSetAddMoreState?: (...args: any[]) => any;
  updateEventStart?: (...args: any[]) => any;
  updateEventEnd?: (...args: any[]) => any;
  onHover?: (...args: any[]) => any;
  moveEvent?: (...args: any[]) => any;
  movingEvent?: (...args: any[]) => any;
  conflictOccurred?: (...args: any[]) => any;
  newEvent?: (...args: any[]) => any;
  eventItemClick?: (...args: any[]) => any;
  eventItemTemplateResolver?: (...args: any[]) => any;
  getHoverAreaStyle?: (...args: any[]) => any;
  connectDropTarget: (...args: any[]) => any;
  isOver?: boolean;
}

interface ResourceEventsState {
  startX?: number;
  left?: number;
  leftIndex?: number;
  width?: number;
  rightIndex?: number;
  isSelecting?: boolean;
  hover?: any;
}

class ResourceEvents extends React.Component<ResourceEventsProps, ResourceEventsState> {
  private eventContainer: HTMLDivElement | undefined;
  private DnDEventItem: any;

  constructor(props: Readonly<ResourceEventsProps>) {
    super(props);
    this.state = {
      isSelecting: false,
      left: 0,
      width: 0,
    };
    this.DnDEventItem = props.dndSource.getDragSource();
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    const omitProps = ['dndSource'];
    return !isEqual(omit(nextProps, omitProps), omit(this.props, omitProps)) ||
      !isEqual(nextState, this.state);
  }

  componentDidMount() {
    const { schedulerData } = this.props;
    const { config } = schedulerData;
    if (config.creatable) {
      if (supportTouch) {
        // this.eventContainer.addEventListener('touchstart', this.initDrag, false);
      } else if (this.eventContainer) {
        this.eventContainer.addEventListener('mousedown', this.initDrag, false);
      }
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: ResourceEventsProps) {
    if (supportTouch) {
      // this.eventContainer.removeEventListener('touchstart', this.initDrag, false);
    } else if (this.eventContainer) {
      this.eventContainer.removeEventListener(
        'mousedown',
        this.initDrag,
        false,
      );
    }
    if (nextProps.schedulerData.config.creatable) {
      if (supportTouch) {
        // this.eventContainer.addEventListener('touchstart', this.initDrag, false);
      } else {
        this.eventContainer!.addEventListener('mousedown', this.initDrag, false);
      }
    }
  }

  initDrag = (ev: MouseEvent | TouchEvent) => {
    const { isSelecting } = this.state;
    if (isSelecting) {
      return;
    }
    if ((ev.srcElement || ev.target) !== this.eventContainer) {
      return;
    }
    ev.stopPropagation();
    const { resourceEvents } = this.props;
    if (resourceEvents.groupOnly) {
      return;
    }
    let clientX = 0;
    if (supportTouch) {
      ev = ev as TouchEvent;
      if (ev.changedTouches.length === 0) {
        return;
      }
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      ev = ev as MouseEvent;
      if (ev.buttons && ev.buttons !== 1) {
        return;
      }
      clientX = ev.clientX;
    }
    const { schedulerData } = this.props;
    const cellWidth = schedulerData.getContentCellWidth();
    const pos = getPos(this.eventContainer);
    const startX = clientX - pos.x;
    const leftIndex = Math.floor(startX / cellWidth);
    const left = leftIndex * cellWidth;
    const rightIndex = Math.ceil(startX / cellWidth);
    const width = (rightIndex - leftIndex) * cellWidth;
    this.setState({
      startX,
      left,
      leftIndex,
      width,
      rightIndex,
      isSelecting: true,
    });
    if (supportTouch) {
      document.documentElement.addEventListener(
        'touchmove',
        this.doDrag,
        false,
      );
      document.documentElement.addEventListener(
        'touchend',
        this.stopDrag,
        false,
      );
      document.documentElement.addEventListener(
        'touchcancel',
        this.cancelDrag,
        false,
      );
    } else {
      document.documentElement.addEventListener(
        'mousemove',
        this.doDrag,
        false,
      );
      document.documentElement.addEventListener(
        'mouseup',
        this.stopDrag,
        false,
      );
    }
    document.onselectstart = function() {
      return false;
    };
    document.ondragstart = function() {
      return false;
    };
  };

  doDrag = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation();
    let clientX = 0;
    if (supportTouch) {
      ev = ev as TouchEvent;
      if (ev.changedTouches.length === 0) {
        return;
      }
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = (ev as MouseEvent).clientX;
    }
    const { startX } = this.state;
    const { schedulerData } = this.props;
    const { headers } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const pos = getPos(this.eventContainer!);
    const currentX = clientX - pos.x;
    let leftIndex = Math.floor(Math.min(startX!, currentX) / cellWidth);
    leftIndex = leftIndex < 0 ? 0 : leftIndex;
    const left = leftIndex * cellWidth;
    let rightIndex = Math.ceil(Math.max(startX!, currentX) / cellWidth);
    rightIndex = rightIndex > headers.length ? headers.length : rightIndex;
    const width = (rightIndex - leftIndex) * cellWidth;
    this.setState({
      leftIndex,
      left,
      rightIndex,
      width,
      isSelecting: true,
    });
  };

  stopDrag = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation();
    const { schedulerData, newEvent, resourceEvents } = this.props;
    const { headers, events, config, cellUnit, localeMoment } = schedulerData;
    const { leftIndex, rightIndex } = this.state;
    if (supportTouch) {
      document.documentElement.removeEventListener(
        'touchmove',
        this.doDrag,
        false,
      );
      document.documentElement.removeEventListener(
        'touchend',
        this.stopDrag.bind(this),
        false,
      );
      document.documentElement.removeEventListener(
        'touchcancel',
        this.cancelDrag,
        false,
      );
    } else {
      document.documentElement.removeEventListener(
        'mousemove',
        this.doDrag,
        false,
      );
      document.documentElement.removeEventListener(
        'mouseup',
        this.stopDrag,
        false,
      );
    }
    document.onselectstart = null;
    document.ondragstart = null;
    const startTime = headers[leftIndex!].time;
    let endTime = resourceEvents.headerItems[rightIndex! - 1].end;
    if (cellUnit !== CellUnits.Hour) {
      endTime = localeMoment(resourceEvents.headerItems[rightIndex! - 1].start)
        .hour(23)
        .minute(59)
        .second(59)
        .format(DATETIME_FORMAT);
    }
    const slotId = resourceEvents.slotId;
    const slotName = resourceEvents.slotName;
    this.setState({
      startX: 0,
      leftIndex: 0,
      left: 0,
      rightIndex: 0,
      width: 0,
      isSelecting: false,
    });
    let hasConflict = false;
    if (config.checkConflict) {
      const start = localeMoment(startTime);
      const end = localeMoment(endTime);
      events.forEach((e: any) => {
        if (schedulerData._getEventSlotId(e) === slotId) {
          const eStart = localeMoment(e.start);
          const eEnd = localeMoment(e.end);
          if (
            (start >= eStart && start < eEnd) ||
            (end > eStart && end <= eEnd) ||
            (eStart >= start && eStart < end) ||
            (eEnd > start && eEnd <= end)
          ) {
            hasConflict = true;
          }
        }
      });
    }
    if (hasConflict) {
      const { conflictOccurred } = this.props;
      if (conflictOccurred) {
        conflictOccurred(
          'New',
          {
            id: undefined,
            start: startTime,
            end: endTime,
            slotId,
            slotName,
            title: undefined,
          },
          DnDTypes.EVENT,
          slotId,
          slotName,
          startTime,
          endTime,
        );
      } else {
        console.log(
          'Conflict occurred, set conflictOccurred func in Scheduler to handle it',
        );
      }
    } else {
      if (newEvent) {
        newEvent(schedulerData, slotId, slotName, startTime, endTime);
      }
    }
  };

  cancelDrag = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation();
    const { isSelecting } = this.state;
    if (isSelecting) {
      document.documentElement.removeEventListener(
        'touchmove',
        this.doDrag,
        false,
      );
      document.documentElement.removeEventListener(
        'touchend',
        this.stopDrag,
        false,
      );
      document.documentElement.removeEventListener(
        'touchcancel',
        this.cancelDrag,
        false,
      );
      document.onselectstart = null;
      document.ondragstart = null;
      this.setState({
        startX: 0,
        leftIndex: 0,
        left: 0,
        rightIndex: 0,
        width: 0,
        isSelecting: false,
      });
    }
  };

  render() {
    const {
      resourceEvents,
      schedulerData,
      connectDropTarget,
      isOver,
      getHoverAreaStyle,
    } = this.props;
    const {
      cellUnit,
      startDate,
      endDate,
      config,
      localeMoment,
    } = schedulerData;
    const { isSelecting, left, width } = this.state;
    const cellWidth = schedulerData.getContentCellWidth();
    const cellMaxEvents = schedulerData.getCellMaxEvents();
    const rowWidth = schedulerData.getContentTableWidth();
    const DnDEventItem = this.DnDEventItem;
    const selectedArea = isSelecting ? (
      <SelectedArea
        style={{
          left,
          width,
          backgroundColor: schedulerData.config.selectedAreaColor,
        }}
      />
    ) : (
      <div/>
    );
    let hoverArea = null;
    if (isOver && this.state.hover) {
      let hoverStyle = {
        left: this.state.hover.leftIndex * cellWidth,
        width: this.state.hover.width || cellWidth,
      };
      if (getHoverAreaStyle) {
        hoverStyle = {
          ...hoverStyle,
          ...getHoverAreaStyle(this.state.hover),
        };
      }
      hoverArea = <div className={'hover-area'} style={hoverStyle}/>;
    }
    const eventList: React.ReactElement[] = [];
    resourceEvents.headerItems.forEach((headerItem: any, index: number) => {
      if (headerItem.count > 0 || headerItem.summary) {
        const isTop =
          config.summaryPos === SummaryPos.TopRight ||
          config.summaryPos === SummaryPos.Top ||
          config.summaryPos === SummaryPos.TopLeft;
        const marginTop =
          resourceEvents.hasSummary && isTop
            ? 1 + config.eventItemLineHeight
            : 1;
        const renderEventsMaxIndex =
          headerItem.addMore === 0 ? cellMaxEvents : headerItem.addMoreIndex;
        headerItem.events.forEach((evt: any, idx: number) => {
          if (idx < renderEventsMaxIndex && evt && evt.render) {
            let durationStart = localeMoment(startDate);
            let durationEnd = localeMoment(endDate).add(1, 'days');
            if (cellUnit === CellUnits.Hour) {
              durationStart = localeMoment(startDate).add(
                config.dayStartFrom,
                'hours',
              );
              durationEnd = localeMoment(endDate).add(
                config.dayStopTo + 1,
                'hours',
              );
            }
            const eventStart = localeMoment(evt.eventItem.start);
            const eventEnd = localeMoment(evt.eventItem.end);
            const isStart = eventStart >= durationStart;
            const isEnd = eventEnd <= durationEnd;
            const leftOfEventItem = index * cellWidth + (index > 0 ? 2 : 3);
            const widthOfEventItem = Math.max(
              evt.span * cellWidth - (index > 0 ? 5 : 6),
              0,
            );
            const top = marginTop + idx * config.eventItemLineHeight;
            const eventItem = (
              <DnDEventItem
                {...this.props}
                key={evt.eventItem.id}
                eventItem={evt.eventItem}
                isStart={isStart}
                isEnd={isEnd}
                isInPopover={false}
                left={leftOfEventItem}
                width={widthOfEventItem}
                top={top}
                leftIndex={index}
                rightIndex={index + evt.span}
              />
            );
            eventList.push(eventItem);
          }
        });
        if (headerItem.summary) {
          const top = isTop
            ? 1
            : resourceEvents.rowHeight - config.eventItemLineHeight + 1;
          const leftOfSummary = index * cellWidth + (index > 0 ? 2 : 3);
          const widthOfSummary = cellWidth - (index > 0 ? 5 : 6);
          const key = `${resourceEvents.slotId}_${headerItem.time}`;
          const summary = (
            <Summary
              key={key}
              schedulerDataConfig={schedulerData.config}
              summary={headerItem.summary}
              left={leftOfSummary}
              width={widthOfSummary}
              top={top}
            />
          );
          eventList.push(summary);
        }
      }
    });
    return (
      <tr>
        <td style={{ width: rowWidth, overflow: 'hidden' }}>
          {connectDropTarget(
            <div
              ref={this.eventContainerRef}
              className="event-container"
              style={{ height: resourceEvents.rowHeight }}
            >
              {hoverArea}
              {selectedArea}
              {eventList}
            </div>,
          )}
        </td>
      </tr>
    );
  }

  onAddMoreClick = (headerItem: any) => {
    const { onSetAddMoreState, resourceEvents, schedulerData } = this.props;
    if (onSetAddMoreState) {
      const { config } = schedulerData;
      const cellWidth = schedulerData.getContentCellWidth();
      const index = resourceEvents.headerItems.indexOf(headerItem);
      if (index !== -1) {
        let left = index * (cellWidth - 1);
        const pos = getPos(this.eventContainer!);
        left = left + pos.x;
        const top = pos.y;
        const height = (headerItem.count + 1) * config.eventItemLineHeight + 20;
        onSetAddMoreState({
          headerItem,
          left,
          top,
          height,
        });
      }
    }
  };

  eventContainerRef = (element: HTMLDivElement) => {
    this.eventContainer = element;
  };
}

export default ResourceEvents;
