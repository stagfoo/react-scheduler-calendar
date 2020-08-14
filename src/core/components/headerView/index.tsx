import classnames from 'classnames';
import moment from 'moment';
import React from 'react';
import { configType } from 'src/core/constants/config';

import { CellUnits } from 'src/core';
import styles from './index.module.scss';

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
                width: cellWidth * minuteStepsInHour,
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
              <div key={i} className={classnames(styles.time)}>{p}</div>
            ));
            element = (
              <div key={item.time} className={classnames(styles.timeSlot)} style={style}>
                {pList}
              </div>
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
          <div key={i} className={classnames(styles.time)}>{p}</div>
        ));
        return (
          <div key={item.time} className={classnames(styles.timeSlot)} style={style}>
            {pList}
          </div>
        );
      });
    }
    return (
      <div className={classnames(styles.schedulerHeader)} style={{ height: headerHeight }}>
        {headerList}
      </div>
    );
  }
}

export default HeaderView;
