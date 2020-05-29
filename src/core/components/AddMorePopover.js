import { Col, Row } from 'antd';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DnDSource } from '../DnDSource';
import EventItem from './EventItem';

class AddMorePopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dndSource: new DnDSource((p) => p.eventItem, EventItem),
    };
  }

  static propTypes = {
    schedulerData: PropTypes.object.isRequired,
    headerItem: PropTypes.object.isRequired,
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    closeAction: PropTypes.func.isRequired,
    subtitleGetter: PropTypes.func,
    moveEvent: PropTypes.func,
    eventItemClick: PropTypes.func,
    viewEventClick: PropTypes.func,
    viewEventText: PropTypes.string,
    viewEvent2Click: PropTypes.func,
    viewEvent2Text: PropTypes.string,
    eventItemTemplateResolver: PropTypes.func,
  };

  render() {
    const { headerItem, left, top, height, closeAction, schedulerData } = this.props;
    const { config, localeMoment } = schedulerData;
    const { time, start, end, events } = headerItem;
    const header = localeMoment(time).format(config.addMorePopoverHeaderFormat);
    const durationStart = localeMoment(start);
    const durationEnd = localeMoment(end);
    const eventList = [];
    let i = 0;
    const DnDEventItem = this.state.dndSource.getDragSource();
    events.forEach((evt) => {
      if (evt) {
        i++;
        const eventStart = localeMoment(evt.eventItem.start);
        const eventEnd = localeMoment(evt.eventItem.end);
        const isStart = eventStart >= durationStart;
        const isEnd = eventEnd < durationEnd;
        const eventItemLeft = 10;
        const eventItemWidth = 138;
        const eventItemTop = 12 + i * config.eventItemLineHeight;
        const eventItem = <DnDEventItem
          {...this.props}
          key={evt.eventItem.id}
          eventItem={evt.eventItem}
          leftIndex={0}
          isInPopover={true}
          isStart={isStart}
          isEnd={isEnd}
          rightIndex={1}
          left={eventItemLeft}
          width={eventItemWidth}
          top={eventItemTop}
        />;
        eventList.push(eventItem);
      }
    });

    return (
      <div className="add-more-popover-overlay" style={{ left, top, height, width: '170px' }}>
        <Row type="flex" justify="space-between" align="middle">
          <Col span="22">
            <span className="base-text">{header}</span>
          </Col>
          <Col span="2">
            <span onClick={() => {
              closeAction(undefined);
            }}/>
          </Col>
        </Row>
        {eventList}
      </div>
    );
  }
}

export default AddMorePopover;
