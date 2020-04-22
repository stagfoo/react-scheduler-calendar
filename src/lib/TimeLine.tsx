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
  const width = Math.min(Math.round(progress * maxWidth), maxWidth);

  const isBeforeToday = progress < 0;
  const isAfterToday = progress > 1;

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
        (!isBeforeToday) &&
        <div
          className={'timeMark'}
          style={isAfterToday ? {width, border: 'none'} : {width}}
        >
          <div className={isAfterToday ? '' : 'timeMarkPoint'} />
          <span className='timeText' hidden={isAfterToday}> {currentTime.format('h:mm a')} </span>
        </div>
      }
    </>
  );
};
export default TimeLine;
