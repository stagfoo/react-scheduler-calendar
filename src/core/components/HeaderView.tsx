import moment from 'moment';
import React from 'react';

import { CellUnits } from 'src/core';
import { configType } from 'src/core/constants/config';

export interface HeaderViewProps {
  headers: any;
  headerHeight: number;
  cellWidth: number;
  minuteStepsInHour: number;
  cellUnit: any;
  config: configType;
  localeMoment: typeof moment;
  nonAgendaCellHeaderTemplateResolver?: (...args: any[]) => any;
}

export class HeaderView extends React.Component<HeaderViewProps> {
  render() {
    const {
      headers, headerHeight, cellUnit, cellWidth, config,
      minuteStepsInHour, localeMoment, nonAgendaCellHeaderTemplateResolver,
    } = this.props;
    let headerList = [];
    let style = {};
    if (cellUnit === CellUnits.Hour) {
      headers.forEach((item: any, index: number) => {
        if (index % minuteStepsInHour === 0) {
          const datetime = localeMoment(item.time);
          style = item.nonWorkingTime
            ? {
              width: cellWidth * minuteStepsInHour,
              color: config.nonWorkingTimeHeadColor,
              backgroundColor: config.nonWorkingTimeHeadBgColor,
            }
            : { width: cellWidth * minuteStepsInHour };
          if (index === headers.length - minuteStepsInHour) {
            style = item.nonWorkingTime
              ? {
                color: config.nonWorkingTimeHeadColor,
                backgroundColor: config.nonWorkingTimeHeadBgColor,
              }
              : {};
          }
          const pFormattedList = config.nonAgendaDayCellHeaderFormat
            .split('|')
            .map((time: any) => datetime.format(time));
          let element;
          if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
            element = nonAgendaCellHeaderTemplateResolver(
              item,
              pFormattedList,
              style,
            );
          } else {
            const pList = pFormattedList.map((p: any, i: number) => (
              <div key={i}>{p}</div>
            ));
            element = (
              <th key={item.time} className="header3-text" style={style}>
                <div>{pList}</div>
              </th>
            );
          }
          headerList.push(element);
        }
      });
    } else {
      headerList = headers.map((item: any, index: number) => {
        const datetime = localeMoment(item.time);
        style = item.nonWorkingTime
          ? {
            width: cellWidth,
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          }
          : { width: cellWidth };
        if (index === headers.length - 1) {
          style = item.nonWorkingTime
            ? {
              color: config.nonWorkingTimeHeadColor,
              backgroundColor: config.nonWorkingTimeHeadBgColor,
            }
            : {};
        }
        const pFormattedList = config.nonAgendaOtherCellHeaderFormat
          .split('|')
          .map((time: any) => datetime.format(time));
        if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
          return nonAgendaCellHeaderTemplateResolver(
            item,
            pFormattedList,
            style,
          );
        }
        const pList = pFormattedList.map((p: any, i: number) => (
          <div key={i}>{p}</div>
        ));
        return (
          <th key={item.time} className="header3-text" style={style}>
            <div>{pList}</div>
          </th>
        );
      });
    }
    return (
      <thead>
        <tr style={{ height: headerHeight }}>{headerList}</tr>
      </thead>
    );
  }
}

export default HeaderView;
