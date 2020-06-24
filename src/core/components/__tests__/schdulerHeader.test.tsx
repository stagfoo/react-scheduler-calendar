import { shallow } from 'enzyme';
import moment from 'moment';
import React from 'react';
import 'src/setupTest';
import Header, { Props } from '../Header';

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
      config: { views: [] },
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<Header {...props}/>);
    expect(wrapper).toMatchSnapshot();
  });
});
