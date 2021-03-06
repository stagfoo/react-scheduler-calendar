import moment from 'moment';
import { RRuleSet, rrulestr } from 'rrule';
import { CellUnits, DATE_FORMAT, DATETIME_FORMAT, ViewTypes } from '..';
import config from '../constants/config';
import behaviors from '../utils/behaviors';

export class SchedulerData {
  public resources: any;
  public events: any;
  public eventGroups: any;
  public eventGroupsAutoGenerated: any;
  public viewType: number;
  public cellUnit: any;
  public showAgenda: boolean;
  public isEventPerspective: boolean;
  public resizing: any;
  public scrollToSpecialMoment: any;
  public documentWidth: any;
  public localeMoment: any;
  public config: any;
  public behaviors: any;
  public startDate: any;
  public endDate: any;
  public selectDate: any;
  public renderData: any;
  public headers: any;

  constructor(
    date = moment().format(DATE_FORMAT),
    viewType = ViewTypes.Week,
    showAgenda = false,
    isEventPerspective = false,
    newConfig?: Record<string, unknown>,
    newBehaviors?: Record<string, unknown>,
    localeMoment = moment,
  ) {
    this.resources = [];
    this.events = [];
    this.eventGroups = [];
    this.eventGroupsAutoGenerated = true;
    this.viewType = viewType;
    this.cellUnit = viewType === ViewTypes.Day ? CellUnits.Hour : CellUnits.Day;
    this.showAgenda = showAgenda;
    this.isEventPerspective = isEventPerspective;
    this.resizing = false;
    this.scrollToSpecialMoment = false;
    this.documentWidth = 0;
    this.localeMoment = localeMoment;
    this.config = newConfig === undefined ? config : { ...config, ...newConfig };
    this._validateMinuteStep(this.config.minuteStep);
    this.behaviors = newBehaviors === undefined ? behaviors : { ...behaviors, ...newBehaviors };
    this._resolveDate(0, date);
    this._createHeaders();
    this._createRenderData();
  }

  findGroupIndex = (eventGroupId: any, index: number) => {
    this.eventGroups.forEach((item: any, idx: any) => {
      if (item.id === eventGroupId) {
        index = idx;
      }
    });
    return index;
  };

  setLocaleMoment(localeMoment: typeof moment) {
    if (localeMoment) {
      this.localeMoment = localeMoment;
      this._createHeaders();
      this._createRenderData();
    }
  }

  setResources(resources: any[]) {
    this._validateResource(resources);
    this.resources = Array.from(new Set(resources));
    this._createRenderData();
    this.setScrollToSpecialMoment(true);
  }

  setEventGroupsAutoGenerated(autoGenerated: any) {
    this.eventGroupsAutoGenerated = autoGenerated;
  }

  // optional
  setEventGroups(eventGroups: any) {
    this._validateEventGroups(eventGroups);
    this.eventGroups = Array.from(new Set(eventGroups));
    this.eventGroupsAutoGenerated = false;
    this._createRenderData();
    this.setScrollToSpecialMoment(true);
  }

  setMinuteStep(minuteStep: number) {
    if (this.config.minuteStep !== minuteStep) {
      this._validateMinuteStep(minuteStep);
      this.config.minuteStep = minuteStep;
      this._createHeaders();
      this._createRenderData();
    }
  }

  setBesidesWidth(besidesWidth: number) {
    if (besidesWidth >= 0) {
      this.config.besidesWidth = besidesWidth;
    }
  }

  getMinuteStepsInHour() {
    return 60 / this.config.minuteStep;
  }

  addResource(resource: any) {
    const existedResources = this.resources.filter((x: any) => x.id === resource.id);
    if (existedResources.length === 0) {
      this.resources.push(resource);
      this._createRenderData();
    }
  }

  addEventGroup(eventGroup: any) {
    const existedEventGroups = this.eventGroups.filter((x: any) => x.id === eventGroup.id);
    if (existedEventGroups.length === 0) {
      this.eventGroups.push(eventGroup);
      this._createRenderData();
    }
  }

  removeEventGroupById(eventGroupId: any) {
    let index = -1;
    index = this.findGroupIndex(eventGroupId, index);
    if (index !== -1) {
      this.eventGroups.splice(index, 1);
    }
  }

  containsEventGroupId(eventGroupId: any) {
    let index = -1;
    index = this.findGroupIndex(eventGroupId, index);
    return index !== -1;
  }

