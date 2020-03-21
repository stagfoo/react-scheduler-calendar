import React, { Component } from 'react';
interface ResourceListProps {
  schedulerData: object;
  newEvent: (...args: any[]) => any;
  resourceDndSource: object;
}
class ResourceList extends Component<any, {}> {

  render() {
    const { schedulerData, newEvent, resourceDndSource } = this.props;
    const DnDResourceItem = resourceDndSource.getDragSource();
    const resources = schedulerData.resources;
    const resourceList = resources.map((item: any) => {
      return (
        <DnDResourceItem key={item.id} resource={item} newEvent={newEvent} schedulerData={schedulerData} />
      );
    });
    return <ul>{resourceList}</ul>;
  }
}
export default ResourceList;
