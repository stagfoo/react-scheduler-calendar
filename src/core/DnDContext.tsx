import React from 'react';
import { DropTarget, DropTargetConnector, DropTargetMonitor, XYCoord } from 'react-dnd';
import { DnDTypes } from './constants/DnDTypes';
import { ViewTypes } from './constants/ViewTypes';
import { CellUnits, DATETIME_FORMAT } from './index';
import { getPos } from './utils/Util';

export default class DnDContext {
  private sourceMap: Map<string, any>;
  private readonly DecoratedComponent: React.ComponentType;
  private prevHoverCalledTime = 0;
  private prevHoverPosition: XYCoord | null = null;

  constructor(sources: any, DecoratedComponent: React.ComponentType) {
    this.sourceMap = new Map();
    sources.forEach((item: any) => {
      this.sourceMap.set(item.dndType, item);
    });
    this.DecoratedComponent = DecoratedComponent;
  }

  getDropSpec = () => ({
    drop: (props: any, monitor: DropTargetMonitor, component: any) => {
      this.prevHoverPosition = null;
      const { schedulerData, resourceEvents } = props;
      const { cellUnit, localeMoment } = schedulerData;
      const type = monitor.getItemType();
      const pos = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();
      let initialStartTime = null;
      let initialEndTime = null;
      if (type === DnDTypes.EVENT) {
        const initialPoint = monitor.getInitialSourceClientOffset();
        const initialLeftIndex = Math.floor((initialPoint!.x - pos.x) / cellWidth);
        initialStartTime = resourceEvents.headerItems[initialLeftIndex].start;
        initialEndTime = resourceEvents.headerItems[initialLeftIndex].end;
        if (cellUnit !== CellUnits.Hour) {
          initialEndTime = localeMoment(resourceEvents.headerItems[initialLeftIndex].start)
            .hour(23)
            .minute(59)
            .second(59)
            .format(DATETIME_FORMAT);
        }
      }
      const point = monitor.getSourceClientOffset();
      const leftIndex = Math.max(Math.floor((point!.x - pos.x) / cellWidth), 0);
      const startTime = resourceEvents.headerItems[leftIndex].start;
      let endTime = resourceEvents.headerItems[leftIndex].end;
      if (cellUnit !== CellUnits.Hour) {
        endTime = localeMoment(resourceEvents.headerItems[leftIndex].start)
          .hour(23)
          .minute(59)
          .second(59)
          .format(DATETIME_FORMAT);
      }
      return {
        slotId: resourceEvents.slotId,
        slotName: resourceEvents.slotName,
        start: startTime,
        end: endTime,
        initialStart: initialStartTime,
        initialEnd: initialEndTime,
      };
    },
    hover: (props: any, monitor: DropTargetMonitor, component: any) => {
      const currentTime = new Date().valueOf();
      if (currentTime - this.prevHoverCalledTime < 10) {
        return;
      }
      const pointerPosition = monitor.getClientOffset();
      if (!this.prevHoverPosition) {
        this.prevHoverPosition = pointerPosition;
      }

      this.prevHoverCalledTime = currentTime;
      const { schedulerData, resourceEvents, movingEvent } = props;
      const { cellUnit, config, viewType, localeMoment } = schedulerData;
      const draggingItem = monitor.getItem();
      const draggingItemType = monitor.getItemType();
      const isEvent = draggingItemType === DnDTypes.EVENT;

      const eventContainerPosition = getPos(component.eventContainer);

      const cellWidth = schedulerData.getContentCellWidth();

      const leftIndex = Math.floor((pointerPosition!.x - eventContainerPosition.x) / cellWidth);
      if (!resourceEvents.headerItems[leftIndex]) {
        return;
      }
      let newStart = resourceEvents.headerItems[leftIndex].start;
      let newEnd = resourceEvents.headerItems[leftIndex].end;
      if (cellUnit !== CellUnits.Hour) {
        newEnd = localeMoment(resourceEvents.headerItems[leftIndex].start)
          .hour(23)
          .minute(59)
          .second(59)
          .format(DATETIME_FORMAT);
      }
      let slotId = resourceEvents.slotId;
      let slotName = resourceEvents.slotName;
      let action = 'New';
      if (isEvent) {
        const initialPointerPosition = monitor.getInitialClientOffset()!;
        const initialLeftIndex = Math.floor((initialPointerPosition!.x - eventContainerPosition.x) / cellWidth);
        const initialStart = resourceEvents.headerItems[initialLeftIndex].start;
        const event = draggingItem;
        if (config.relativeMove) {
          newStart = localeMoment(event.start)
            .add(localeMoment(newStart).diff(localeMoment(initialStart)), 'ms')
            .format(DATETIME_FORMAT);
        } else {
          if (viewType !== ViewTypes.Day) {
            const tmpMoment = localeMoment(newStart);
            newStart = localeMoment(event.start)
              .year(tmpMoment.year())
              .month(tmpMoment.month())
              .date(tmpMoment.date())
              .format(DATETIME_FORMAT);
          }
        }
        newEnd = localeMoment(newStart)
          .add(localeMoment(event.end).diff(localeMoment(event.start)), 'ms')
          .format(DATETIME_FORMAT);
        // if crossResourceMove disabled, slot returns old value
        if (!config.crossResourceMove) {
          slotId = schedulerData._getEventSlotId(draggingItem);
          slotName = undefined;
          const slot = schedulerData.getSlotById(slotId);
          if (slot) {
            slotName = slot.name;
          }
        }
        action = 'Move';
      }
      component.setState({
        hover: {
          leftIndex: Math.floor((monitor!.getSourceClientOffset()!.x - eventContainerPosition.x) / cellWidth),
          width: schedulerData.getSpan(newStart, newEnd, schedulerData.headers) * cellWidth,
          item: draggingItem,
          itemType: draggingItemType,
          pointer: pointerPosition,
          movement: {
            x: pointerPosition!.x - this.prevHoverPosition!.x,
            y: pointerPosition!.y - this.prevHoverPosition!.y,
          },
        },
      });
      if (movingEvent) {
        movingEvent(schedulerData, slotId, slotName, newStart, newEnd, action, draggingItemType, draggingItem);
      }
      this.prevHoverPosition = pointerPosition;
    },
    canDrop: (props: any, monitor: DropTargetMonitor) => {
      const { schedulerData, resourceEvents } = props;
      const item = monitor.getItem();
      if (schedulerData._isResizing()) {
        return false;
      }
      const { config } = schedulerData;
      return config.movable && !resourceEvents.groupOnly && (item.movable === undefined || item.movable);
    },
  });

  getDropCollect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver({ shallow: true }),
      clientOffset: monitor.getClientOffset(),
    };
  }

  getDropTarget = () => DropTarget(
    Array.from(this.sourceMap.keys()), this.getDropSpec(), this.getDropCollect)(this.DecoratedComponent);
  getDndSource = (dndType = DnDTypes.EVENT) => this.sourceMap.get(dndType);
}
