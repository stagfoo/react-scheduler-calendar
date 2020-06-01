import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const withDnDContext = <P extends {}>(PureComponent: React.ComponentType<P>): React.FC<P> => {
  return (props) => (
    <DndProvider backend={HTML5Backend}>
      <PureComponent {...props}/>
    </DndProvider>
  );
};


export default withDnDContext;
