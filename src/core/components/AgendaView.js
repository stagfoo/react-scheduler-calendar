import { PropTypes } from 'prop-types';
import React, { Component } from 'react';
import AgendaResourceEvents from './AgendaResourceEvents';

class AgendaView extends Component {

  static propTypes = {
    schedulerData: PropTypes.object.isRequired,
    subtitleGetter: PropTypes.func,
    eventItemClick: PropTypes.func,
    viewEventClick: PropTypes.func,
    viewEventText: PropTypes.string,
    viewEvent2Click: PropTypes.func,
    viewEvent2Text: PropTypes.string,
    slotClickedFunc: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }


  render() {

    const { schedulerData } = this.props;
    const { config } = schedulerData;
    const { renderData } = schedulerData;
    const agendaResourceTableWidth = schedulerData.getResourceTableWidth();
    const tableHeaderHeight = schedulerData.getTableHeaderHeight();
    const resourceEventsList = renderData.map((item) => <AgendaResourceEvents
      {...this.props}
      resourceEvents={item}
      key={item.slotId}/>);
    const resourceName = schedulerData.isEventPerspective ? config.taskName : config.resourceName;
    const agendaViewHeader = config.agendaViewHeader;

    return (
      <tr>
        <td>
          <table className="scheduler-table">
            <thead>
              <tr style={{ height: tableHeaderHeight }}>
                <th style={{ width: agendaResourceTableWidth }} className="header3-text">{resourceName}</th>
                <th className="header3-text">{agendaViewHeader}</th>
              </tr>
            </thead>
            <tbody>
              {resourceEventsList}
            </tbody>
          </table>
        </td>
      </tr>
    );
  }
}

export default AgendaView;
