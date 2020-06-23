import React, { Component } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';

import EventCard from '../eventCard';

interface TaskItemProps {
  task: object;
}

class TaskItem extends Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

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
    const { task, isDragging, connectDragSource } = this.props;
    return (
      <>
        {
          connectDragSource(
            <div>
              <EventCard name={task.name}/>
            </div>,
          )}
      </>
    );
  }
}

export default TaskItem;
