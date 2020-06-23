import React, { Component } from 'react';
import { DnDSource, SchedulerData } from 'src/core';

interface TaskListProps {
  schedulerData: SchedulerData;
  newEvent: (...args: any[]) => any;
  taskDndSource: DnDSource;
}

class TaskList extends Component<any, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { schedulerData, newEvent, taskDndSource } = this.props;
    const DnDTaskItem = taskDndSource.getDragSource();
    const tasks = schedulerData.eventGroups;
    const taskList = tasks.map((item: any) => {
      return (
        <div key={item.id} style={{ marginTop: 20 }}>
          <DnDTaskItem task={item} newEvent={newEvent} schedulerData={schedulerData}/>
        </div>
      );
    });
    return <ul>{taskList}</ul>;
  }
}

export default TaskList;
