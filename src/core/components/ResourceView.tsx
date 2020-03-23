import React, {Component} from "react";
import Icon from "antd/lib/icon";
import TechnicianCard from "../../technicianCard";

interface ResourceViewProps {
  schedulerData: any;
  contentScrollbarHeight: number;
  slotClickedFunc?: (...args: any[]) => any;
  slotItemTemplateResolver?: (...args: any[]) => any;
  toggleExpandFunc?: (...args: any[]) => any;
}

class ResourceView extends Component<ResourceViewProps, {}> {
  constructor(props: ResourceViewProps) {
    super(props);
  }

  render() {
    const {schedulerData, contentScrollbarHeight, slotClickedFunc, slotItemTemplateResolver, toggleExpandFunc} = this.props;
    const {renderData} = schedulerData;
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
          <Icon
            type="minus-square"
            key={`es${item.indent}`}
            style={{}}
            className=""
            onClick={() => {
              if (toggleExpandFunc) toggleExpandFunc(schedulerData, item.slotId);
            }}
          />
        ) : (
          <Icon
            type="plus-square"
            key={`es${item.indent}`}
            style={{}}
            className=""
            onClick={() => {
              if (toggleExpandFunc) toggleExpandFunc(schedulerData, item.slotId);
            }}
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
                        <TechnicianCard name={item.slotName}/>
                    </span>
                </span>
      );
      let slotItem = (
        <div title={item.slotName} className="overflow-text header2-text" style={{textAlign: "left"}}>
          {a}
        </div>
      );
      if (slotItemTemplateResolver) {
        const temp = slotItemTemplateResolver(schedulerData, item, slotClickedFunc, width, "overflow-text header2-text");
        if (temp) slotItem = temp;
      }
      let tdStyle: React.CSSProperties = {height: item.rowHeight};
      if (item.groupOnly) {
        tdStyle = {
          ...tdStyle,
          backgroundColor: schedulerData.config.groupOnlySlotColor
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
      <div style={{paddingBottom: paddingBottom}}>
        <table className="resource-table">
          <tbody>{resourceList}</tbody>
        </table>
      </div>
    );
  }
}

export default ResourceView;