  setEvents(events: any) {
    this._validateEvents(events);
    this.events = Array.from(events);
    if (this.eventGroupsAutoGenerated) {
      this._generateEventGroups();
    }
    if (this.config.recurringEventsEnabled) {
      this._handleRecurringEvents();
    }

    this._createRenderData();
  }

  setScrollToSpecialMoment(scrollToSpecialMoment: any) {
    if (this.config.scrollToSpecialMomentEnabled) {
      this.scrollToSpecialMoment = scrollToSpecialMoment;
    }
  }

  prev() {
    this._resolveDate(-1);
    this.events = [];
    this._createHeaders();
    this._createRenderData();
  }

  next() {
    this._resolveDate(1);
    this.events = [];
    this._createHeaders();
    this._createRenderData();
  }

  setDate(date: string | moment.Moment = moment().format(DATE_FORMAT)) {
    this._resolveDate(0, date);
    this.events = [];
    this._createHeaders();
    this._createRenderData();
  }

  setViewType(viewType = ViewTypes.Week, showAgenda = false, isEventPerspective = false) {
    this.showAgenda = showAgenda;
    this.isEventPerspective = isEventPerspective;
    this.cellUnit = CellUnits.Day;

    if (this.viewType !== viewType) {
      let date = this.startDate;

      if (viewType === ViewTypes.Custom || viewType === ViewTypes.Custom1 || viewType === ViewTypes.Custom2) {
        this.viewType = viewType;
        this._resolveDate(0, date);
      } else {
        if (this.viewType < viewType) {
          if (viewType === ViewTypes.Week) {
            this.startDate = this.localeMoment(date).startOf('week').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('week').format(DATE_FORMAT);
          } else if (viewType === ViewTypes.Month) {
            this.startDate = this.localeMoment(date).startOf('month').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('month').format(DATE_FORMAT);
          } else if (viewType === ViewTypes.Quarter) {
            this.startDate = this.localeMoment(date).startOf('quarter').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('quarter').format(DATE_FORMAT);
          } else if (viewType === ViewTypes.Year) {
            this.startDate = this.localeMoment(date).startOf('year').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('year').format(DATE_FORMAT);
          }
        } else {
          const start = this.localeMoment(this.startDate);
          const end = this.localeMoment(this.endDate).add(1, 'days');

          if (this.selectDate) {
            const selectDate = this.localeMoment(this.selectDate);
            if (selectDate >= start && selectDate < end) {
              date = this.selectDate;
            }
          }

          const now = this.localeMoment();
          if (now >= start && now < end) {
            date = now.format(DATE_FORMAT);
          }

          if (viewType === ViewTypes.Day) {
            this.startDate = date;
            this.endDate = this.startDate;
            this.cellUnit = CellUnits.Hour;
          } else if (viewType === ViewTypes.Week) {
            this.startDate = this.localeMoment(date).startOf('week').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('week').format(DATE_FORMAT);
          } else if (viewType === ViewTypes.Month) {
            this.startDate = this.localeMoment(date).startOf('month').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('month').format(DATE_FORMAT);
          } else if (viewType === ViewTypes.Quarter) {
            this.startDate = this.localeMoment(date).startOf('quarter').format(DATE_FORMAT);
            this.endDate = this.localeMoment(this.startDate).endOf('quarter').format(DATE_FORMAT);
          }
        }

        this.viewType = viewType;
      }

      this.events = [];
      this._createHeaders();
      this._createRenderData();
      this.setScrollToSpecialMoment(true);
    }
  }

  setSchedulerMaxHeight(newSchedulerMaxHeight: any) {
    this.config.schedulerMaxHeight = newSchedulerMaxHeight;
  }

  isSchedulerResponsive() {
    return !!this.config.schedulerWidth.endsWith && this.config.schedulerWidth.endsWith('%');
  }

  toggleExpandStatus(slotId: any) {
    let slotEntered = false;
    let slotIndent = -1;
    let isExpanded = false;
    const expandedMap = new Map();
    this.renderData.forEach((item: any) => {
      if (!slotEntered) {
        if (item.slotId === slotId && item.hasChildren) {
          slotEntered = true;

          isExpanded = !item.expanded;
          item.expanded = isExpanded;
          slotIndent = item.indent;
          expandedMap.set(item.indent, {
            expanded: item.expanded,
            render: item.render,
          });
        }
      } else {
        if (item.indent > slotIndent) {
          const expandStatus = expandedMap.get(item.indent - 1);
          item.render = expandStatus.expanded && expandStatus.render;

          if (item.hasChildren) {
            expandedMap.set(item.indent, {
              expanded: item.expanded,
              render: item.render,
            });
          }
        } else {
          slotEntered = false;
        }
      }
    });
  }

