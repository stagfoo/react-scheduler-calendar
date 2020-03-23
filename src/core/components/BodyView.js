import React, {Component} from 'react'
import {PropTypes} from 'prop-types'

class BodyView extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        schedulerData: PropTypes.object.isRequired,
    };

    render() {

        const {schedulerData} = this.props;
        const {renderData, headers, config, behaviors} = schedulerData;
        const cellWidth = schedulerData.getContentCellWidth();

        const displayRenderData = renderData.filter(o => o.render);
        const tableRows = displayRenderData.map((item) => {
            const rowCells = headers.map((header, index) => {
                const key = item.slotId + '_' + header.time;
                let style = index === headers.length - 1 ? {} : {width: cellWidth, backgroundColor: 'white'};
                if(header.nonWorkingTime)
                    style = {...style, backgroundColor: config.nonWorkingTimeBodyBgColor};
                if(item.groupOnly)
                    style = {...style, backgroundColor: config.groupOnlySlotColor};
                if(behaviors.getNonAgendaViewBodyCellBgColorFunc){
                    const cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(schedulerData, item.slotId, header);
                    if(cellBgColor)
                        style = {...style, backgroundColor: cellBgColor};
                }
                return (
                    <td key={key} style={style}><div></div></td>
                )
            });

            return (
                <tr key={item.slotId} style={{height: item.rowHeight}}>
                    {rowCells}
                </tr>
            );
        });

        return (
            <tbody>
                {tableRows}
            </tbody>
        );
    }
}

export default BodyView
