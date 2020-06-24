import React, { Component } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';

interface ResourceItemProps {
  resource: Record<string, unknown>;
}

class ResourceItem extends Component<any> {
  public componentDidMount() {
    const { connectDragPreview } = this.props;
    if (connectDragPreview) {
      // Use empty image as a drag preview so browsers don't draw it
      // and we can draw whatever we want on the custom drag layer instead.
      connectDragPreview(getEmptyImage(), {
        // IE fallback: specify that we'd rather screenshot the node
        // when it already knows it's being dragged so we can hide it with CSS.
        captureDraggingState: true,
      });
    }
  }

  render() {
    const { resource, isDragging, connectDragSource } = this.props;
    const dragContent = (
      <li style={{ color: 'red', fontWeight: 'bold', fontSize: '20px', listStyle: 'none' }}>
        {resource.name}
      </li>
    );
    return <div style={{ opacity: isDragging ? 0.8 : 1 }}>{connectDragSource(dragContent)}</div>;
  }
}

export default ResourceItem;
