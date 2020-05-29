import React from 'react';

interface Props {
  name: string;
}

export const JobCard: React.FC<Props> = (props) => (
  <div style={{ backgroundColor: 'white', padding: 20 }}>
    <div>
      {props.name}
    </div>
    <div>San Zhang</div>
    <div>xx Street, OKC, CA 12345</div>
    <div>
      Tom Zhang
    </div>
  </div>
);

export default JobCard;
