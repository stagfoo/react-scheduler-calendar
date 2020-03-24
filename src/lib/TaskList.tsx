import React, { Component } from 'react';
interface TaskListProps {
    schedulerData: object;
    newEvent: (...args: any[]) => any;
    taskDndSource: object;
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
              <div style={{marginTop: 20 }}>
                <DnDTaskItem key={item.id} task={item} newEvent={newEvent} schedulerData={schedulerData} />
              </div>
            );
        });
        return <ul>{taskList}</ul>;
    }
}
export default TaskList;
