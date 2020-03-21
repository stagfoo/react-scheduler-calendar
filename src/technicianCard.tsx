import React from 'react';


interface Props {
  name: string;
}

export const TechnicianCard: React.FC<Props> = (props) => (
  <div>
    { props.name }
  </div>
);

export default TechnicianCard;
