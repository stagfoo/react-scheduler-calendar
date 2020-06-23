import React from 'react';

interface Props {
  name: string;
}

export const TaskCard: React.FC<Props> = (props) => (
  <div style={{ border: '1px solid #0a0000', padding: 20 }}>
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

export default TaskCard;
