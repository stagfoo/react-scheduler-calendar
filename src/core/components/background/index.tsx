import classnames from 'classnames';
import React, { Component } from 'react';
import { configType } from 'src/core/constants/config';
import styles from './index.module.scss';

interface BackgroundProps {
  renderData: any;
  headers: any;
  config: configType;
  cellWidth: number;
  width: number;
  schedulerContentBgTableRef: any;
}

class Background extends Component<BackgroundProps> {
  render() {
    const { renderData, headers, config, cellWidth, width, schedulerContentBgTableRef } = this.props;
    const displayRenderData = renderData.filter((o: any) => o.render);
    const tableRows = displayRenderData.map((item: any) => {
      const rowCells = headers.map((header: any, index: number) => {
        const key = item.slotId + '_' + header.time;
        let style: React.CSSProperties = { width: cellWidth, backgroundColor: 'white', display: 'inline-block' };
        if (header.nonWorkingTime) {
          style = {
            ...style,
            backgroundColor: config.nonWorkingTimeBodyBgColor,
          };
        }
        if (item.groupOnly) {
          style = { ...style, backgroundColor: config.groupOnlySlotColor };
        }

        const className = `${classnames(styles.bgTableCell)} bg-table-cell bg-td-${index % (60 / cellWidth)}`;
        return (
          <div key={key} style={style} className={className}/>
        );
      });
      return (
        <div className={classnames(styles.bgTableRow, 'bg-table-row')} key={item.slotId} style={{ height: item.rowHeight }}>
          {rowCells}
        </div>
      );
    });
    return (
      <div className="scheduler-bg">
        <div
          className={styles.schedulerBackGroundTable}
          style={{ width }}
          ref={schedulerContentBgTableRef}
        >
          {tableRows}
        </div>
      </div>
    );
  }
}

export default Background;
