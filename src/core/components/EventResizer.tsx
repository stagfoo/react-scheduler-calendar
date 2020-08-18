import classNames from 'classnames';
import React, { Component, CSSProperties } from 'react';

export interface EventResizerProps {
  resizerRef: (ref: HTMLDivElement | null) => void;
  className?: string;
  style?: CSSProperties;
}

class EventResizer extends Component<EventResizerProps> {
  render() {
    const { resizerRef, className, style } = this.props;
    return (
      <div
        className={classNames('event-resizer', className)}
        ref={resizerRef}
        style={style}
      />
    );
  }
}

export default EventResizer;