  isResourceViewResponsive() {
    const resourceTableWidth = this.getResourceTableConfigWidth();
    return !!resourceTableWidth.endsWith && resourceTableWidth.endsWith('%');
  }

  isContentViewResponsive() {
    const contentCellWidth = this.getContentCellConfigWidth();
    return !!contentCellWidth.endsWith && contentCellWidth.endsWith('%');
  }

  getSchedulerWidth() {
    const baseWidth = this.documentWidth - this.config.besidesWidth > 0
      ? this.documentWidth - this.config.besidesWidth : 0;
    return this.isSchedulerResponsive()
      ? Math.round(baseWidth * Number(this.config.schedulerWidth.slice(0, -1)) / 100) : this.config.schedulerWidth;
  }

  getResourceTableWidth() {
    const resourceTableConfigWidth = this.getResourceTableConfigWidth();
    const schedulerWidth = this.getSchedulerWidth();
    let resourceTableWidth = this.isResourceViewResponsive()
      ? Math.round(schedulerWidth * Number(resourceTableConfigWidth.slice(0, -1)) / 100) : resourceTableConfigWidth;
    if (this.isSchedulerResponsive() && (this.getContentTableWidth() + resourceTableWidth < schedulerWidth)) {
      resourceTableWidth = schedulerWidth - this.getContentTableWidth();
    }
    return resourceTableWidth;
  }

  getContentCellWidth() {
    const contentCellConfigWidth = this.getContentCellConfigWidth();
    const schedulerWidth = this.getSchedulerWidth();
    return this.isContentViewResponsive()
      ? Math.round(schedulerWidth * Number(contentCellConfigWidth.slice(0, -1)) / 100)
      : contentCellConfigWidth;
  }

  getContentTableWidth() {
    return this.headers.length * (this.getContentCellWidth());
  }

  getScrollToSpecialMoment() {
    if (this.config.scrollToSpecialMomentEnabled) {
      return this.scrollToSpecialMoment;
    }
    return false;
  }

  getSlots() {
    return this.isEventPerspective ? this.eventGroups : this.resources;
  }

  getSlotById(slotId: any): any {
    const slots = this.getSlots();
    let slot;
    slots.forEach((item: any) => {
      if (item.id === slotId) {
        slot = item;
      }
    });
    return slot;
  }

  getResourceById(resourceId: any) {
    let resource;
    this.resources.forEach((item: any) => {
      if (item.id === resourceId) {
        resource = item;
      }
    });
    return resource;
  }

  getTableHeaderHeight() {
    return this.config.tableHeaderHeight;
  }

  getSchedulerContentDesiredHeight() {
    let height = 0;
    this.renderData.forEach((item: any) => {
      if (item.render) {
        height += item.rowHeight;
      }
    });
    return height;
  }

  getCellMaxEvents() {
    return this.viewType === ViewTypes.Week ? this.config.weekMaxEvents : (
      this.viewType === ViewTypes.Day ? this.config.dayMaxEvents : (
        this.viewType === ViewTypes.Month ? this.config.monthMaxEvents : (
          this.viewType === ViewTypes.Year ? this.config.yearMaxEvents : (
            this.viewType === ViewTypes.Quarter ? this.config.quarterMaxEvents
              : this.config.customMaxEvents
          )
        )
      )
    );
  }

  getDateLabel(): string {
    const start = this.localeMoment(this.startDate);
    const end = this.localeMoment(this.endDate);
    let dateLabel = start.format('LL');

    if (start !== end) {
      dateLabel = `${start.format('LL')}-${end.format('LL')}`;
    }

    if (this.behaviors.getDateLabelFunc) {
      dateLabel = this.behaviors.getDateLabelFunc(this, this.viewType, this.startDate, this.endDate);
    }

    return dateLabel;
  }

  addEvent(newEvent: any) {
    this._attachEvent(newEvent);
    if (this.eventGroupsAutoGenerated) {
      this._generateEventGroups();
    }
    this._createRenderData();
  }

  updateEventStart(event: any, newStart: string) {
    this._detachEvent(event);
    event.start = newStart;
    this._attachEvent(event);
    this._createRenderData();
  }

