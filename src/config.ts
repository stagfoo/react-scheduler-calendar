import { SummaryPos } from './core/constants/SummaryPos';
import ViewTypes from './core/constants/ViewTypes';

export default {
  schedulerWidth: '80%',
  besidesWidth: 20,
  schedulerMaxHeight: 0,
  tableHeaderHeight: 40,

  agendaResourceTableWidth: 160,
  agendaMaxEventWidth: 100,

  dayResourceTableWidth: 160,
  weekResourceTableWidth: '16%',
  monthResourceTableWidth: 160,
  quarterResourceTableWidth: 160,
  yearResourceTableWidth: 160,
  customResourceTableWidth: 160,

  dayCellWidth: 60,
  weekCellWidth: '12%',
  monthCellWidth: 80,
  quarterCellWidth: 80,
  yearCellWidth: 80,
  customCellWidth: 80,

  dayMaxEvents: 99,
  weekMaxEvents: 99,
  monthMaxEvents: 99,
  quarterMaxEvents: 99,
  yearMaxEvents: 99,
  customMaxEvents: 99,

  eventItemHeight: 88,
  eventItemLineHeight: 88,
  nonAgendaSlotMinHeight: 0,
  dayStartFrom: 0,
  dayStopTo: 23,
  defaultEventBgColor: '#80C5F6',
  selectedAreaColor: '#7EC2F3',
  nonWorkingTimeHeadColor: '#999999',
  nonWorkingTimeHeadBgColor: 'transparent',
  nonWorkingTimeBodyBgColor: '#f0f0ff0',
  summaryColor: '#666',
  summaryPos: SummaryPos.TopRight,
  groupOnlySlotColor: '#F8F8F8',

  startResizable: true,
  endResizable: true,
  movable: true,
  creatable: true,
  crossResourceMove: true,
  checkConflict: true,
  scrollToSpecialMomentEnabled: true,
  eventItemPopoverEnabled: true,
  calendarPopoverEnabled: true,
  recurringEventsEnabled: true,
  headerEnabled: true,
  displayWeekend: true,
  relativeMove: true,
  defaultExpanded: true,

  resourceName: 'Technicians',
  taskName: 'Task Name',
  agendaViewHeader: 'Agenda',
  addMorePopoverHeaderFormat: 'MMM D, YYYY dddd',
  eventItemPopoverDateFormat: 'MMM D',
  nonAgendaDayCellHeaderFormat: 'ha',
  nonAgendaOtherCellHeaderFormat: 'ddd M/D',

  minuteStep: 30,

  views: [
    // { viewName: 'Day', viewType: ViewTypes.Day, showAgenda: false, isEventPerspective: false },
  ],
};
