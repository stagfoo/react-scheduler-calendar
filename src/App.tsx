import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import ReactSchedulerCalendar from '.';

const App = () => (
  <div>
    <ReactSchedulerCalendar />
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
