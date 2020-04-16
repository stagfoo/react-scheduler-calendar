import {Card} from 'antd'
import React, {Component} from 'react';

import config from './override-config';
import Scheduler, {DnDSource, SchedulerData, ViewTypes} from './';
import './core/styles/style.css';
import styles from './core/styles/index.module.scss';
import withDragDropContext from './lib/withDnDContext';
import CustomDragLayer from './lib/CustomDragLayer';
import {DnDTypes} from './lib/DnDTypes';
import ResourceItem from './lib/ResourceItem';
import ResourceList from './lib/ResourceList';
import TaskItem from './lib/TaskItem';
import TaskList from './lib/TaskList';
import DemoData from './_mockData/DemoData';
import moment from "moment";

interface CalendarSchedulerState {
  viewModel: any;
  taskDndSource: any;
  resourceDndSource: any;
}

class CalendarScheduler extends Component<{}, CalendarSchedulerState> {
  constructor(props: any) {
    super(props);
    const newConfig: Partial<typeof config> = {
      nonWorkingTimeHeadBgColor: '#fff',
      eventItemHeight: 59,
      eventItemLineHeight: 59,
      dayCellWidth: 30,
      besidesWidth: 470,
    };
    const schedulerData = new SchedulerData(
      moment().format('YYYY-MM-DD'),
      ViewTypes.Day,
      false,
      false,
      { ...config, ...newConfig },
    );
    schedulerData.localeMoment.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    schedulerData.setScrollToSpecialMoment(true);
    this.state = {
      viewModel: schedulerData,
      taskDndSource: new DnDSource(
        (prop: any) => {
          return prop.task;
        },
        TaskItem,
        DnDTypes.TASK,
      ),
      resourceDndSource: new DnDSource(
        // tslint:disable-next-line:no-shadowed-variable
        (prop: any) => {
          return prop.resource;
        },
        ResourceItem,
        DnDTypes.RESOURCE,
      ),
    };
  }

  renderResourceList(resourceName: string, renderData: any, listRef: any) {
    return (
      <div className={styles.resourceListWrapper}>
        <div className={styles.resourceTitle} style={{
          height: `${config.tableHeaderHeight}px`,
          lineHeight: `${config.tableHeaderHeight}px`,
          textAlign: 'center'
        }}>{resourceName}</div>
        <ul className={styles.resourceList} ref={listRef}>
          { renderData.map((resource: any) => {
            return (<li key={resource.slotId} className={styles.resourceItem} style={{
              height: `${resource.rowHeight}px`,
              lineHeight: `${resource.rowHeight}px`,
              textAlign: 'center'
            }}>{resource.slotName}</li>)
          }) }
        </ul>
      </div>
    );
  }

  render() {
    const {viewModel, taskDndSource, resourceDndSource} = this.state;
    const dndList = viewModel.isEventPerspective ? (
      <ResourceList schedulerData={viewModel} newEvent={this.newEvent} resourceDndSource={resourceDndSource}/>
    ) : (
      <TaskList schedulerData={viewModel} newEvent={this.newEvent} taskDndSource={taskDndSource}/>
    );
    // register the external DnDSources
    const dndSources = [taskDndSource, resourceDndSource];
    return (
      <div className={styles.container}>
        <CustomDragLayer/>
        <div className={styles.content}>
          <div className={styles.leftPane}>
            <div className={styles.jobList}>
              {dndList}
            </div>
            <div className={styles.jobDetail}>
              <Card  className={styles.jobDetailCard} title={'Job Detail'}>
                Job Detail here.
              </Card>
            </div>
          </div>
          <div className={styles.rightPane}>
            <Scheduler
              schedulerData={viewModel}
              renderResourceList={this.renderResourceList}
              prevClick={this.prevClick}
              nextClick={this.nextClick}
              onTodayClick={this.handleTodayClick}
              onSelectDate={this.onSelectDate}
              onViewChange={this.onViewChange}
              eventItemClick={this.eventClicked}
              viewEventClick={this.ops1}
              viewEventText='Delete'
              viewEvent2Text='Detail'
              viewEvent2Click={this.ops2}
              updateEventStart={this.updateEventStart}
              updateEventEnd={this.updateEventEnd}
              moveEvent={this.moveEvent}
              movingEvent={this.movingEvent}
              newEvent={this.newEvent}
              subtitleGetter={this.subtitleGetter}
              dndSources={dndSources}
              toggleExpandFunc={this.toggleExpandFunc}
            />
          </div>
        </div>
      </div>
    );
  }

