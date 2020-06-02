import { Popover } from 'antd';
import React, { Component } from 'react';
import EventItemPopover from './EventItemPopover';

interface AgendaEventItemProps {
  schedulerData: any;
  eventItem: any;
  isStart: boolean;
  isEnd: boolean;
  subtitleGetter?: (...args: any[]) => any;
  eventItemClick?: (...args: any[]) => any;
  viewEventClick?: (...args: any[]) => any;
  viewEventText?: string;
  viewEvent2Click?: (...args: any[]) => any;
  viewEvent2Text?: string;
  eventItemTemplateResolver?: (...args: any[]) => any;
}

class AgendaEventItem extends Component<AgendaEventItemProps, {}> {
  constructor(props: AgendaEventItemProps) {
    super(props);
  }

  render() {
    const { eventItem, isStart, isEnd, eventItemClick, schedulerData, eventItemTemplateResolver } = this.props;
    const { config } = schedulerData;
    const roundCls = isStart ? (isEnd ? 'round-all' : 'round-head') : isEnd ? 'round-tail' : 'round-none';
    let bgColor = config.defaultEventBgColor;
    if (eventItem.bgColor) {
      bgColor = eventItem.bgColor;
    }
    const titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, eventItem);
    const content = <EventItemPopover {...this.props} title={eventItem.title} startTime={eventItem.start}
      endTime={eventItem.end}/>;
    let eventItemTemplate = (
      <div
        className={roundCls + ' event-item'}
        key={eventItem.id}
        style={{ height: config.eventItemHeight, maxWidth: config.agendaMaxEventWidth, backgroundColor: bgColor }}
      >
        <span style={{ marginLeft: '10px', lineHeight: `${config.eventItemHeight}px` }}>{titleText}</span>
      </div>
    );
    if (eventItemTemplateResolver) {
      eventItemTemplate = eventItemTemplateResolver(schedulerData, eventItem, bgColor, isStart,
        isEnd, 'event-item', config.eventItemHeight, config.agendaMaxEventWidth);
    }
    return config.eventItemPopoverEnabled ? (
      <Popover placement="bottomLeft" content={content} trigger="hover">
        <a
          className="day-event"
          onClick={() => {
            if (eventItemClick) {
              eventItemClick(schedulerData, eventItem);
            }
          }}
        >
          {eventItemTemplate}
        </a>
      </Popover>
    ) : (
      <span>
        <a
          className="day-event"
          onClick={() => {
            if (eventItemClick) {
              eventItemClick(schedulerData, eventItem);
            }
          }}
        >
          {eventItemTemplate}
        </a>
      </span>
    );
  }
}

export default AgendaEventItem;
