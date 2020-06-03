import moment from 'moment';
import React, { Component, ReactNode } from 'react';
import classnames from 'classnames';

import Background from 'src/core/components/Background';
import DnDObserver from 'src/core/components/DnDObserver';
import ResourceEventsList from 'src/core/components/ResourceEventsList';
import { getScrollSpeedRate } from 'src/core/utils/Util';
import TimeLine from '../lib/TimeLine';
import EventItem from './components/EventItem';
import HeaderView from './components/HeaderView';
import ResourceEvents from './components/ResourceEvents';
import SchedulerHeader from './components/SchedulerHeader';
import DEFAULT_CONFIG from './constants/config';
import DnDContext from './DnDContext';
import { DnDSource } from './DnDSource';
import styles from './styles/index.module.scss';
import './styles/style.css';

export interface SchedulerProps {
  schedulerData: any;
  prevClick: (...args: any[]) => any;
  nextClick: (...args: any[]) => any;
  onTodayClick: (...args: any[]) => any;
  onViewChange: (...args: any[]) => any;
  onSelectDate: (...args: any[]) => any;
  onSetAddMoreState?: (...args: any[]) => any;
  updateEventStart?: (...args: any[]) => any;
  updateEventEnd?: (...args: any[]) => any;
  moveEvent?: (...args: any[]) => any;
  movingEvent?: (...args: any[]) => any;
  leftCustomHeader?: string | ReactNode;
  rightCustomHeader?: string | ReactNode;
  newEvent?: (...args: any[]) => any;
  conflictOccurred?: (...args: any[]) => any;
  eventItemTemplateResolver?: (...args: any[]) => any;
  dndSources?: any[];
  slotClickedFunc?: (...args: any[]) => any;
  toggleExpandFunc?: (...args: any[]) => any;
  slotItemTemplateResolver?: (...args: any[]) => any;
  nonAgendaCellHeaderTemplateResolver?: (...args: any[]) => any;
  eventItemClick?: (...args: any[]) => any;
  onScrollLeft?: (...args: any[]) => any;
  onScrollRight?: (...args: any[]) => any;
  onScrollTop?: (...args: any[]) => any;
  onScrollBottom?: (...args: any[]) => any;
  renderEvent?: (eventItem: any) => any;
  getHoverAreaStyle?: (hoverParams: any) => React.CSSProperties;
  showBody?: boolean;
}

interface SchedulerState {
  contentHeight: any;
  contentScrollbarHeight: number;
  contentScrollbarWidth: number;
  resourceScrollbarHeight: number;
  resourceScrollbarWidth: number;
  scrollLeft: number;
  scrollTop: number;
  documentWidth: number;
  documentHeight: number;
  showBody: boolean;
}

class Scheduler extends Component<SchedulerProps, SchedulerState> {
  private schedulerResource: any;
  private schedulerResourceTitle: HTMLDivElement | undefined;
  private schedulerView: any;
  private currentArea: number;
  private schedulerContent: any;
  private schedulerContentBgTable: any;
  private schedulerHead: HTMLDivElement | undefined;
  private preHoverTime = 0;
  private resourceEventsSlots: any = [];
  private hasMovedOverScheduler = {
    left: false,
    right: false,
    up: false,
    down: false,
  };
  private DndResourceEvents: any;
  private eventDndSource: any;

  constructor(props: SchedulerProps) {
    super(props);
    const { schedulerData, dndSources } = props;
    let sources = [];
    sources.push(
      new DnDSource((prop: any) => prop.eventItem, EventItem),
    );
    if (dndSources && dndSources.length > 0) {
      sources = [...sources, ...dndSources];
    }
    // @ts-ignore
    const dndContext = new DnDContext(sources, ResourceEvents);
    this.currentArea = -1;
    schedulerData._setDocumentWidth(document.documentElement.clientWidth);
    this.state = {
      contentHeight: schedulerData.getSchedulerContentDesiredHeight(),
      contentScrollbarHeight: 17,
      contentScrollbarWidth: 17,
      resourceScrollbarHeight: 17,
      resourceScrollbarWidth: 17,
      scrollLeft: 0,
      scrollTop: 0,
      documentWidth: document.documentElement.clientWidth,
      documentHeight: document.documentElement.clientHeight,
      showBody: this.props.showBody!,
    };
    if (schedulerData.isSchedulerResponsive()) {
      window.onresize = this.onWindowResize;
    }

    this.DndResourceEvents = dndContext.getDropTarget();
    this.eventDndSource = dndContext.getDndSource();
  }

