import React, { Component } from 'react';
import { DnDSource, SchedulerData } from 'src/core';

interface ResourceListProps {
  schedulerData: SchedulerData;
  newEvent: (...args: any[]) => any;
  resourceDndSource: DnDSource;
}

class ResourceList extends Component<ResourceListProps> {
  render() {
    const { schedulerData, newEvent, resourceDndSource } = this.props;
    const DnDResourceItem = resourceDndSource.getDragSource();
    const resources = schedulerData.resources;
    const resourceList = resources.map((item: any) => (
      <DnDResourceItem key={item.id} resource={item} newEvent={newEvent} schedulerData={schedulerData}/>
    ));
    return <ul>{resourceList}</ul>;
  }
}

export default ResourceList;
