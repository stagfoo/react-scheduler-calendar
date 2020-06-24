import React, { Component } from 'react';

interface SelectedAreaProps {
  style?: React.CSSProperties;
}

class SelectedArea extends Component<SelectedAreaProps> {
  render() {
    const { style } = this.props;
    return (
      <div
        className="selected-area"
        style={style}
      />
    );
  }
}

export default SelectedArea;
