import moment from 'moment';
import React, { Component } from 'react';
import DnDObserver from 'src/core/components/DnDObserver';
import ResourceEventsList from 'src/core/components/ResourceEventsList';
import { getScrollSpeedRate } from 'src/core/utils/Util';
import TimeLine from '../lib/TimeLine';
import AgendaView from './components/AgendaView';
import Background from 'src/core/components/Background';
import EventItem from './components/EventItem';
import HeaderView from './components/HeaderView';
import ResourceEvents from './components/ResourceEvents';
import ResourceView from './components/ResourceView';
import SchedulerHeader from './components/SchedulerHeader';
import config from './constants/config';
import DnDContext from './DnDContext';
import { DnDSource } from './DnDSource';
import styles from './styles/index.module.scss';
import './styles/style.css';

export interface SchedulerProps {
  schedulerData: any;
  renderResourceList?: (...args: any[]) => any;
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
  leftCustomHeader?: object;
  rightCustomHeader?: object;
  newEvent?: (...args: any[]) => any;
  subtitleGetter?: (...args: any[]) => any;
  eventItemClick?: (...args: any[]) => any;
  viewEventClick?: (...args: any[]) => any;
  viewEventText?: string;
  viewEvent2Click?: (...args: any[]) => any;
  viewEvent2Text?: string;
  conflictOccurred?: (...args: any[]) => any;
  eventItemTemplateResolver?: (...args: any[]) => any;
  dndSources?: any[];
  slotClickedFunc?: (...args: any[]) => any;
  toggleExpandFunc?: (...args: any[]) => any;
  slotItemTemplateResolver?: (...args: any[]) => any;
  nonAgendaCellHeaderTemplateResolver?: (...args: any[]) => any;
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
        pointerY - schedulerViewBound.top, config.autoScrollingThreshold + 30)
      );
    } else if (
      schedulerViewBound.bottom - pointerY < config.autoScrollingThreshold &&
      this.schedulerView.scrollTop < this.schedulerView.scrollHeight - this.schedulerView.clientHeight
    ) {
      scrollTop = this.schedulerView.scrollTop + baseScrollDistance * getScrollSpeedRate(
        schedulerViewBound.bottom - pointerY, config.autoScrollingThreshold
      );
    }

    this.schedulerContent.scrollLeft = scrollLeft;
    this.schedulerView.scrollTop = scrollTop;
  }

  componentDidMount(): void {
    this.resolveScrollbarSize();
    this.scrollToSpecificTime();
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
      renderResourceList,
    } = this.props;
    const {
      renderData,
      showAgenda,
      config,
      startDate,
      endDate,
      localeMoment,
    } = schedulerData;
    const start = localeMoment(startDate).startOf('day');
    const end = localeMoment(endDate).endOf('day');
    const width = schedulerData.getSchedulerWidth();
    let tbodyContent = <tr/>;
    if (showAgenda) {
      tbodyContent = <AgendaView {...this.props} />;
    } else {
      const resourceTableWidth = schedulerData.getResourceTableWidth();
      const schedulerContainerWidth = width - resourceTableWidth + 1;
      const schedulerWidth = schedulerData.getContentTableWidth() - 1;
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
      const resourceName = schedulerData.isEventPerspective
        ? config.taskName
        : config.resourceName;
      tbodyContent = (
        <tr>
          <td
            className="resource-list"
            style={{ width: resourceTableWidth }}
          >
            {renderResourceList ? (
              renderResourceList(
                resourceName,
                displayRenderData,
                this.schedulerResourceRef,
              )
            ) : (
              <div className="resource-view">
                <div
                  style={{
                    overflow: 'hidden',
                    height: config.tableHeaderHeight,
                  }}
                >
                  <div
                    style={{
                      overflowX: 'scroll',
                      overflowY: 'hidden',
                      margin: `0px 0px -${contentScrollbarHeight}px`,
                    }}
                  >
                    <table className="resource-table">
                      <thead>
                        <tr style={{ height: config.tableHeaderHeight }}>
                          <th className="header3-text">{resourceName}</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
                <div
                  style={resourceContentStyle}
                  ref={this.schedulerResourceRef}
                  onMouseOver={this.onSchedulerResourceMouseOver}
                  onMouseOut={this.onSchedulerResourceMouseOut}
                  onScroll={this.onSchedulerResourceScroll}
                >
                  <ResourceView
                    {...this.props}
                    contentScrollbarHeight={resourcePaddingBottom}
                  />
                </div>
              </div>
            )}
          </td>
          <td className="scheduler-cell">
            <div
              className="scheduler-view"
              style={{ width: schedulerContainerWidth, verticalAlign: 'top' }}
            >
              <div
                style={{
                  overflow: 'hidden',
                  borderBottom: '1px solid #e9e9e9',
                  height: config.tableHeaderHeight,
                }}
              >
                <div
                  style={{
                    overflowX: 'scroll',
                    overflowY: 'hidden',
                    margin: `0px 0px -${contentScrollbarHeight}px`,
                  }}
                  ref={this.schedulerHeadRef}
                  onMouseOver={this.onSchedulerHeadMouseOver}
                  onMouseOut={this.onSchedulerHeadMouseOut}
                  onScroll={this.onSchedulerHeadScroll}
                >
                  <div
                    style={{
                      paddingRight: `${contentScrollbarWidth}px`,
                      width: schedulerWidth + contentScrollbarWidth,
                    }}
                  >
                    <table className="scheduler-bg-table">
                      <HeaderView {...this.props} />
                    </table>
                  </div>
                </div>
              </div>
              <div
                className={styles.schedulerContent}
                style={schedulerContentStyle}
                ref={this.schedulerContentRef}
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
                        cellWidth={schedulerData.getContentCellWidth()}
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
          </td>
        </tr>
      );
    }
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
        <DnDObserver onDraggingChanged={this.handleDraggingChanged.bind(this)} />
        <div className={`scheduler-wrapper ${styles.schedulerWrapper}`}>
          <div className="scheduler-header" style={{ width: `${width}px` }}>
            {schedulerHeader}
          </div>
          {showBody && (
            <div
              className={`scheduler-body ${styles.schedulerBody}`}
              ref={this.schedulerViewRef}
            >
              <table
                id="RBS-Scheduler-root"
                className={styles.schedulerContainer}
                style={{ width: `${width}px` }}
              >
                <tbody>{tbodyContent}</tbody>
              </table>
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
  schedulerResourceRef = (element: HTMLDivElement) => {
    this.schedulerResource = element;
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
    const viewType = parseInt(e.target.value.charAt(0));
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
export * from './components/AddMorePopover';
export * from '../lib';
export { config };
export default Scheduler;
