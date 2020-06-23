import { shallow } from 'enzyme';
import React from 'react';
import 'src/setupTest';
import ResourceCard from 'src/resourceCard';

describe('resourceCard', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ResourceCard name={'name'}/>);
    expect(wrapper).toMatchSnapshot();
  });
});