  updateEventEnd(event: any, newEnd: string) {
    event.end = newEnd;
    this._createRenderData();
  }

  moveEvent(event: any, newSlotId: string, newSlotName: string, newStart: string, newEnd: string) {
    this._detachEvent(event);
    if (this.isEventPerspective) {
      event.groupId = newSlotId;
      event.groupName = newSlotName;
    } else {
      event.resourceId = newSlotId;
    }
    event.end = newEnd;
    event.start = newStart;
    this._attachEvent(event);
    this._createRenderData();
  }

  isEventInTimeWindow(eventStart: number, eventEnd: number, windowStart: number, windowEnd: number) {
    return eventStart < windowEnd && eventEnd > windowStart;
  }

  removeEvent(event: any) {
    const index = this.events.indexOf(event);
    if (index !== -1) {
      this.events.splice(index, 1);
      this._createRenderData();
    }
  }

  removeEventById(eventId: any) {
    let index = -1;
    this.events.forEach((item: any, idx: number) => {
      if (item.id === eventId) {
        index = idx;
      }
    });
    if (index !== -1) {
      this.events.splice(index, 1);
      this._createRenderData();
    }
  }

  getResourceTableConfigWidth() {
    if (this.showAgenda) {
      return this.config.agendaResourceTableWidth;
    }

    return this.viewType === ViewTypes.Week ? this.config.weekResourceTableWidth : (
      this.viewType === ViewTypes.Day ? this.config.dayResourceTableWidth : (
        this.viewType === ViewTypes.Month ? this.config.monthResourceTableWidth : (
          this.viewType === ViewTypes.Year ? this.config.yearResourceTableWidth : (
            this.viewType === ViewTypes.Quarter ? this.config.quarterResourceTableWidth
              : this.config.customResourceTableWidth
          )
        )
      )
    );
  }

  getContentCellConfigWidth() {
    return this.viewType === ViewTypes.Week ? this.config.weekCellWidth : (
      this.viewType === ViewTypes.Day ? this.config.dayCellWidth : (
        this.viewType === ViewTypes.Month ? this.config.monthCellWidth : (
          this.viewType === ViewTypes.Year ? this.config.yearCellWidth : (
            this.viewType === ViewTypes.Quarter ? this.config.quarterCellWidth
              : this.config.customCellWidth
          )
        )
      )
    );
  }

  _setDocumentWidth(documentWidth: number) {
    if (documentWidth >= 0) {
      this.documentWidth = documentWidth;
    }
  }

  _detachEvent(event: any) {
    const index = this.events.indexOf(event);
    if (index !== -1) {
      this.events.splice(index, 1);
    }
  }

  _attachEvent(event: any) {
    let pos = 0;
    const eventStart = this.localeMoment(event.start);
    this.events.forEach((item: any, index: number) => {
      const start = this.localeMoment(item.start);
      if (eventStart >= start) {
        pos = index + 1;
      }
    });
    this.events.splice(pos, 0, event);
  }

  _handleRecurringEvents() {
    const recurringEvents = this.events.filter((x: any) => !!x.rrule);
    recurringEvents.forEach((item: any) => {
      this._detachEvent(item);
    });

    recurringEvents.forEach((item: any) => {
      let rule = rrulestr(item.rrule);
      let oldDtstart: any;
      const windowStart = this.localeMoment(this.startDate);
      const windowEnd = this.localeMoment(this.endDate).add(1, 'days');
      const oldStart = this.localeMoment(item.start);
      const oldEnd = this.localeMoment(item.end);
      const oldUntil = rule.origOptions.until || windowEnd.toDate();
      if (rule.origOptions.dtstart) {
        oldDtstart = this.localeMoment(rule.origOptions.dtstart);
      }
      // rule.origOptions.dtstart = oldStart.toDate();
      if (windowEnd < oldUntil) {
        rule.origOptions.until = windowEnd.toDate();
      }

      // reload
      rule = rrulestr(rule.toString());
      if (item.exdates || item.exrule) {
        const rruleSet = new RRuleSet();
        rruleSet.rrule(rule);
        if (item.exrule) {
          rruleSet.exrule(rrulestr(item.exrule));
        }
        if (item.exdates) {
          item.exdates.forEach((exdate: any) => {
            rruleSet.exdate(this.localeMoment(exdate).toDate());
          });
        }
        rule = rruleSet;
      }

      const all = rule.all();
      const newEvents = all.map((time, index) => ({
        ...item,
        recurringEventId: item.id,
        recurringEventStart: item.start,
        recurringEventEnd: item.end,
        id: `${item.id}-${index}`,
        start: rule.origOptions.tzid
          ? this.localeMoment.utc(time).utcOffset(this.localeMoment().utcOffset(), true).format(DATETIME_FORMAT)
          : this.localeMoment(time).format(DATETIME_FORMAT),
        end: rule.origOptions.tzid
          ? this.localeMoment.utc(time).utcOffset(this.localeMoment().utcOffset(), true)
            .add(oldEnd.diff(oldStart), 'ms')
            .add(this.localeMoment(oldUntil)
              .utcOffset() - this.localeMoment(item.start).utcOffset(), 'm')
            .format(DATETIME_FORMAT)
          : this.localeMoment(time).add(oldEnd.diff(oldStart), 'ms').format(DATETIME_FORMAT),
      }));
      newEvents.forEach((newEvent) => {
        const eventStart = this.localeMoment(newEvent.start);
        const eventEnd = this.localeMoment(newEvent.end);
        if (this.isEventInTimeWindow(eventStart, eventEnd, windowStart, windowEnd) &&
          (!oldDtstart || eventStart >= oldDtstart)) {
          this._attachEvent(newEvent);
        }
      });
    });
  }

