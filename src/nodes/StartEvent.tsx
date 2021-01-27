import React, { memo } from "react";
import "./index.css";
import { Popover, Button } from "antd";
import BpmnModdle from "bpmn-moddle";
import update from "immutability-helper";
import { drawNode } from "../App";
import { uuid, findEndLast, next } from "../util";

const moddle = new BpmnModdle();

type NodeType = "append" | "cc" | "condition";
interface IProps {
  name: string;
  id: string;
  node?: any;
  setParent?: any;
}

const StartEvent: React.FC<IProps> = memo(({ name, id, node, setParent }) => {
  // 特别类型支持添加条件

  return (
    <div id={id}>
      <div className="node">
        <div className="content">
          <div> {name || "流程开始"}</div>
        </div>
      </div>
      <div className="line"></div>
    </div>
  );
});

export default StartEvent;