  static getDerivedStateFromProps(
    props: SchedulerProps,
    state: SchedulerState,
  ) {
    if (props.showBody !== state.showBody) {
      return { showBody: props.showBody };
    }
    return null;
  }

  onWindowResize = () => {
    const { schedulerData } = this.props;
    schedulerData._setDocumentWidth(document.documentElement.clientWidth);
    this.setState({
      documentWidth: document.documentElement.clientWidth,
      documentHeight: document.documentElement.clientHeight,
    });
  };

  scrollToSpecificTime = (): void => {
    const { schedulerData } = this.props;
    const { localeMoment, behaviors, config, selectDate } = schedulerData;
    const { dayVisibleStartFrom, dayStartTimeOffset, dayStartFrom } = config;
    schedulerData.setScrollToSpecialMoment(true);
    if (
      schedulerData.getScrollToSpecialMoment() &&
      !!behaviors.getScrollSpecialMomentFunc
    ) {
      if (
        !!this.schedulerContent &&
        this.schedulerContent.scrollWidth > this.schedulerContent.clientWidth
      ) {
        const start = localeMoment(selectDate).startOf('day');
        const end = localeMoment(selectDate).endOf('day');
        const isToday = localeMoment(selectDate).isSame(localeMoment(), 'day');
        const currentTime =
          localeMoment().hour() > dayStartTimeOffset
            ? localeMoment().hour() - dayStartTimeOffset
            : dayStartFrom;
        const visibleStartFrom = isToday ? currentTime : dayVisibleStartFrom;
        const specialMoment = behaviors.getScrollSpecialMomentFunc(
          schedulerData,
          visibleStartFrom,
        );

        if (specialMoment >= start && specialMoment <= end) {
          let offsetCell = 0;
          schedulerData.headers.forEach((item: any) => {
            const header = localeMoment(item.time);
            if (specialMoment > header) {
              offsetCell++;
            }
          });
          this.schedulerContent.scrollLeft =
            offsetCell * schedulerData.getContentCellWidth();
          schedulerData.setScrollToSpecialMoment(false);
        }
      }
    }
  };

  handleDraggingChanged(isDragging: boolean) {
    if (!isDragging) {
      this.hasMovedOverScheduler = {
        left: false,
        right: false,
        up: false,
        down: false,
      };
    }
  }

