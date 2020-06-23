import ExampleComponent from 'example/src/examples/example';
import React, { Component } from 'react';

import styles from './styles/index.module.scss';

export default class App extends Component {
  render() {
    return (
      <div className={styles.container}>
        <header>
          <div className={styles.title}>
            React-Scheduler-Calendar
          </div>
          <div className={styles.menu}>
            <ul>
              <li>
                <a href="/react-scheduler-calendar/">
                  Documentation
                </a>
                </li>
              <li>
                <a target="_blank"
                   href="https://github.com/NGC-AB/react-scheduler-calendar">
                  Github
                </a>
              </li>
            </ul>
          </div>
        </header>
        <div className={styles.body}>
          <aside>
            <nav>
              <ul>
                <li>Custom Event</li>
                <li>Custom Resource</li>
                <li>Drag and Drop</li>
              </ul>
            </nav>
            <footer className={styles.footer}>
              ©<span>{new Date().getFullYear()}</span> NGC-AB all right reserved.
            </footer>
          </aside>
          <div className={styles.content}>
            <ExampleComponent/>
          </div>
        </div>

      </div>
    );
  }
}
