import React, { Component } from 'react';

interface EventItemPopoverProps {
  title: string;
  startTime: string;
  endTime: string;
  eventItem: any;
  config: any;
  localeMoment: any;
}

class EventItemPopover extends Component<EventItemPopoverProps> {
  render() {
    const {
      localeMoment,
      config,
      title,
      startTime,
      endTime,
    } = this.props;
    const start = localeMoment(startTime);
    const end = localeMoment(endTime);
    const dateFormat = config.eventItemPopoverDateFormat;
    return (
      <div style={{ width: '300px' }}>
        <div className="header2-text" title={title}>
          {title}
        </div>
        <span className="header1-text">{start.format('HH:mm')}</span>
        <span className="help-text" style={{ marginLeft: '8px' }}>
          {start.format(dateFormat)}
        </span>
        <span className="header2-text" style={{ marginLeft: '8px' }}>
                -
        </span>
        <span className="header1-text" style={{ marginLeft: '8px' }}>
          {end.format('HH:mm')}
        </span>
        <span className="help-text" style={{ marginLeft: '8px' }}>
          {end.format(dateFormat)}
        </span>
      </div>
    );
  }
}

export default EventItemPopover;
