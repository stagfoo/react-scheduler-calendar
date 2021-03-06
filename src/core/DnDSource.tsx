import { DragSource, DragSourceConnector, DragSourceMonitor } from 'react-dnd';
import { DATETIME_FORMAT, DnDTypes, ViewTypes } from './index';

export class DnDSource {
  private resolveDragObjFunc: (args: any) => any;
  private DecoratedComponent: any;
  private dndType: DnDTypes;
  private dragSource: any;

  constructor(resolveDragObjFunc: (args: any) => any, DecoratedComponent: any, dndType = DnDTypes.EVENT) {
    this.resolveDragObjFunc = resolveDragObjFunc;
    this.DecoratedComponent = DecoratedComponent;
    this.dndType = dndType;
    this.dragSource = DragSource(this.dndType, this.getDragSpec(), this.getDragCollect)(this.DecoratedComponent);
  }

  getDragSpec = () => ({
    beginDrag: (props: any) => this.resolveDragObjFunc(props),
    endDrag: (props: any, monitor: DragSourceMonitor) => {
      if (!monitor.didDrop()) {
        return;
      }
      const { moveEvent, newEvent, schedulerData } = props;
      const { events, config, viewType, localeMoment } = schedulerData;
      const item = monitor.getItem();
      const type = monitor.getItemType();
      const dropResult = monitor.getDropResult();
      let slotId = dropResult.slotId;
      let slotName = dropResult.slotName;
      let newStart = dropResult.start;
      let newEnd = dropResult.end;
      let action = 'New';
      const isEvent = type === DnDTypes.EVENT;
      if (isEvent) {
        const event = item;
        if (viewType !== ViewTypes.Day) {
          const tmpMoment = localeMoment(newStart);
          newStart = localeMoment(event.start)
            .year(tmpMoment.year())
            .month(tmpMoment.month())
            .date(tmpMoment.date())
            .format(DATETIME_FORMAT);
        }
        newEnd = localeMoment(newStart)
          .add(localeMoment(event.end).diff(localeMoment(event.start)), 'ms')
          .format(DATETIME_FORMAT);
        // if crossResourceMove disabled, slot returns old value
        if (!config.crossResourceMove) {
          slotId = schedulerData._getEventSlotId(item);
          slotName = undefined;
          const slot = schedulerData.getSlotById(slotId);
          if (slot) {
            slotName = slot.name;
          }
        }
        action = 'Move';
      }
      let hasConflict = false;
      if (config.checkConflict) {
        const start = localeMoment(newStart);
        const end = localeMoment(newEnd);
        events.forEach((e: any) => {
          if (schedulerData._getEventSlotId(e) === slotId && (!isEvent || e.id !== item.id)) {
            const eStart = localeMoment(e.start);
            const eEnd = localeMoment(e.end);
            if (
              (start >= eStart && start < eEnd) ||
              (end > eStart && end <= eEnd) ||
              (eStart >= start && eStart < end) ||
              (eEnd > start && eEnd <= end)
            ) {
              hasConflict = true;
            }
          }
        });
      }
      if (hasConflict) {
        const { conflictOccurred } = props;
        if (conflictOccurred) {
          conflictOccurred(action, item, type, slotId, slotName, newStart, newEnd);
        } else {
          console.log('Conflict occurred, set conflictOccurred func in Scheduler to handle it');
        }
      } else {
        if (isEvent) {
          if (moveEvent) {
            moveEvent(schedulerData, item, slotId, slotName, newStart, newEnd);
          }
        } else {
          if (newEvent) {
            newEvent(schedulerData, slotId, slotName, newStart, newEnd, type, item);
          }
        }
      }
    },
    canDrag: (props: any) => {
      const { schedulerData, resourceEvents } = props;
      const item = this.resolveDragObjFunc(props);
      if (schedulerData._isResizing()) {
        return false;
      }
      const { config } = schedulerData;
      return config.movable && (resourceEvents === undefined || !resourceEvents.groupOnly) &&
        (item.movable === undefined || item.movable);
    },
  });

  getDragCollect = (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview(),
  });

  getDragSource = () => this.dragSource;
}
