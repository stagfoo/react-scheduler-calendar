import { Popover } from 'antd';
import classNames from 'classnames';
import React, { Component } from 'react';
import { CellUnits, DATETIME_FORMAT, SchedulerData } from 'src/core';
import { DnDTypes } from 'src/lib/DnDTypes';
import EventItemPopover from './EventItemPopover';

const supportTouch = 'ontouchstart' in window;

interface EventItemProps {
  schedulerData: SchedulerData;
  eventItem: any;
  isStart: boolean;
  isEnd: boolean;
  left: number;
  width: number;
  top: number;
  isInPopover: boolean;
  leftIndex: number;
  rightIndex: number;
  isDragging: boolean;
  connectDragSource: (...args: any[]) => any;
  connectDragPreview: (...args: any[]) => any;
  updateEventStart?: (...args: any[]) => any;
  updateEventEnd?: (...args: any[]) => any;
  moveEvent?: (...args: any[]) => any;
  subtitleGetter?: (...args: any[]) => any;
  eventItemClick?: (...args: any[]) => any;
  conflictOccurred?: (...args: any[]) => any;
  eventItemTemplateResolver?: (...args: any[]) => any;
  renderEvent?: (...args: any[]) => React.ReactElement;
}

interface EventItemState {
  left: number;
  top: number;
  startX?: number;
  endX?: number;
  width: number;
  isResizing: boolean;
}

class EventItem extends Component<EventItemProps, EventItemState> {
  static defaultProps: Partial<EventItemProps> = {
    renderEvent: (eventItem: any) => (<div className='event'>render event<span>{eventItem.id}</span></div>),
  };
  private startResizer: HTMLDivElement | undefined;
  private endResizer: HTMLDivElement | undefined;

