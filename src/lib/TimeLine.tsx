import moment from 'moment';
import React, { useEffect, useState } from 'react';

interface Interface {
  startTime: moment.Moment;
  endTime: moment.Moment;
  maxWidth: number;
}

const TimeLine: React.FC<Interface> = (props: Interface) => {
  const [currentTime, setCurrentTime] = useState(moment());
  const {startTime, endTime, maxWidth} = props;
  const progress = currentTime.diff(startTime) / endTime.diff(startTime);
  const width = Math.min(Math.round(progress * maxWidth), maxWidth);

  const isBeforeToday = currentTime.isAfter(endTime);
  const isAfterToday = currentTime.isBefore(startTime);

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
        (!isAfterToday) &&
        <div
          className='timeMark'
          style={isBeforeToday ? {width, border: 'none'} : {width}}
        >
          {
            (!isBeforeToday) &&
            <>
              <div className='timeMarkPoint' />
              <span className='timeText'> {currentTime.format('h:mm a')} </span>
            </>
          }
        </div>
      }
    </>
  );
};
export default TimeLine;