  _resolveDate(num: number, date?: any) {
    if (date) {
      this.selectDate = this.localeMoment(date).format(DATE_FORMAT);
    }

    if (this.viewType === ViewTypes.Week) {
      this.startDate = date ? this.localeMoment(date).startOf('week').format(DATE_FORMAT)
        : this.localeMoment(this.startDate).add(num, 'weeks').format(DATE_FORMAT);
      this.endDate = this.localeMoment(this.startDate).endOf('week').format(DATE_FORMAT);
    } else if (this.viewType === ViewTypes.Day) {
      this.startDate = date ? this.selectDate
        : this.localeMoment(this.startDate).add(num, 'days').format(DATE_FORMAT);
      this.endDate = this.startDate;
      this.selectDate = this.startDate;
    } else if (this.viewType === ViewTypes.Month) {
      this.startDate = date ? this.localeMoment(date).startOf('month').format(DATE_FORMAT)
        : this.localeMoment(this.startDate).add(num, 'months').format(DATE_FORMAT);
      this.endDate = this.localeMoment(this.startDate).endOf('month').format(DATE_FORMAT);
    } else if (this.viewType === ViewTypes.Quarter) {
      this.startDate = date ? this.localeMoment(date).startOf('quarter').format(DATE_FORMAT)
        : this.localeMoment(this.startDate).add(num, 'quarters').format(DATE_FORMAT);
      this.endDate = this.localeMoment(this.startDate).endOf('quarter').format(DATE_FORMAT);
    } else if (this.viewType === ViewTypes.Year) {
      this.startDate = date ? this.localeMoment(date).startOf('year').format(DATE_FORMAT)
        : this.localeMoment(this.startDate).add(num, 'years').format(DATE_FORMAT);
      this.endDate = this.localeMoment(this.startDate).endOf('year').format(DATE_FORMAT);
    } else if (
      this.viewType === ViewTypes.Custom ||
      this.viewType === ViewTypes.Custom1 ||
      this.viewType === ViewTypes.Custom2
    ) {
      if (this.behaviors.getCustomDateFunc) {
        const customDate = this.behaviors.getCustomDateFunc(this, num, date);
        this.startDate = customDate.startDate;
        this.endDate = customDate.endDate;
        if (customDate.cellUnit) {
          this.cellUnit = customDate.cellUnit;
        }
      } else {
        throw new Error('This is custom view type,' +
          'set behaviors.getCustomDateFunc func to resolve the time window(startDate and endDate) yourself');
      }
    }
  }

