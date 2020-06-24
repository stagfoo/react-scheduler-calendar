import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import React, { Component } from 'react';
import { SchedulerData } from 'src/core';
import ResourceCard from '../../resourceCard';

interface ResourceViewProps {
  schedulerData: SchedulerData;
  contentScrollbarHeight: number;
  slotClickedFunc?: (...args: any[]) => any;
  slotItemTemplateResolver?: (...args: any[]) => any;
  toggleExpandFunc?: (...args: any[]) => any;
}

class ResourceView extends Component<ResourceViewProps> {
  handleClick = (toggleExpandFunc: ((...args: any[]) => any) | undefined, schedulerData: SchedulerData, item: any) => {
    return () => {
      if (toggleExpandFunc) {
        toggleExpandFunc(schedulerData, item.slotId);
      }
    };
  };

  render() {
    const {
      schedulerData,
      contentScrollbarHeight, slotClickedFunc, slotItemTemplateResolver, toggleExpandFunc,
    } = this.props;
    const { renderData } = schedulerData;
    const width = schedulerData.getResourceTableWidth() - 2;
    const paddingBottom = contentScrollbarHeight;
    const displayRenderData = renderData.filter((o: any) => o.render);
    const resourceList = displayRenderData.map((item: any) => {
      const indents = [];
      for (let i = 0; i < item.indent; i++) {
        indents.push(<span key={`es${i}`} className="expander-space"/>);
      }
      let indent = <span key={`es${item.indent}`} className="expander-space"/>;
      if (item.hasChildren) {
        indent = item.expanded ? (
          <MinusSquareOutlined
            key={`es${item.indent}`}
            onClick={this.handleClick(toggleExpandFunc, schedulerData, item)}
          />
        ) : (
          <PlusSquareOutlined
            key={`es${item.indent}`}
            onClick={this.handleClick(toggleExpandFunc, schedulerData, item)}
          />
        );
      }
      indents.push(indent);
      const a = slotClickedFunc ? (
        <span className="slot-cell">
          {indents}
          <a
            className="slot-text"
            onClick={() => {
              slotClickedFunc(schedulerData, item);
            }}
          >
            {item.slotName}
          </a>
        </span>
      ) : (
        <span className="slot-cell">
          {indents}
          <span className="slot-text">
            <ResourceCard name={item.slotName}/>
          </span>
        </span>
      );
      let slotItem = (
        <div title={item.slotName} className="overflow-text header2-text" style={{ textAlign: 'left' }}>
          {a}
        </div>
      );
      if (slotItemTemplateResolver) {
        const temp = slotItemTemplateResolver(schedulerData, item, slotClickedFunc, width,
          'overflow-text header2-text');
        if (temp) {
          slotItem = temp;
        }
      }
      let tdStyle: React.CSSProperties = { height: item.rowHeight };
      if (item.groupOnly) {
        tdStyle = {
          ...tdStyle,
          backgroundColor: schedulerData.config.groupOnlySlotColor,
        };
      }
      return (
        <tr key={item.slotId}>
          <td data-resource-id={item.slotId} style={tdStyle}>
            {slotItem}
          </td>
        </tr>
      );
    });
    return (
      <div style={{ paddingBottom }}>
        <table className="resource-table">
          <tbody>{resourceList}</tbody>
        </table>
      </div>
    );
  }
}

export default ResourceView;
