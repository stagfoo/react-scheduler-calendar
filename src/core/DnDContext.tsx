import React from 'react';
import { omit } from 'lodash';
import { DropTarget, DropTargetConnector, DropTargetMonitor, XYCoord } from 'react-dnd';
import { ViewTypes } from './constants/ViewTypes';
import { CellUnits, DATETIME_FORMAT, DnDTypes } from './index';
import { getPos } from './utils/Util';

export default class DnDContext {
  private sourceMap: Map<string, any>;
  private readonly DecoratedComponent: React.ComponentType;
  private lastHoverCalledTime = 0;
  private lastHoverPosition: XYCoord | null = null;

  constructor(sources: any, DecoratedComponent: React.ComponentType) {
    this.sourceMap = new Map();
    sources.forEach((item: any) => {
      this.sourceMap.set(item.dndType, item);
    });
    this.DecoratedComponent = DecoratedComponent;
  }

  getDropSpec = () => ({
    drop: (props: any, monitor: DropTargetMonitor, component: any) => {
      this.lastHoverPosition = null;
      const { schedulerData, resourceEvents } = props;
      const { cellUnit, localeMoment } = schedulerData;
      const pos = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();
      let point = monitor.getSourceClientOffset();
      if (monitor.getItemType() === DnDTypes.TASK) {
        point = monitor.getClientOffset();
      }
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
      };
    },
    hover: (props: any, monitor: DropTargetMonitor, component: any) => {
      const currentTime = new Date().valueOf();
      const calledInterval = currentTime - this.lastHoverCalledTime;
      if (calledInterval < 10) {
        return;
      }

      const pointerPosition = monitor.getClientOffset();
      let dragBenchmarkPoint = monitor.getSourceClientOffset();
      const draggingItemType = monitor.getItemType();
      if (draggingItemType === DnDTypes.TASK) {
        dragBenchmarkPoint = monitor.getClientOffset();
      }

      if (!this.lastHoverPosition) {
        this.lastHoverPosition = monitor.getClientOffset();
      }
      this.lastHoverCalledTime = currentTime;

      const { schedulerData, resourceEvents, movingEvent } = props;
      const { cellUnit, config, viewType, localeMoment } = schedulerData;
      const draggingItem = monitor.getItem();
      const isEvent = draggingItemType === DnDTypes.EVENT;

      const eventContainerPosition = getPos(component.eventContainer);
      const cellWidth = schedulerData.getContentCellWidth();

      const leftIndex = Math.floor((dragBenchmarkPoint!.x - eventContainerPosition.x) / cellWidth);
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
        const event = draggingItem;
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
          slotId = schedulerData._getEventSlotId(draggingItem);
          slotName = undefined;
          const slot = schedulerData.getSlotById(slotId);
          if (slot) {
            slotName = slot.name;
          }
        }
        action = 'Move';
      }
      const onHoverParams = {
        leftIndex,
        width: schedulerData.getSpan(newStart, newEnd, schedulerData.headers) * cellWidth,
        item: draggingItem,
        itemType: draggingItemType,
        pointer: pointerPosition,
        movement: {
          x: pointerPosition!.x - this.lastHoverPosition!.x,
          y: pointerPosition!.y - this.lastHoverPosition!.y,
        },
      };
      props.onHover(onHoverParams);
      component.setState({
        hover: omit(onHoverParams, ['pointer', 'movement']),
      });
      if (movingEvent) {
        movingEvent(schedulerData, slotId, slotName, newStart, newEnd, action, draggingItemType, draggingItem);
      }
      this.lastHoverPosition = pointerPosition;
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
    const isDragging = monitor.getClientOffset() !== null;
    if (!isDragging) {
      this.lastHoverPosition = null;
    }

    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver({ shallow: true }),
      isDragging,
    };
  }

  getDropTarget = () => DropTarget(
    Array.from(this.sourceMap.keys()), this.getDropSpec(), this.getDropCollect.bind(this))(this.DecoratedComponent);

  getDndSource = (dndType = DnDTypes.EVENT) => this.sourceMap.get(dndType);
}