  constructor(props: Readonly<EventItemProps>) {
    super(props);
    const { left, top, width } = props;
    this.state = {
      left,
      top,
      width,
      isResizing: false,
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(np: EventItemProps) {
    const { left, top, width } = np;
    this.setState({
      left,
      top,
      width,
    });
    this.subscribeResizeEvent(np);
  }

  componentDidMount() {
    // const { connectDragPreview } = this.props;
    // connectDragPreview(getEmptyImage(), {
    //   captureDraggingState: false,
    // });
    this.subscribeResizeEvent(this.props);
  }

  initStartDrag = (ev: MouseEvent | TouchEvent) => {
    const { schedulerData, eventItem } = this.props;
    const slotId = schedulerData._getEventSlotId(eventItem);
    const slot = schedulerData.getSlotById(slotId);
    if (!!slot && !!slot.groupOnly) {
      return;
    }
    if (schedulerData._isResizing()) {
      return;
    }
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
      ev = ev as MouseEvent;
      if (ev.buttons && ev.buttons !== 1) {
        return;
      }
      clientX = ev.clientX;
    }
    this.setState({
      startX: clientX,
    });
    schedulerData.startResizing();
    if (supportTouch) {
      this.startResizer!.addEventListener('touchmove', this.doStartDrag, false);
      this.startResizer!.addEventListener('touchend', this.stopStartDrag, false);
      this.startResizer!.addEventListener(
        'touchcancel',
        this.cancelStartDrag,
        false,
      );
    } else {
      document.documentElement.addEventListener(
        'mousemove',
        this.doStartDrag,
        false,
      );
      document.documentElement.addEventListener(
        'mouseup',
        this.stopStartDrag,
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
  doStartDrag = (ev: MouseEvent | TouchEvent) => {
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
      ev = ev as MouseEvent;
      clientX = ev.clientX;
    }
    const { left, width, leftIndex, rightIndex, schedulerData } = this.props;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = rightIndex * cellWidth - offset;
    const { startX } = this.state;
    let newLeft = left + clientX - startX!;
    let newWidth = width + startX! - clientX;
    if (newWidth < minWidth) {
      newWidth = minWidth;
      newLeft = (rightIndex - 1) * cellWidth + (rightIndex - 1 > 0 ? 2 : 3);
    } else if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newLeft = 3;
    }
    this.setState({ left: newLeft, width: newWidth, isResizing: true });
  };
  stopStartDrag = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation();
    this.setState({
      isResizing: false,
    });
    if (supportTouch) {
      this.startResizer!.removeEventListener(
        'touchmove',
        this.doStartDrag,
        false,
      );
      this.startResizer!.removeEventListener(
        'touchend',
        this.stopStartDrag,
        false,
      );
      this.startResizer!.removeEventListener(
        'touchcancel',
        this.cancelStartDrag,
        false,
      );
    } else {
      document.documentElement.removeEventListener(
        'mousemove',
        this.doStartDrag,
        false,
      );
      document.documentElement.removeEventListener(
        'mouseup',
        this.stopStartDrag,
        false,
      );
    }
    document.onselectstart = null;
    document.ondragstart = null;
    const {
      width,
      left,
      top,
      leftIndex,
      rightIndex,
      schedulerData,
      eventItem,
      updateEventStart,
      conflictOccurred,
    } = this.props;
    schedulerData._stopResizing();
    if (this.state.width === width) {
      return;
    }
    let clientX = 0;
    if (supportTouch) {
      ev = ev as TouchEvent;
      if (ev.changedTouches.length === 0) {
        this.setState({
          left,
          top,
          width,
        });
        return;
      }
      const touch = ev.changedTouches[0];
      clientX = touch.pageX;
    } else {
      ev = ev as MouseEvent;
      clientX = ev.clientX;
    }
    const { cellUnit, events, config, localeMoment } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = rightIndex * cellWidth - offset;
    const { startX } = this.state;
    const newWidth = width + startX! - clientX;
    const deltaX = clientX - startX!;
    const sign = deltaX < 0 ? -1 : deltaX === 0 ? 0 : 1;
    let count =
      (sign > 0
        ? Math.floor(Math.abs(deltaX) / cellWidth)
        : Math.ceil(Math.abs(deltaX) / cellWidth)) * sign;
    if (newWidth < minWidth) {
      count = rightIndex - leftIndex - 1;
    } else if (newWidth > maxWidth) {
      count = -leftIndex;
    }
    let newStart = localeMoment(eventItem.start)
      .add(
        cellUnit === CellUnits.Hour ? count * config.minuteStep : count,
        cellUnit === CellUnits.Hour ? 'minutes' : 'days',
      )
      .format(DATETIME_FORMAT);
    if (
      count !== 0 &&
      cellUnit !== CellUnits.Hour &&
      !config.displayWeekend
    ) {
      if (count > 0) {
        let tempCount = 0;
        let i = 0;
        while (true) {
          i++;
          const tempStart = localeMoment(eventItem.start).add(i, 'days');
          const dayOfWeek = tempStart.weekday();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            tempCount++;
            if (tempCount === count) {
              newStart = tempStart.format(DATETIME_FORMAT);
              break;
            }
          }
        }
      } else {
        let tempCount = 0;
        let i = 0;
        while (true) {
          i--;
          const tempStart = localeMoment(eventItem.start).add(i, 'days');
          const dayOfWeek = tempStart.weekday();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            tempCount--;
            if (tempCount === count) {
              newStart = tempStart.format(DATETIME_FORMAT);
              break;
            }
          }
        }
      }
    }
    let hasConflict = false;
    const slotId = schedulerData._getEventSlotId(eventItem);
    let slotName;
    const slot = schedulerData.getSlotById(slotId);
    if (slot) {
      slotName = slot.name;
    }
    if (config.checkConflict) {
      const start = localeMoment(newStart);
      const end = localeMoment(eventItem.end);
      hasConflict = this.checkEventsConflict(
        events,
        schedulerData,
        slotId,
        eventItem,
        localeMoment,
        start,
        end,
        hasConflict,
      );
    }
    if (hasConflict) {
      this.setState({
        left,
        top,
        width,
      });
      if (conflictOccurred) {
        conflictOccurred(
          schedulerData,
          'StartResize',
          eventItem,
          DnDTypes.EVENT,
          slotId,
          slotName,
          newStart,
          eventItem.end,
        );
      } else {
        console.log(
          'Conflict occurred, set conflictOccurred func in Scheduler to handle it',
        );
      }
      this.subscribeResizeEvent(this.props);
    } else {
      if (updateEventStart) {
        updateEventStart(schedulerData, eventItem, newStart);
      }
    }
  };

  checkEventsConflict = (
    events: any,
    schedulerData: SchedulerData,
    slotId: string,
    eventItem: any,
    localeMoment: any,
    start: string,
    end: string,
    hasConflict: boolean) => {
    events.forEach((e: any) => {
      if (
        schedulerData._getEventSlotId(e) === slotId &&
        e.id !== eventItem.id
      ) {
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
    return hasConflict;
  };

  cancelStartDrag = (ev: MouseEvent | TouchEvent) => {
    this.setState({
      isResizing: false,
    });
    ev.stopPropagation();
    this.startResizer!.removeEventListener('touchmove', this.doStartDrag, false);
    this.startResizer!.removeEventListener(
      'touchend',
      this.stopStartDrag,
      false,
    );
    this.startResizer!.removeEventListener(
      'touchcancel',
      this.cancelStartDrag,
      false,
    );
    document.onselectstart = null;
    document.ondragstart = null;
    const { schedulerData, left, top, width } = this.props;
    schedulerData._stopResizing();
    this.setState({
      left,
      top,
      width,
    });
  };
  initEndDrag = (ev: MouseEvent | TouchEvent) => {
    const { schedulerData, eventItem } = this.props;
    const slotId = schedulerData._getEventSlotId(eventItem);
    const slot = schedulerData.getSlotById(slotId);
    if (!!slot && !!slot.groupOnly) {
      return;
    }
    if (schedulerData._isResizing()) {
      return;
    }
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
      ev = ev as MouseEvent;
      if (ev.buttons && ev.buttons !== 1) {
        return;
      }
      clientX = ev.clientX;
    }
    this.setState({
      endX: clientX,
    });
    schedulerData.startResizing();
    if (supportTouch) {
      this.endResizer!.addEventListener('touchmove', this.doEndDrag, false);
      this.endResizer!.addEventListener('touchend', this.stopEndDrag, false);
      this.endResizer!.addEventListener(
        'touchcancel',
        this.cancelEndDrag,
        false,
      );
    } else {
      document.documentElement.addEventListener(
        'mousemove',
        this.doEndDrag,
        false,
      );
      document.documentElement.addEventListener(
        'mouseup',
        this.stopEndDrag,
        false,
      );
    }
    document.onselectstart = function () {
      return false;
    };
    document.ondragstart = function () {
      return false;
    };
  };
  doEndDrag = (ev: MouseEvent | TouchEvent) => {
    this.setState({
      isResizing: true,
    });
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
      ev = ev as MouseEvent;
      clientX = ev.clientX;
    }
    const { width, leftIndex, schedulerData } = this.props;
    const { headers } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = (headers.length - leftIndex) * cellWidth - offset;
    const { endX } = this.state;
    let newWidth = width + clientX - endX!;
    if (newWidth < minWidth) {
      newWidth = minWidth;
    } else if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }
    this.setState({ width: newWidth, isResizing: true });
  };
  stopEndDrag = (ev: MouseEvent | TouchEvent) => {
    this.setState({
      isResizing: false,
    });
    ev.stopPropagation();
    if (supportTouch) {
      this.endResizer!.removeEventListener('touchmove', this.doEndDrag, false);
      this.endResizer!.removeEventListener('touchend', this.stopEndDrag, false);
      this.endResizer!.removeEventListener(
        'touchcancel',
        this.cancelEndDrag,
        false,
      );
    } else {
      document.documentElement.removeEventListener(
        'mousemove',
        this.doEndDrag,
        false,
      );
      document.documentElement.removeEventListener(
        'mouseup',
        this.stopEndDrag,
        false,
      );
    }
    document.onselectstart = null;
    document.ondragstart = null;
    const {
      width,
      left,
      top,
      leftIndex,
      rightIndex,
      schedulerData,
      eventItem,
      updateEventEnd,
      conflictOccurred,
    } = this.props;
    schedulerData._stopResizing();
    if (this.state.width === width) {
      return;
    }
    let clientX = 0;
    if (supportTouch) {
      if ((ev as TouchEvent).changedTouches.length === 0) {
        this.setState({
          left,
          top,
          width,
        });
        return;
      }
      const touch = (ev as TouchEvent).changedTouches[0];
      clientX = touch.pageX;
    } else {
      clientX = (ev as MouseEvent).clientX;
    }
    const { headers, cellUnit, events, config, localeMoment } = schedulerData;
    const cellWidth = schedulerData.getContentCellWidth();
    const offset = leftIndex > 0 ? 5 : 6;
    const minWidth = cellWidth - offset;
    const maxWidth = (headers.length - leftIndex) * cellWidth - offset;
    const { endX } = this.state;
    const newWidth = width + clientX - endX!;
    const deltaX = newWidth - width;
    const sign = deltaX < 0 ? -1 : deltaX === 0 ? 0 : 1;
    let count =
      (sign < 0
        ? Math.floor(Math.abs(deltaX) / cellWidth)
        : Math.ceil(Math.abs(deltaX) / cellWidth)) * sign;
    if (newWidth < minWidth) {
      count = leftIndex - rightIndex + 1;
    } else if (newWidth > maxWidth) {
      count = headers.length - rightIndex;
    }
    let newEnd = localeMoment(eventItem.end)
      .add(
        cellUnit === CellUnits.Hour ? count * config.minuteStep : count,
        cellUnit === CellUnits.Hour ? 'minutes' : 'days',
      )
      .format(DATETIME_FORMAT);
    if (
      count !== 0 &&
      cellUnit !== CellUnits.Hour &&
      !config.displayWeekend
    ) {
      if (count > 0) {
        let tempCount = 0;
        let i = 0;
        while (true) {
          i++;
          const tempEnd = localeMoment(eventItem.end).add(i, 'days');
          const dayOfWeek = tempEnd.weekday();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            tempCount++;
            if (tempCount === count) {
              newEnd = tempEnd.format(DATETIME_FORMAT);
              break;
            }
          }
        }
      } else {
        let tempCount = 0;
        let i = 0;
        while (true) {
          i--;
          const tempEnd = localeMoment(eventItem.end).add(i, 'days');
          const dayOfWeek = tempEnd.weekday();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            tempCount--;
            if (tempCount === count) {
              newEnd = tempEnd.format(DATETIME_FORMAT);
              break;
            }
          }
        }
      }
    }
    let hasConflict = false;
    const slotId = schedulerData._getEventSlotId(eventItem);
    let slotName;
    const slot = schedulerData.getSlotById(slotId);
    if (slot) {
      slotName = slot.name;
    }
    if (config.checkConflict) {
      const start = localeMoment(eventItem.start);
      const end = localeMoment(newEnd);
      hasConflict = this.checkEventsConflict(
        events,
        schedulerData,
        slotId,
        eventItem,
        localeMoment,
        start,
        end,
        hasConflict,
      );
    }
    if (hasConflict) {
      this.setState({
        left,
        top,
        width,
      });
      if (conflictOccurred) {
        conflictOccurred(
          schedulerData,
          'EndResize',
          eventItem,
          DnDTypes.EVENT,
          slotId,
          slotName,
          eventItem.start,
          newEnd,
        );
      } else {
        console.log(
          'Conflict occurred, set conflictOccurred func in Scheduler to handle it',
        );
      }
      this.subscribeResizeEvent(this.props);
    } else {
      if (updateEventEnd) {
        updateEventEnd(schedulerData, eventItem, newEnd);
      }
    }
  };
  cancelEndDrag = (ev: MouseEvent | TouchEvent) => {
    this.setState({
      isResizing: false,
    });
    ev.stopPropagation();
    this.endResizer!.removeEventListener('touchmove', this.doEndDrag, false);
    this.endResizer!.removeEventListener('touchend', this.stopEndDrag, false);
    this.endResizer!.removeEventListener(
      'touchcancel',
      this.cancelEndDrag,
      false,
    );
    document.onselectstart = null;
    document.ondragstart = null;
    const { schedulerData, left, top, width } = this.props;
    schedulerData._stopResizing();
    this.setState({
      left,
      top,
      width,
    });
  };

  render() {
    const {
      eventItem,
      isStart,
      isEnd,
      eventItemClick,
      schedulerData,
      isDragging,
      connectDragSource,
      eventItemTemplateResolver,
      renderEvent,
    } = this.props;
    const { config, localeMoment } = schedulerData;
    const { left, width, top } = this.state;
    let bgColor = config.defaultEventBgColor;
    if (eventItem.bgColor) {
      bgColor = eventItem.bgColor;
    }
    const content = (
      <EventItemPopover
        localeMoment={localeMoment}
        config={schedulerData.config}
        eventItem={eventItem}
        title={eventItem.title}
        startTime={eventItem.start}
        endTime={eventItem.end}
      />
    );
    let startResizeDiv = <div/>;
    if (this.startResizable(this.props)) {
      startResizeDiv = (
        <div
          className="event-resizer event-start-resizer"
          ref={(ref) => (this.startResizer = ref as HTMLDivElement)}
        />
      );
    }
    let endResizeDiv = <div/>;
    if (this.endResizable(this.props)) {
      endResizeDiv = (
        <div
          className="event-resizer event-end-resizer"
          ref={(ref) => (this.endResizer = ref as HTMLDivElement)}
        />
      );
    }
    let eventItemTemplate = (
      <div key={eventItem.id} style={{ height: config.eventItemHeight }}>
        {renderEvent!(eventItem)}
      </div>
    );
    if (eventItemTemplateResolver) {
      eventItemTemplate = eventItemTemplateResolver(
        schedulerData,
        eventItem,
        bgColor,
        isStart,
        isEnd,
        'event-item',
        config.eventItemHeight,
        undefined,
      );
    }
    const eventElement = (
      <div
        className={classNames({ isResizing: this.state.isResizing }, 'timeline-event')}
        style={{ left, width, top, opacity: isDragging ? 0.2 : 1 }}
        onClick={() => {
          if (eventItemClick) {
            eventItemClick(schedulerData, eventItem);
          }
        }}
      >
        {connectDragSource(eventItemTemplate)}
        {startResizeDiv}
        {endResizeDiv}
      </div>
    );
    return schedulerData._isResizing() || !config.eventItemPopoverEnabled || !eventItem.showPopover ||
    isDragging ? (
        <div style={{ position: 'relative' }}>
          {eventElement}
        </div>
      ) : (
        <Popover
          placement="bottomLeft"
          content={content}
          trigger="hover"
          style={{ position: 'relative' }}
        >
          {eventElement}
        </Popover>
      );
  }

  startResizable = (props: EventItemProps) => {
    const { eventItem, isInPopover, schedulerData } = props;
    const { config } = schedulerData;
    return (config.startResizable && !isInPopover &&
      (eventItem.resizable === undefined || eventItem.resizable) && (eventItem.startResizable === undefined ||
        eventItem.startResizable !== false));
  };
  endResizable = (props: EventItemProps) => {
    const { eventItem, isInPopover, schedulerData } = props;
    const { config } = schedulerData;
    return (config.endResizable && !isInPopover && (eventItem.resizable === undefined || eventItem.resizable)
      && (eventItem.endResizable === undefined || eventItem.endResizable !== false));
  };
  subscribeResizeEvent = (props: EventItemProps) => {
    if (this.startResizer) {
      if (supportTouch) {
        // this.startResizer!.removeEventListener('touchstart', this.initStartDrag, false);
        // if (this.startResizable(props))
        //     this.startResizer!.addEventListener('touchstart', this.initStartDrag, false);
      } else {
        this.startResizer.removeEventListener(
          'mousedown',
          this.initStartDrag,
          false,
        );
        if (this.startResizable(props)) {
          this.startResizer.addEventListener(
            'mousedown',
            this.initStartDrag,
            false,
          );
        }
      }
    }
    if (this.endResizer) {
      if (supportTouch) {
        // this.endResizer!.removeEventListener('touchstart', this.initEndDrag, false);
        // if (this.endResizable(props))
        //     this.endResizer!.addEventListener('touchstart', this.initEndDrag, false);
      } else {
        this.endResizer.removeEventListener(
          'mousedown',
          this.initEndDrag,
          false,
        );
        if (this.endResizable(props)) {
          this.endResizer.addEventListener(
            'mousedown',
            this.initEndDrag,
            false,
          );
        }
      }
    }
  };
}

export default EventItem;