  prevClick = (schedulerData: any) => {
    schedulerData.prev();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };
  nextClick = (schedulerData: any) => {
    schedulerData.next();
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };

  handleTodayClick = (schedulerData: any) => {
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };
  onViewChange = (schedulerData: any, view: any) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.config.creatable = !view.isEventPerspective;
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };
  onSelectDate = (schedulerData: any, date: any) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(DemoData.eventsForTaskView);
    this.setState({
      viewModel: schedulerData,
    });
  };
  eventClicked = (schedulerData: any, event: any) => {
    alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
  };
  ops1 = (schedulerData: any, event: any) => {
    schedulerData.removeEventById(event.id);
    this.setState({
      viewModel: schedulerData,
    });
  };
  ops2 = (schedulerData: any, event: any) => {
    alert(`You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`);
  };
  newEvent = (schedulerData: any, slotId: any, slotName: any, start: any, end: any, type: string, item: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}, type: ${type}, item: ${item}}`)) {
      let newFreshId = 0;
      schedulerData.events.forEach((event: { id: number }) => {
        if (event.id >= newFreshId) {
          newFreshId = event.id + 1;
        }
      });
      let newEvent: any = {
        id: newFreshId,
        title: 'New event you just created',
        start,
        end,
        resourceId: slotId,
        bgColor: '#03A9F4',
      };
      if (type !== DnDTypes.RESOURCE) {
        if (type === DnDTypes.TASK) {
          newEvent = {
            ...newEvent,
            groupId: item.id,
            groupName: item.name,
          };
        }
      } else {
        newEvent = {
          ...newEvent,
          groupId: slotId,
          groupName: slotName,
          resourceId: item.id,
        };
      }
      schedulerData.addEvent(newEvent);
      this.setState({
        viewModel: schedulerData,
      });
    }
  };
  updateEventStart = (schedulerData: any, event: any, newStart: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${newStart}}`)) {
      schedulerData.updateEventStart(event, newStart);
    }
    this.setState({
      viewModel: schedulerData,
    });
  };
  updateEventEnd = (schedulerData: any, event: any, newEnd: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
      schedulerData.updateEventEnd(event, newEnd);
    }
    this.setState({
      viewModel: schedulerData,
    });
  };
  moveEvent = (schedulerData: any, event: any, slotId: any, slotName: any, start: any, end: any) => {
    // eslint-disable-next-line no-restricted-globals
    // if (confirm(`Do you want to move the event? {eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`)) {
    console.log(`{eventId: ${event.id}, eventTitle: ${event.title}, newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`);
    schedulerData.moveEvent(event, slotId, slotName, start, end);
    this.setState({
      viewModel: schedulerData,
    });
    // }
  };
  movingEvent = (schedulerData: any, slotId: any, slotName: any, newStart: any, newEnd: any,
                 action: any, type: any, item: any) => {
    // console.log('moving event', newStart, newEnd, action, type, item);
  };

  subtitleGetter = (schedulerData: any, event: { resourceId: any; groupName: any }) => {
    return schedulerData.isEventPerspective ? schedulerData.getResourceById(event.resourceId).name : event.groupName;
  };
  toggleExpandFunc = (schedulerData: any, slotId: any) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({
      viewModel: schedulerData,
    });
  }
}

export default withDragDropContext(CalendarScheduler);
