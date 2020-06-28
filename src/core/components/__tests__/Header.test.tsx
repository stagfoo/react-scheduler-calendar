import { mount, shallow } from 'enzyme';
import moment from 'moment';
import React from 'react';
import { views } from 'src/core/components/_mockData/config';
import 'src/setupTest';
import Header, { Props } from '../Header';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('selected area', () => {
  let props: Props;
  const onViewChange = jest.fn();
  const goToToday = jest.fn();
  const goBack = jest.fn();
  const goNext = jest.fn();
  const onSelect = jest.fn();

  beforeEach(() => {
    props = {
      title: 'header',
      onViewChange,
      goToToday,
      goBack,
      goNext,
      onSelect,
      rightCustomHeader: 'customHeader',
      selectDate: '2020-04-22 10:00:00',
      localeMoment: moment,
      headerGroupView: {
        viewType: 1,
        showAgenda: false,
        isEventPerspective: false,
        dateLabel: 'dateLabel',
      },
      config: { views, calendarPopoverEnabled: true },
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<Header {...props}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should change visible when call onVisibleChange', () => {
    const wrapper = mount(<Header {...props}/>);
    const onVisibleChange = wrapper.find('Popover').prop('onVisibleChange') as () => void;

    onVisibleChange();

    expect(wrapper.find('Popover').prop('visible')).toEqual(false);
  });
});
