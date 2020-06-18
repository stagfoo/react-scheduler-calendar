import React, { Component } from 'react';
import { configType } from 'src/core/constants/config';

interface BackgroundProps {
  renderData: any;
  headers: any;
  config: configType;
  cellWidth: number;
}

class Background extends Component<BackgroundProps, {}> {
  constructor(props: Readonly<BackgroundProps>) {
    super(props);
  }

  render() {
    const { renderData, headers, config, cellWidth } = this.props;
    const displayRenderData = renderData.filter((o: any) => o.render);
    const tableRows = displayRenderData.map((item: any) => {
      const rowCells = headers.map((header: any, index: number) => {
        const key = item.slotId + '_' + header.time;
        let style: React.CSSProperties =
          index === headers.length - 1
            ? {}
            : { width: cellWidth, backgroundColor: 'white' };
        if (header.nonWorkingTime) {
          style = {
            ...style,
            backgroundColor: config.nonWorkingTimeBodyBgColor,
          };
        }
        if (item.groupOnly) {
          style = { ...style, backgroundColor: config.groupOnlySlotColor };
        }

        const className = `bg-td-${index % (60 / cellWidth)}`;
        return (
          <td key={key} style={style} className={className}/>
        );
      });
      return (
        <tr key={item.slotId} style={{ height: item.rowHeight }}>
          {rowCells}
        </tr>
      );
    });
    return <tbody>{tableRows}</tbody>;
  }
}

export default Background;
