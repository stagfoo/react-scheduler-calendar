# react-scheduler-calendar

> React component for scheduling/planing in calendar

[![NPM](https://img.shields.io/npm/v/react-scheduler-calendar.svg)](https://www.npmjs.com/package/react-scheduler-calendar)
[![NPM Downloads](https://img.shields.io/npm/dw/react-scheduler-calendar)](https://www.npmjs.com/package/react-scheduler-calendar)

![Build](https://github.com/NGC-AB/react-scheduler-calendar/workflows/NPM%20build/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License](https://img.shields.io/github/license/NGC-AB/react-scheduler-calendar.svg)](https://github.com/NGC-AB/react-scheduler-calendar/blob/master/LICENSE)


## Install

```bash
npm install --save react-scheduler-calendar
```

## Usage

- Import antDesign style file

```tsx
import 'antd/dist/antd.css';
```
or you can use less file to support customizing the theme: https://ant.design/docs/react/customize-theme:

```tsx
import 'antd/dist/antd.less';
```

- Using in your component
```tsx
import React from 'react'

import Scheduler from 'react-scheduler-calendar'

class Example extends React.Component {
  render () {
    return (
      <Scheduler />
    )
  }
}
```


## Setup Sonar Server In Local

```shell script
make start
```
Goto [http://localhost:9005/projects?sort=-analysis_date](http://localhost:9005/projects?sort=-analysis_date) to view the main interface.

Since there is no test report upload for any project at present, you cannot see any analysis results, so you need to upload the test report first.

```shell script
yarn sonar-check
```

After running this command, you will see `react-scheduler-calendar` Analysis report.


## License

MIT © [NGC-AB](https://github.com/NGC-AB)