  _createHeaders() {
    const headers = [];
    let start = this.localeMoment(this.startDate);
    let end = this.localeMoment(this.endDate);
    let header = start;

    if (this.showAgenda) {
      headers.push({ time: header.format(DATETIME_FORMAT), nonWorkingTime: false });
    } else {
      if (this.cellUnit === CellUnits.Hour) {
        start = start.add(this.config.dayStartFrom, 'hours');
        end = end.add(this.config.dayStopTo, 'hours');
        header = start;

        while (header >= start && header <= end) {
          const minuteSteps = this.getMinuteStepsInHour();
          for (let i = 0; i < minuteSteps; i++) {
            const hour = header.hour();
            if (hour >= this.config.dayStartFrom && hour <= this.config.dayStopTo) {
              const time = header.format(DATETIME_FORMAT);
              const nonWorkingTime = this.behaviors.isNonWorkingTimeFunc(this, time);
              headers.push({ time, nonWorkingTime });
            }

            header = header.add(this.config.minuteStep, 'minutes');
          }
        }
      } else {
        while (header >= start && header <= end) {
          const time = header.format(DATETIME_FORMAT);
          const dayOfWeek = header.weekday();
          if (this.config.displayWeekend || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
            const nonWorkingTime = this.behaviors.isNonWorkingTimeFunc(this, time);
            headers.push({ time, nonWorkingTime });
          }

          header = header.add(1, 'days');
        }
      }
    }

    this.headers = headers;
  }

  _createInitHeaderEvents(header: any) {
    const start = this.localeMoment(header.time);
    const startValue = start.format(DATETIME_FORMAT);
    const endValue = this.showAgenda ? (this.viewType === ViewTypes.Week ? start.add(1, 'weeks').format(DATETIME_FORMAT)
      : (
        this.viewType === ViewTypes.Day ? start.add(1, 'days').format(DATETIME_FORMAT) : (
          this.viewType === ViewTypes.Month ? start.add(1, 'months').format(DATETIME_FORMAT) : (
            this.viewType === ViewTypes.Year ? start.add(1, 'years').format(DATETIME_FORMAT) : (
              this.viewType === ViewTypes.Quarter ? start.add(1, 'quarters').format(DATETIME_FORMAT)
                : this.localeMoment(this.endDate).add(1, 'days').format(DATETIME_FORMAT)
            )
          )
        )
      )) : (this.cellUnit === CellUnits.Hour ? start.add(this.config.minuteStep, 'minutes').format(DATETIME_FORMAT)
      : start.add(1, 'days').format(DATETIME_FORMAT));
    return {
      time: header.time,
      nonWorkingTime: header.nonWorkingTime,
      start: startValue,
      end: endValue,
      count: 0,
      addMore: 0,
      addMoreIndex: 0,
      events: [],
    };
  }

  _createHeaderEvent(render: any, span: any, eventItem: any) {
    return {
      render,
      span,
      eventItem,
    };
  }

  _getEventSlotId(event: any) {
    return this.isEventPerspective ? this._getEventGroupId(event) : event.resourceId;
  }

  _getEventGroupId(event: any) {
    return event.groupId ? event.groupId.toString() : event.id.toString();
  }

  _getEventGroupName(event: any) {
    return event.groupName ? event.groupName : event.title;
  }

  _generateEventGroups() {
    const eventGroups: any[] = [];
    const set = new Set();
    this.events.forEach((item: any) => {
      const groupId = this._getEventGroupId(item);
      const groupName = this._getEventGroupName(item);

      if (!set.has(groupId)) {
        eventGroups.push({
          id: groupId,
          name: groupName,
          state: item,
        });
        set.add(groupId);
      }
    });
    this.eventGroups = eventGroups;
  }

  _createInitRenderData(isEventPerspective: boolean, eventGroups: any[], resources: any[], headers: any[]) {
    const slots = isEventPerspective ? eventGroups : resources;
    const slotTree: any[] = [];
    const slotMap = new Map();
    slots.forEach((slot) => {
      const headerEvents = headers.map((header) => this._createInitHeaderEvents(header));

      const slotRenderData = {
        slotId: slot.id,
        slotName: slot.name,
        parentId: slot.parentId,
        groupOnly: slot.groupOnly,
        hasSummary: false,
        rowMaxCount: 0,
        rowHeight: this.config.nonAgendaSlotMinHeight !== 0
          ? this.config.nonAgendaSlotMinHeight : this.config.eventItemLineHeight + 2,
        headerItems: headerEvents,
        indent: 0,
        hasChildren: false,
        expanded: true,
        render: true,
        ...slot,
      };
      const id = slot.id;
      let value;
      if (slotMap.has(id)) {
        value = slotMap.get(id);
        value.data = slotRenderData;
      } else {
        value = {
          data: slotRenderData,
          children: [],
        };
        slotMap.set(id, value);
      }

      const parentId = slot.parentId;
      if (!parentId || parentId === id) {
        slotTree.push(value);
      } else {
        let parentValue;
        if (slotMap.has(parentId)) {
          parentValue = slotMap.get(parentId);
        } else {
          parentValue = {
            data: undefined,
            children: [],
          };
          slotMap.set(parentId, parentValue);
        }

        parentValue.children.push(value);
      }
    });

    const slotStack = [];
    let i;
    for (i = slotTree.length - 1; i >= 0; i--) {
      slotStack.push(slotTree[i]);
    }
    const initRenderData = [];
    let currentNode;
    while (slotStack.length > 0) {
      currentNode = slotStack.pop();
      if (currentNode.data.indent > 0) {
        currentNode.data.render = this.config.defaultExpanded;
      }
      if (currentNode.children.length > 0) {
        currentNode.data.hasChildren = true;
        currentNode.data.expanded = this.config.defaultExpanded;
      }
      initRenderData.push(currentNode.data);

      for (i = currentNode.children.length - 1; i >= 0; i--) {
        currentNode.children[i].data.indent = currentNode.data.indent + 1;
        slotStack.push(currentNode.children[i]);
      }
    }

    return initRenderData;
  }

