import React from 'react';
import { UserOutlined } from '@ant-design/icons';

interface Props {
  name: string;
}

export const TechnicianCard: React.FC<Props> = (props) => (
  <div>
    <UserOutlined />
    { props.name }
  </div>
);

export default TechnicianCard;