  handleHover(params: any): void {
    const { config } = this.props.schedulerData;
    if (!(this.schedulerContent && this.schedulerView)) {
      return;
    }
    if (this.preHoverTime === 0) {
      this.preHoverTime = new Date().valueOf();
    }
    const currentTime = new Date().valueOf();
    const interval = currentTime - this.preHoverTime;
    const baseScrollDistance = Math.round(interval * config.autoScrollingBaseSpeed / 1000);

    this.preHoverTime = new Date().valueOf();

    const { pointer, movement } = params;
    this.hasMovedOverScheduler = {
      left: this.hasMovedOverScheduler.left || movement.x < 0,
      right: this.hasMovedOverScheduler.right || movement.x > 0,
      up: this.hasMovedOverScheduler.up || movement.y > 0,
      down: this.hasMovedOverScheduler.down || movement.y < 0,
    };

    const { x: pointerX, y: pointerY } = pointer;
    const schedulerContentBound = this.schedulerContent.getBoundingClientRect();
    const schedulerViewBound = this.schedulerView.getBoundingClientRect();

    let scrollLeft = this.schedulerContent.scrollLeft;
    let scrollTop = this.schedulerView.scrollTop;
    if (this.hasMovedOverScheduler.left &&
      pointerX - schedulerContentBound.left < config.autoScrollingThreshold && this.schedulerContent.scrollLeft > 0) {
      scrollLeft = Math.max(0, this.schedulerContent.scrollLeft - baseScrollDistance * getScrollSpeedRate(
        pointerX - schedulerContentBound.left, config.autoScrollingThreshold,
      ));
    } else if (
      this.hasMovedOverScheduler.right && schedulerContentBound.right - pointerX < config.autoScrollingThreshold &&
      this.schedulerContent.scrollLeft < this.schedulerContent.scrollWidth - this.schedulerContent.clientWidth
    ) {
      scrollLeft = this.schedulerContent.scrollLeft + baseScrollDistance * getScrollSpeedRate(
        schedulerContentBound.right - pointerX, config.autoScrollingThreshold);
    }

    if (pointerY - schedulerViewBound.top < (config.autoScrollingThreshold + 30) && this.schedulerView.scrollTop > 0) {
      scrollTop = Math.max(0, this.schedulerView.scrollTop - baseScrollDistance * getScrollSpeedRate(
        pointerY - schedulerViewBound.top, config.autoScrollingThreshold + 30),
      );
    } else if (
      schedulerViewBound.bottom - pointerY < config.autoScrollingThreshold &&
      this.schedulerView.scrollTop < this.schedulerView.scrollHeight - this.schedulerView.clientHeight
    ) {
      scrollTop = this.schedulerView.scrollTop + baseScrollDistance * getScrollSpeedRate(
        schedulerViewBound.bottom - pointerY, config.autoScrollingThreshold,
      );
    }

    this.schedulerContent.scrollLeft = scrollLeft;
    this.schedulerView.scrollTop = scrollTop;
  }

  componentDidMount(): void {
    this.resolveScrollbarSize();
    this.scrollToSpecificTime();
  }

  componentDidUpdate(props: SchedulerProps): void {
    this.resolveScrollbarSize();
    if (this.props.showBody && this.props.showBody !== props.showBody) {
      this.scrollToSpecificTime();
    }
  }