  getSpan(startTime: any, endTime: any, headers: any) {
    if (this.showAgenda) {
      return 1;
    }
    const start = moment.max(
      this.localeMoment(startTime),
      this.localeMoment(headers[0].time),
    );
    const end = moment.min(
      this.localeMoment(endTime),
      this.localeMoment(headers[headers.length - 1].time),
    );

    let span;
    if (this.cellUnit === CellUnits.Hour) {
      span = Math.ceil(end.diff(start, 'minutes') / this.config.minuteStep);
    } else {
      span = end.diff(start, 'days');
    }
    if (this.localeMoment(endTime).isAfter(this.localeMoment(headers[headers.length - 1].time))) {
      span += 1;
    }
    return span;
  }

  _validateResource(resources: any[]) {
    if (Object.prototype.toString.call(resources) !== '[object Array]') {
      throw new Error('Resources should be Array object');
    }

    resources.forEach((item: any, index: number) => {
      if (item === undefined) {
        console.error(`Resource undefined: ${index}`);
        throw new Error(`Resource undefined: ${index}`);
      }
      if (item.id === undefined || item.name === undefined) {
        console.error('Resource property missed', index, item);
        throw new Error(`Resource property undefined: ${index}`);
      }
    });
  }

  _validateEventGroups(eventGroups: any) {
    if (Object.prototype.toString.call(eventGroups) !== '[object Array]') {
      throw new Error('Event groups should be Array object');
    }

    eventGroups.forEach((item: any, index: number) => {
      if (item === undefined) {
        console.error(`Event group undefined: ${index}`);
        throw new Error(`Event group undefined: ${index}`);
      }
      if (item.id === undefined || item.name === undefined) {
        console.error('Event group property missed', index, item);
        throw new Error(`Event group property undefined: ${index}`);
      }
    });
  }

  _validateEvents(events: any[]) {
    if (Object.prototype.toString.call(events) !== '[object Array]') {
      throw new Error('Events should be Array object');
    }

    events.forEach((e, index) => {
      if (e === undefined) {
        console.error(`Event undefined: ${index}`);
        throw new Error(`Event undefined: ${index}`);
      }
      if (e.id === undefined || e.resourceId === undefined || e.title === undefined ||
        e.start === undefined || e.end === undefined) {
        console.error('Event property missed', index, e);
        throw new Error(`Event property undefined: ${index}`);
      }
    });
  }

  _validateMinuteStep(minuteStep: number) {
    if (60 % minuteStep !== 0) {
      console.error('Minute step is not set properly - 60 minutes must be divisible without remainder by this number');
      throw new Error(
        'Minute step is not set properly - 60 minutes must be divisible without remainder by this number',
      );
    }
  }

  _compare(event1: any, event2: any) {
    const start1 = this.localeMoment(event1.start);
    const start2 = this.localeMoment(event2.start);
    if (start1 !== start2) {
      return start1 < start2 ? -1 : 1;
    }

    const end1 = this.localeMoment(event1.end);
    const end2 = this.localeMoment(event2.end);
    if (end1 !== end2) {
      return end1 < end2 ? -1 : 1;
    }

    return event1.id < event2.id ? -1 : 1;
  }

