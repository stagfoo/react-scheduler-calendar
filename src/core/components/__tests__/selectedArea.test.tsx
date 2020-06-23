import { shallow, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import SelectedArea from '../SelectedArea';

configure({ adapter: new Adapter() });

describe('selected area', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<SelectedArea />);
    expect(wrapper).toMatchSnapshot();
  });
});
