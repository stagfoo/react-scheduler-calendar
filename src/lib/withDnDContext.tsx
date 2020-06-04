import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

export const withDnDContext = <P extends {}>(PureComponent: React.ComponentType<P>): React.FC<P> => {
  const supportTouch = 'ontouchstart' in window;
  const backend = supportTouch ? TouchBackend : HTML5Backend;
  return (props) => (
    <DndProvider backend={backend}>
      <PureComponent {...props}/>
    </DndProvider>
  );
};


export default withDnDContext;
