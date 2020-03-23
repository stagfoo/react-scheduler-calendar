import React, {Component} from 'react';

interface AddMoreProps {
  schedulerData: any;
  number: number;
  left: number;
  width: number;
  top: number;
  clickAction: (...args: any[]) => any;
  headerItem: any;
}

class AddMore extends Component<AddMoreProps> {
  constructor(props: AddMoreProps) {
    super(props);
  }

  render() {
    const {number, left, width, top, clickAction, headerItem, schedulerData} = this.props;
    const {config} = schedulerData;
    const content = '+' + number + 'more';
    return (
      <div
        className="timeline-event"
        style={{left: left, width: width, top: top}}
        onClick={() => {
          clickAction(headerItem);
        }}
      >
        <div style={{height: config.eventItemHeight, color: '#999', textAlign: 'center'}}>{content}</div>
      </div>
    );
  }
}

export default AddMore;