  _createRenderData() {
    const initRenderData = this._createInitRenderData(
      this.isEventPerspective, this.eventGroups, this.resources, this.headers,
    );
    this.events.sort(this._compare.bind(this));
    const cellMaxEventsCount = this.getCellMaxEvents();
    const cellMaxEventsCountValue = 30;

    this.events.forEach((item: any) => {
      const resourceEventsList = initRenderData.filter((x) => x.slotId === this._getEventSlotId(item));
      if (resourceEventsList.length > 0) {
        const resourceEvents = resourceEventsList[0];
        const span = this.getSpan(item.start, item.end, this.headers);
        const eventStart = this.localeMoment(item.start);
        const eventEnd = this.localeMoment(item.end);
        let pos = -1;

        resourceEvents.headerItems.forEach((header: any, index: number) => {
          const headerStart = this.localeMoment(header.start);
          const headerEnd = this.localeMoment(header.end);
          if (headerEnd > eventStart && headerStart < eventEnd) {
            header.count = header.count + 1;
            if (header.count > resourceEvents.rowMaxCount) {
              resourceEvents.rowMaxCount = header.count;
              const rowsCount = (
                cellMaxEventsCount <= cellMaxEventsCountValue &&
                resourceEvents.rowMaxCount > cellMaxEventsCount
              ) ? cellMaxEventsCount : resourceEvents.rowMaxCount;
              const newRowHeight = rowsCount * this.config.eventItemLineHeight +
                (this.config.creatable && !this.config.checkConflict ? 20 : 2);
              if (newRowHeight > resourceEvents.rowHeight) {
                resourceEvents.rowHeight = newRowHeight;
              }
            }

            if (pos === -1) {
              let tmp = 0;
              while (header.events[tmp]) {
                tmp++;
              }

              pos = tmp;
            }
            let render = headerStart <= eventStart || index === 0;
            if (!render) {
              const previousHeader = resourceEvents.headerItems[index - 1];
              const previousHeaderStart = this.localeMoment(previousHeader.start);
              const previousHeaderEnd = this.localeMoment(previousHeader.end);
              if (previousHeaderEnd <= eventStart || previousHeaderStart >= eventEnd) {
                render = true;
              }
            }
            header.events[pos] = this._createHeaderEvent(render, span, item);
          }
        });
      }
    });

    if (cellMaxEventsCount <= cellMaxEventsCountValue || this.behaviors.getSummaryFunc) {
      initRenderData.forEach((resourceEvents) => {
        let hasSummary = false;

        resourceEvents.headerItems.forEach((headerItem: any) => {
          if (cellMaxEventsCount <= cellMaxEventsCountValue) {
            let renderItemsCount = 0;
            let addMoreIndex = 0;
            let index = 0;
            while (index < cellMaxEventsCount - 1) {
              if (headerItem.events[index]) {
                renderItemsCount++;
                addMoreIndex = index + 1;
              }

              index++;
            }

            if (headerItem.events[index]) {
              if (renderItemsCount + 1 < headerItem.count) {
                headerItem.addMore = headerItem.count - renderItemsCount;
                headerItem.addMoreIndex = addMoreIndex;
              }
            } else {
              if (renderItemsCount < headerItem.count) {
                headerItem.addMore = headerItem.count - renderItemsCount;
                headerItem.addMoreIndex = addMoreIndex;
              }
            }
          }

          if (this.behaviors.getSummaryFunc) {
            const events: any[] = [];
            headerItem.events.forEach((e: any) => {
              if (!!e && !!e.eventItem) {
                events.push(e.eventItem);
              }
            });

            headerItem.summary = this.behaviors.getSummaryFunc(
              this, events, resourceEvents.slotId, resourceEvents.slotName, headerItem.start, headerItem.end,
            );
            if (!!headerItem.summary && headerItem.summary.text) {
              hasSummary = true;
            }
          }
        });

        resourceEvents.hasSummary = hasSummary;
        if (hasSummary) {
          const rowsCount =
            (cellMaxEventsCount <= cellMaxEventsCountValue && resourceEvents.rowMaxCount > cellMaxEventsCount)
              ? cellMaxEventsCount : resourceEvents.rowMaxCount;
          const newRowHeight =
            (rowsCount + 1) * this.config.eventItemLineHeight +
            (this.config.creatable && !this.config.checkConflict ? 20 : 2);
          if (newRowHeight > resourceEvents.rowHeight) {
            resourceEvents.rowHeight = newRowHeight;
          }
        }
      });
    }

    this.renderData = initRenderData;
  }

  startResizing() {
    this.resizing = true;
  }

  _stopResizing() {
    this.resizing = false;
  }

  _isResizing() {
    return this.resizing;
  }
}
