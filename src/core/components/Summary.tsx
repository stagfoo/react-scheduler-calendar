import React, {Component} from 'react';
import { SummaryPos } from '../index';
import {TextAlignProperty} from "csstype";

interface SummaryProps {
  schedulerData: any;
  summary: any;
  left: number;
  width: number;
  top: number;
}

class Summary extends Component<SummaryProps, {}> {
  constructor(props: SummaryProps) {
    super(props);
  }

  render() {
    const {summary, left, width, top, schedulerData} = this.props;
    const {config} = schedulerData;
    let color = config.summaryColor;
    if (summary.color) color = summary.color;
    let textAlign: TextAlignProperty = 'center';
    if (config.summaryPos === SummaryPos.TopRight || config.summaryPos === SummaryPos.BottomRight) {
      textAlign = 'right';
    } else if (config.summaryPos === SummaryPos.TopLeft || config.summaryPos === SummaryPos.BottomLeft) {
      textAlign = 'left';
    }
    let style: React.CSSProperties = {
      height: config.eventItemHeight,
      color: color,
      textAlign: textAlign,
      marginLeft: '6px',
      marginRight: '6px'
    };
    if (summary.fontSize) style = {...style, fontSize: summary.fontSize};
    return (
      <div className="timeline-event header2-text" style={{left: left, width: width, top: top, cursor: 'default'}}>
        <div style={style}>{summary.text}</div>
      </div>
    );
  }
}

export default Summary;