  render() {
    const {
      schedulerData,
      leftCustomHeader,
      rightCustomHeader,
    } = this.props;
    const {
      renderData,
      config,
      startDate,
      endDate,
      localeMoment,
    } = schedulerData;
    const start = localeMoment(startDate).startOf('day');
    const end = localeMoment(endDate).endOf('day');
    const width = schedulerData.getSchedulerWidth();
    const cellWidth = schedulerData.getContentCellWidth();
    const resourceTableWidth = schedulerData.getResourceTableWidth();
    const schedulerContainerWidth = width - resourceTableWidth;
    const schedulerWidth = schedulerData.getContentTableWidth();
    const displayRenderData = renderData.filter((o: any) => o.render);
    this.resourceEventsSlots = displayRenderData.map(() => (React.createRef()));
    const contentScrollbarHeight = this.state.contentScrollbarHeight;
    const contentScrollbarWidth = this.state.contentScrollbarWidth;
    const resourceScrollbarHeight = this.state.resourceScrollbarHeight;
    const resourceScrollbarWidth = this.state.resourceScrollbarWidth;
    const contentHeight = this.state.contentHeight;
    const resourcePaddingBottom =
      resourceScrollbarHeight === 0 ? contentScrollbarHeight : 0;
    const contentPaddingBottom =
      contentScrollbarHeight === 0 ? resourceScrollbarHeight : 0;
    let schedulerContentStyle: React.CSSProperties = {
      paddingBottom: contentPaddingBottom,
    };
    let resourceContentStyle: React.CSSProperties = {
      overflowX: 'auto',
      overflowY: 'auto',
      width: resourceTableWidth + resourceScrollbarWidth - 2,
      margin: `0px -${contentScrollbarWidth}px 0px 0px`,
    };
    if (config.schedulerMaxHeight > 0) {
      schedulerContentStyle = {
        ...schedulerContentStyle,
        maxHeight: config.schedulerMaxHeight - config.tableHeaderHeight,
      };
      resourceContentStyle = {
        ...resourceContentStyle,
        maxHeight: config.schedulerMaxHeight - config.tableHeaderHeight,
      };
    }
    const generateHeightStyles = (height: number) => ({
      height: `${height}px`,
    });

    const resourceName = schedulerData.isEventPerspective
      ? config.taskName
      : config.resourceName;
    let schedulerHeader = <div/>;
    if (config.headerEnabled) {
      schedulerHeader = (
        <SchedulerHeader
          title={leftCustomHeader}
          schedulerData={schedulerData}
          onViewChange={this.onViewChange}
          goToToday={this.goToToday}
          goBack={this.goBack}
          goNext={this.goNext}
          onSelect={this.onSelect}
          rightCustomHeader={rightCustomHeader}
        />
      );
    }
    const { showBody } = this.props;
    return (
      <>
        <DnDObserver onDraggingChanged={this.handleDraggingChanged.bind(this)}/>
        <div id="RBS-Scheduler-root"
          className={`scheduler-wrapper ${styles.schedulerWrapper}`}>
          <div className="scheduler-header" style={{ width: `${width}px` }}>
            {schedulerHeader}
          </div>
          {showBody && (
            <div
              className={`scheduler-body ${styles.schedulerBody}`}
            >
              <div
                className={`scheduler-table-header ${styles.schedulerTableHeader}`}>
                <div
                  className={styles.resourceTitle}
                  style={{
                    width: resourceTableWidth,
                  }}
                  ref={this.schedulerResourceTitleRef}
                >
                  {resourceName}
                </div>
                <div
                  className={styles.timeHeaderContainer}
                  style={{ width: schedulerContainerWidth - contentScrollbarWidth }}
                >
                  <div
                    style={{
                      overflowX: 'scroll',
                      overflowY: 'hidden',
                      height: config.tableHeaderHeight,
                    }}
                    ref={this.schedulerHeadRef}
                    onMouseOver={this.onSchedulerHeadMouseOver}
                    onMouseOut={this.onSchedulerHeadMouseOut}
                    onScroll={this.onSchedulerHeadScroll}
                  >
                    <div
                      style={{
                        // paddingRight: `${contentScrollbarWidth}px`,
                        width: schedulerWidth,
                      }}
                    >
                      <table className="scheduler-bg-table">
                        <HeaderView
                          headers={schedulerData.headers}
                          cellUnit={schedulerData.cellUnit}
                          localeMoment={localeMoment}
                          config={schedulerData.config}
                          cellWidth={cellWidth}
                          headerHeight={schedulerData.getTableHeaderHeight()}
                          minuteStepsInHour={schedulerData.getMinuteStepsInHour()}
                        />
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div
                ref={this.schedulerViewRef}
                className={`scheduler-table-body ${styles.schedulerTableBody}`}
                style={{ width: `${width + contentScrollbarWidth}px`, paddingRight: contentScrollbarWidth }}
              >
                <div>
                  <ul
                    className={styles.resourceList}
                    ref={this.schedulerResourceRef}
                    style={{ width: resourceTableWidth }}
                  >
                    {renderData.map((resource: any) => (
                      <li
                        key={resource.slotId}
                        className={styles.resourceItem}
                        style={generateHeightStyles(resource.rowHeight)}
                      >
                        {resource.slotName}
                      </li>
                    ))}
                  </ul>
                  <div
                    className={classnames('scheduler-view', styles.schedulerView)}
                    style={{ width: schedulerContainerWidth - contentScrollbarWidth, verticalAlign: 'top' }}
                  >
                    <div
                      ref={this.schedulerContentRef}
                      className={styles.schedulerContent}
                      style={schedulerContentStyle}
                      onMouseOver={this.onSchedulerContentMouseOver}
                      onMouseOut={this.onSchedulerContentMouseOut}
                      onScroll={this.onSchedulerContentScroll}
                    >
                      <div style={{ width: schedulerWidth, height: contentHeight }}>
                        <div className="scheduler-content-table-container">
                          <table className="scheduler-content-table">
                            <tbody>
                              <ResourceEventsList
                                DndResourceEvents={this.DndResourceEvents}
                                eventDndSource={this.eventDndSource}
                                displayRenderData={displayRenderData}
                                onHover={this.handleHover.bind(this)}
                                {...this.props}
                              />
                            </tbody>
                          </table>
                        </div>
                        <div className="scheduler-bg">
                          <table
                            className="scheduler-bg-table"
                            style={{ width: schedulerWidth }}
                            ref={this.schedulerContentBgTableRef}
                          >
                            <Background
                              config={config}
                              cellWidth={cellWidth}
                              renderData={schedulerData.renderData}
                              headers={schedulerData.headers}
                            />
                          </table>
                        </div>
                      </div>
                      <TimeLine
                        maxWidth={schedulerData.getContentTableWidth()}
                        startTime={start}
                        endTime={end}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  resolveScrollbarSize = () => {
    const { schedulerData } = this.props;
    let contentScrollbarHeight = 17;
    let contentScrollbarWidth = 17;
    let resourceScrollbarHeight = 17;
    let resourceScrollbarWidth = 17;
    let contentHeight = schedulerData.getSchedulerContentDesiredHeight();
    if (this.schedulerContent) {
      contentScrollbarHeight =
        this.schedulerContent.offsetHeight - this.schedulerContent.clientHeight;
      contentScrollbarWidth =
        this.schedulerContent.offsetWidth - this.schedulerContent.clientWidth;
    }
    if (this.schedulerResource) {
      resourceScrollbarHeight =
        this.schedulerResource.offsetHeight -
        this.schedulerResource.clientHeight;
      resourceScrollbarWidth =
        this.schedulerResource.offsetWidth - this.schedulerResource.clientWidth;
    }
    if (
      !!this.schedulerContentBgTable &&
      !!this.schedulerContentBgTable.offsetHeight
    ) {
      contentHeight = this.schedulerContentBgTable.offsetHeight;
    }
    let tmpState = {};
    let needSet = false;
    if (contentScrollbarHeight !== this.state.contentScrollbarHeight) {
      tmpState = {
        ...tmpState,
        contentScrollbarHeight,
      };
      needSet = true;
    }
    if (contentScrollbarWidth !== this.state.contentScrollbarWidth) {
      tmpState = { ...tmpState, contentScrollbarWidth };
      needSet = true;
    }
    if (contentHeight !== this.state.contentHeight) {
      tmpState = { ...tmpState, contentHeight };
      needSet = true;
    }
    if (resourceScrollbarHeight !== this.state.resourceScrollbarHeight) {
      tmpState = {
        ...tmpState,
        resourceScrollbarHeight,
      };
      needSet = true;
    }
    if (resourceScrollbarWidth !== this.state.resourceScrollbarWidth) {
      tmpState = {
        ...tmpState,
        resourceScrollbarWidth,
      };
      needSet = true;
    }
    if (needSet) {
      this.setState(tmpState);
    }
  };
  schedulerHeadRef = (element: HTMLDivElement) => {
    this.schedulerHead = element;
  };
  onSchedulerHeadMouseOver = () => {
    this.currentArea = 2;
  };
  onSchedulerHeadMouseOut = () => {
    this.currentArea = -1;
  };
  onSchedulerHeadScroll = () => {
    if (!this.schedulerHead) {
      return;
    }
    if (
      (this.currentArea === 2 || this.currentArea === -1) &&
      this.schedulerContent.scrollLeft !== this.schedulerHead.scrollLeft
    ) {
      this.schedulerContent.scrollLeft = this.schedulerHead.scrollLeft;
    }
  };
  schedulerResourceRef = (element: HTMLUListElement) => {
    this.schedulerResource = element;
  };

  schedulerResourceTitleRef = (element: HTMLDivElement) => {
    this.schedulerResourceTitle = element;
  };
  schedulerViewRef = (element: HTMLDivElement) => {
    this.schedulerView = element;
  };
  onSchedulerResourceMouseOver = () => {
    this.currentArea = 1;
  };
  onSchedulerResourceMouseOut = () => {
    this.currentArea = -1;
  };
  onSchedulerResourceScroll = () => {
    if (
      (this.currentArea === 1 || this.currentArea === -1) &&
      this.schedulerContent.scrollTop !== this.schedulerResource.scrollTop
    ) {
      this.schedulerContent.scrollTop = this.schedulerResource.scrollTop;
    }
  };
  schedulerContentRef = (element: HTMLDivElement) => {
    this.schedulerContent = element;
  };
  schedulerContentBgTableRef = (element: HTMLTableElement) => {
    this.schedulerContentBgTable = element;
  };
  onSchedulerContentMouseOver = () => {
    this.currentArea = 0;
  };
  onSchedulerContentMouseOut = () => {
    this.currentArea = -1;
  };
  onSchedulerContentScroll = () => {
    if (
      this.schedulerHead &&
      (this.currentArea === 0 || this.currentArea === -1)
    ) {
      if (this.schedulerHead.scrollLeft !== this.schedulerContent.scrollLeft) {
        this.schedulerHead.scrollLeft = this.schedulerContent.scrollLeft;
      }
      if (this.schedulerResource.scrollTop !== this.schedulerContent.scrollTop) {
        this.schedulerResource.scrollTop = this.schedulerContent.scrollTop;
      }
    }
    const {
      schedulerData,
      onScrollLeft,
      onScrollRight,
      onScrollTop,
      onScrollBottom,
    } = this.props;
    const { scrollLeft, scrollTop } = this.state;
    if (this.schedulerContent.scrollLeft !== scrollLeft) {
      if (this.schedulerContent.scrollLeft === 0 && onScrollLeft) {
        onScrollLeft(
          schedulerData,
          this.schedulerContent,
          this.schedulerContent.scrollWidth - this.schedulerContent.clientWidth,
        );
      }
      if (
        this.schedulerContent.scrollLeft ===
        this.schedulerContent.scrollWidth -
        this.schedulerContent.clientWidth &&
        onScrollRight
      ) {
        onScrollRight(
          schedulerData,
          this.schedulerContent,
          this.schedulerContent.scrollWidth - this.schedulerContent.clientWidth,
        );
      }
    } else if (this.schedulerContent.scrollTop !== scrollTop) {
      if (this.schedulerContent.scrollTop === 0 && onScrollTop) {
        onScrollTop(
          schedulerData,
          this.schedulerContent,
          this.schedulerContent.scrollHeight -
          this.schedulerContent.clientHeight,
        );
      }
      if (
        this.schedulerContent.scrollTop ===
        this.schedulerContent.scrollHeight -
        this.schedulerContent.clientHeight &&
        onScrollBottom
      ) {
        onScrollBottom(
          schedulerData,
          this.schedulerContent,
          this.schedulerContent.scrollHeight -
          this.schedulerContent.clientHeight,
        );
      }
    }
    this.setState({
      scrollLeft: this.schedulerContent.scrollLeft,
      scrollTop: this.schedulerContent.scrollTop,
    });
  };
  onViewChange = (e: any) => {
    const { onViewChange, schedulerData } = this.props;
    const viewType = parseInt(e.target.value.charAt(0), 10);
    const showAgenda = e.target.value.charAt(1) === '1';
    const isEventPerspective = e.target.value.charAt(2) === '1';
    onViewChange(schedulerData, {
      viewType,
      showAgenda,
      isEventPerspective,
    });
  };
  goToToday = () => {
    const { onTodayClick, schedulerData } = this.props;
    schedulerData.setDate();
    onTodayClick(schedulerData);
  };
  goNext = () => {
    const { nextClick, schedulerData } = this.props;
    schedulerData.next();
    nextClick(schedulerData);
  };
  goBack = () => {
    const { prevClick, schedulerData } = this.props;
    schedulerData.prev();
    prevClick(schedulerData);
  };
  onSelect = (date: moment.Moment) => {
    const { onSelectDate, schedulerData } = this.props;
    schedulerData.setDate(date);
    onSelectDate(schedulerData, date);
  };
}

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export * from './constants/ViewTypes';
export * from './constants/CellUnits';
export * from './constants/SummaryPos';
export * from './models/SchedulerData';
export * from './DnDSource';
export * from './DnDContext';
export * from '../lib';
export { DEFAULT_CONFIG };
export default Scheduler;
