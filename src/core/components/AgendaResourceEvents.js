import React from 'react'
import {PropTypes} from 'prop-types'
import AgendaEventItem from './AgendaEventItem'
import {DATE_FORMAT} from '../index'

class AgendaResourceEvents extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
        resourceEvents: PropTypes.object.isRequired,
        subtitleGetter: PropTypes.func,
        eventItemClick: PropTypes.func,
        viewEventClick: PropTypes.func,
        viewEventText:PropTypes.string,
        viewEvent2Click: PropTypes.func,
        viewEvent2Text: PropTypes.string,
        slotClickedFunc: PropTypes.func,
        slotItemTemplateResolver: PropTypes.func
    };

    render(){
        const {schedulerData, resourceEvents, slotClickedFunc, slotItemTemplateResolver} = this.props;
        const {startDate, endDate, config, localeMoment} = schedulerData;
        const agendaResourceTableWidth = schedulerData.getResourceTableWidth();
        const width = agendaResourceTableWidth - 2;

        const events = [];
        resourceEvents.headerItems.forEach((item) => {
            const start = localeMoment(startDate).format(DATE_FORMAT),
                end = localeMoment(endDate).add(1, 'days').format(DATE_FORMAT),
                headerStart = localeMoment(item.start).format(DATE_FORMAT),
                headerEnd = localeMoment(item.end).format(DATE_FORMAT);

            if(start === headerStart && end === headerEnd) {
                item.events.forEach((evt) => {
                    const durationStart = localeMoment(startDate);
                    const durationEnd = localeMoment(endDate).add(1, 'days');
                    const eventStart = localeMoment(evt.eventItem.start);
                    const eventEnd = localeMoment(evt.eventItem.end);
                    const isStart = eventStart >= durationStart;
                    const isEnd = eventEnd < durationEnd;
                    const eventItem = <AgendaEventItem
                                        {...this.props}
                                        key={evt.eventItem.id}
                                        eventItem={evt.eventItem}
                                        isStart={isStart}
                                        isEnd={isEnd}
                                    />;
                    events.push(eventItem);
                });
            }
        });

        const a = slotClickedFunc ? <a onClick={() => {
            slotClickedFunc(schedulerData, resourceEvents);
        }}>{resourceEvents.slotName}</a>
            : <span>{resourceEvents.slotName}</span>;
        let slotItem = (
            <div style={{width: width}} title={resourceEvents.slotName} className="overflow-text header2-text">
                {a}
            </div>
        );
        if(slotItemTemplateResolver) {
            const temp = slotItemTemplateResolver(schedulerData, resourceEvents, slotClickedFunc, width, "overflow-text header2-text");
            if(temp)
                slotItem = temp;
        }

        return (
            <tr style={{minHeight: config.eventItemLineHeight + 2}}>
                <td data-resource-id={resourceEvents.slotId}>
                    {slotItem}
                </td>
                <td>
                    <div className="day-event-container">
                        {events}
                    </div>
                </td>
            </tr>
        );
    }
}

export default AgendaResourceEvents
