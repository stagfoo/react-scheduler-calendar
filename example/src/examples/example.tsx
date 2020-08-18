import moment from 'moment';
import React, { Component } from 'react';
import { DragElementWrapper, DragSourceOptions } from 'react-dnd';
import Scheduler, { DnDSource, SchedulerData, ViewTypes } from 'src';
import DemoData, { todayDate } from 'src/_mockData/DemoData';
import styles from './index.module.scss';
import 'src/core/styles/style.css';
import { DnDTypes } from 'src/lib';
import ResourceItem from 'src/lib/ResourceItem';
import ResourceList from 'src/lib/ResourceList';
import withDragDropContext from 'src/lib/withDnDContext';
import CustomDragLayer from '../components/CustomDragLayer';
import TaskItem from '../components/TaskItem';
import TaskList from '../components/TaskList';

import config from '../overrideConfig';

interface CalendarSchedulerState {
  viewModel: SchedulerData;
  taskDndSource: DnDSource;
  resourceDndSource: DnDSource;
  showBody: boolean;
}

class CalendarScheduler extends Component<{}, CalendarSchedulerState> {
  private events = DemoData.eventsOfOverlap;

  constructor(props: any) {
    super(props);
    const newConfig: Partial<typeof config> = {
      nonWorkingTimeHeadBgColor: '#fff',
      nonWorkingTimeHeadColor: '#222',
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
    schedulerData.setEvents(this.events);
    schedulerData.setScrollToSpecialMoment(true);
    this.state = {
      viewModel: schedulerData,
      taskDndSource: new DnDSource(
        (prop: any) => prop.task,
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
      showBody: false,
    };
  }

  componentDidMount(): void {
    setTimeout(() => {
      this.setState({ showBody: true });
    }, 1000);
  }

  renderEvent = (eventItem: any, connectDragSource: DragElementWrapper<DragSourceOptions>) => {
    return connectDragSource(<div className='event'>render event<span>{eventItem.id}</span></div>);
  };

  renderResource = (resource: any) => <span>{resource.slotName}</span>;

  handleConflict = (): void => {
    this.setState({ showBody: false });
    setTimeout(() => {
      this.state.viewModel.setScrollToSpecialMoment(true);
      this.setState({ showBody: true });
    }, 1000);
  };

  render() {
    const { viewModel, taskDndSource, resourceDndSource, showBody } = this.state;
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
              <button onClick={() => {
                viewModel.setEvents([...this.events]);
                this.setState({
                  viewModel,
                });
              }}>
                Reset
              </button>
              <button onClick={() => {
                viewModel.addEvent(
                  {
                    id: new Date().getTime(),
                    start: `${todayDate(9).format('YYYY-MM-DD HH:mm:ss')}`,
                    end: `${todayDate(11.5).format('YYYY-MM-DD HH:mm:ss')}`,
                    // start: `${todayDate(10.5).format('YYYY-MM-DD HH:mm:ss')}`,
                    // end: `${todayDate(12.5).format('YYYY-MM-DD HH:mm:ss')}`,
                    // start: `${todayDate(12.5).format('YYYY-MM-DD HH:mm:ss')}`,
                    // end: `${todayDate(14).format('YYYY-MM-DD HH:mm:ss')}`,
                    resourceId: 'r1',
                    title: 'I am finished',
                    bgColor: '#D9D9D9',
                    groupId: 1,
                    groupName: 'Job1',
                    item: {},
                  },
                );
                this.setState({
                  viewModel,
                });
              }}>
                Add Event
              </button>
              <button onClick={() => {
                const events = [...this.events];
                events[0] = {
                  ...events[0],
                  end: `${todayDate(13).format('YYYY-MM-DD HH:mm:ss')}`,
                };
                viewModel.setEvents(events);
                this.setState({
                  viewModel,
                });
              }}>
                Increase Event Duration
              </button>
              <button onClick={() => {
                const events = [...this.events];
                events[0] = {
                  ...events[0],
                  end: `${todayDate(11).format('YYYY-MM-DD HH:mm:ss')}`,
                };
                viewModel.setEvents(events);
                this.setState({
                  viewModel,
                });
              }}>
                Decrease Event Duration
              </button>
            </div>
          </div>
          <div className={styles.rightPane}>
            <Scheduler
              renderResource={this.renderResource}
              schedulerData={viewModel}
              prevClick={this.prevClick}
              nextClick={this.nextClick}
              onTodayClick={this.handleTodayClick}
              onSelectDate={this.onSelectDate}
              onViewChange={this.onViewChange}
              updateEventStart={this.updateEventStart}
              updateEventEnd={this.updateEventEnd}
              moveEvent={this.moveEvent}
              movingEvent={this.movingEvent}
              newEvent={this.newEvent}
              dndSources={dndSources}
              toggleExpandFunc={this.toggleExpandFunc}
              renderEvent={this.renderEvent}
              eventItemClick={console.log}
              showBody={showBody}
            />
          </div>
        </div>
      </div>
    );
  }

  prevClick = (schedulerData: any) => {
    // schedulerData.prev();
    schedulerData.setEvents(this.events);
    this.setState({
      viewModel: schedulerData,
      showBody: false,
    });

    setTimeout(() => {
      this.setState({ showBody: true });
    }, 2000);
  };

  nextClick = (schedulerData: any) => {
    // schedulerData.next();
    schedulerData.setEvents(this.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  handleTodayClick = (schedulerData: any) => {
    schedulerData.setEvents(this.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onViewChange = (schedulerData: any, view: any) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.config.creatable = !view.isEventPerspective;
    schedulerData.setEvents(this.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onSelectDate = (schedulerData: any, date: any) => {
    // schedulerData.setDate(date);
    schedulerData.setEvents(this.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  newEvent = (schedulerData: any, slotId: any, slotName: any, start: any, end: any, type: string, item: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Do you want to create a new event?
    {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}, type: ${type}, item: ${item}}`)) {
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
    if (confirm(`Do you want to adjust the start of the event? {eventId: ${event.id},
    eventTitle: ${event.title}, newStart: ${newStart}}`)) {
      schedulerData.updateEventStart(event, newStart);
    }
    this.setState({
      viewModel: schedulerData,
    });
  };

  updateEventEnd = (schedulerData: any, event: any, newEnd: any) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Do you want to adjust the end of the event? {eventId: ${event.id},
    eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
      schedulerData.updateEventEnd(event, newEnd);
    }
    this.setState({
      viewModel: schedulerData,
    });
  };

  moveEvent = (schedulerData: any, event: any, slotId: any, slotName: any, start: any, end: any) => {
    console.log(`{eventId: ${event.id}, eventTitle: ${event.title},
    newSlotId: ${slotId}, newSlotName: ${slotName}, newStart: ${start}, newEnd: ${end}`);
    schedulerData.moveEvent(event, slotId, slotName, start, end);
    this.setState({
      viewModel: schedulerData,
    });
  };

  movingEvent = (schedulerData: any, slotId: any, slotName: any, newStart: any, newEnd: any,
    action: any, type: any, item: any) => {
    // console.log('moving event', newStart, newEnd, action, type, item);
  };

  toggleExpandFunc = (schedulerData: any, slotId: any) => {
    schedulerData.toggleExpandStatus(slotId);
    this.setState({
      viewModel: schedulerData,
    });
  };
}

export default withDragDropContext(CalendarScheduler);
