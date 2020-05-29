import { UserOutlined } from '@ant-design/icons';
import React from 'react';

interface Props {
  name: string;
}

export const TechnicianCard: React.FC<Props> = (props) => (
  <div>
    <UserOutlined/>
    {props.name}
  </div>
);

export default TechnicianCard;
