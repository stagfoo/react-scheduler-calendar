import { shallow } from 'enzyme';
import React from 'react';
import '../setupTest';
import TechnicianCard from '../technicianCard';

describe('technician card', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<TechnicianCard name={'name'}/>);
    expect(wrapper).toMatchSnapshot();
  });
});
