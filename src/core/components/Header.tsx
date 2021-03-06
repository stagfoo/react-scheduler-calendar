import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Calendar, Col, Popover, Radio, Row } from 'antd';
import moment from 'moment';
import React, { ReactNode } from 'react';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

type noopType = (args: any) => any;

interface HeaderViewConfig {
  viewType: number;
  showAgenda: boolean;
  isEventPerspective: boolean;
  dateLabel: string;
}

export interface Props {
  title?: string | ReactNode;
  onViewChange: noopType;
  goToToday: noopType;
  goBack: noopType;
  goNext: noopType;
  onSelect: noopType;
  rightCustomHeader?: string | ReactNode;
  selectDate: string;
  localeMoment: typeof moment;
  headerGroupView: HeaderViewConfig;
  config: any;
}

interface State {
  visible: boolean;
}

class Header extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  renderRadioButtonList(config: any) {
    return config.views.map((item: any) => (
      <RadioButton
        key={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
        value={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
      >
        <span style={{ margin: '0px 8px' }}>{item.viewName}</span>
      </RadioButton>
    ));
  }

  renderPopover = () => {
    const { onSelect, localeMoment, selectDate } = this.props;
    return (
      <div className="popover-calendar">
        <Calendar
          fullscreen={false}
          onSelect={(args): void => {
            this.setState({ visible: false });
            onSelect(args);
          }}
          value={localeMoment(selectDate)}
        />
      </div>
    );
  };

  handleVisibleChange = (visible: boolean): void => {
    this.setState({ visible });
  };

  render() {
    const {
      title, onViewChange, goToToday, goNext, goBack, rightCustomHeader, config, headerGroupView,
    } = this.props;
    const { dateLabel, viewType, showAgenda, isEventPerspective } = headerGroupView;
    const defaultValue = `${viewType}${showAgenda ? 1 : 0}${isEventPerspective ? 1 : 0}`;
    const calendarPopoverEnabled = config.calendarPopoverEnabled;

    return (
      <Row align="middle" justify="space-between" style={{ marginBottom: '7px' }}>
        {title}
        <Col>
          <RadioGroup defaultValue={defaultValue} onChange={onViewChange}>
            {this.renderRadioButtonList(config)}
          </RadioGroup>
        </Col>
        <Col>
          <div className="header2-text calendar-action-header">
            <Button style={{ marginRight: '24px' }} onClick={goToToday}>
              Today
            </Button>
            <LeftOutlined style={{ marginRight: '4px' }} className="icon-nav" onClick={goBack}/>
            <RightOutlined style={{ marginLeft: '4px' }} className="icon-nav" onClick={goNext}/>
            {calendarPopoverEnabled ? (
              <Popover
                content={this.renderPopover()}
                placement="bottomRight"
                trigger="click"
                visible={this.state.visible}
                onVisibleChange={this.handleVisibleChange}
              >
                <span className={'header2-text-label'} style={{ cursor: 'pointer', marginLeft: '16px' }}>
                  <CalendarOutlined style={{ marginRight: '8px' }} className="icon-nav"/>
                  {moment(dateLabel).format('MMM DD')}
                </span>
              </Popover>
            ) : (
              <span className={'header2-text-label'}>{dateLabel}</span>
            )}
          </div>
        </Col>
        {rightCustomHeader}
      </Row>
    );
  }
}

export default Header;
