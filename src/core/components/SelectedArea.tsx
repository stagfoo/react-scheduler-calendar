import React, { Component } from 'react';

interface SelectedAreaProps {
  schedulerData: any;
  left: number;
  width: number;
}

class SelectedArea extends Component<SelectedAreaProps> {
  constructor(props: SelectedAreaProps) {
    super(props);
  }

  render() {
    const { left, width, schedulerData } = this.props;
    const { config } = schedulerData;
    return (
      <div
        className="selected-area"
        style={{ left, width, top: 0, bottom: 0, backgroundColor: config.selectedAreaColor }}
      />
    );
  }
}

export default SelectedArea;
