import { shallow } from 'enzyme';
import React from 'react';
import SelectedArea from '../SelectedArea';
import 'src/setupTest';

describe('selected area', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SelectedArea />);
    expect(wrapper).toMatchSnapshot();
  });
});
