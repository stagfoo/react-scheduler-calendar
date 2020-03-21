import moment from 'moment';
import React, { useEffect, useState } from 'react';

interface Interface {
  startTime: moment.Moment;
  endTime: moment.Moment;
  maxWidth: number;
}

const TimeLine: React.FC<Interface> = (props: Interface) => {
  const [currentTime, setCurrentTime] = useState(moment());
  const { startTime, endTime, maxWidth } = props;
  const progress = currentTime.diff(startTime) / endTime.diff(startTime);
  const width = Math.round(progress * maxWidth);
  useEffect(() => {
    const intervalId = setInterval(
      () => setCurrentTime(moment()),
      10000,
    );
    return () => clearInterval(intervalId);
  });

  return (
    <>
      {
        currentTime.isBetween(startTime, endTime) &&
        <div
          className={'timeMark'}
          style={{ width }}
        >
          <span className='timeText'> {currentTime.format('h:mm a')} </span>
        </div>
      }
    </>
  );
};
export default TimeLine;
