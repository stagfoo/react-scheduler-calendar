import { Card } from 'antd';
import React from 'react';

interface Props {
  name: string;
}

export const JobCard: React.FC<Props> = (props) => (
  <Card style={ { background: 'rgba(255,255,255,0.45)' } }>
    <div>
      {props.name}
    </div>
    <div>
      Tom Zhang
    </div>
  </Card>
);

export default JobCard;
