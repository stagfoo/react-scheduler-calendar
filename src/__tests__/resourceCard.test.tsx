import { shallow } from 'enzyme';
import React from 'react';
import 'src/setupTest';
import ResourceCard from 'src/resourceCard';

describe('resource card', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ResourceCard name={'name'}/>);
    expect(wrapper).toMatchSnapshot();
  });
});
