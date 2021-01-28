import React, { memo } from "react";
import "./index.css";
import BpmnModdle from "bpmn-moddle";

const moddle = new BpmnModdle();

interface IProps {
  name: string;
  id: string;
  node?: any;
  setParent?: any;
}

const Task: React.FC<IProps> = memo(({ name, id, node, setParent }) => {
  // 特别类型支持添加条件

  const del = () => {
    /* 普通节点入口一般只会是一条线， unless 除外 */
    /* 普通节点出口一般只会是一条线， gateway 除外 */
    const next = node.outgoing[0]; // 应该是 seqFlow
    const last = node.incoming[0]; // 应该是 seqFlow

    // next 和 last 应该都是 seqFlow 类型
    last.targetRef = next.targetRef;
    next.targetRef.incoming = [last];
    setParent(
      moddle.create("bpmn:Process", {
        ...node.$parent,
      })
    );

    // 清空被删除节点的指针
    node.outgoing = null;
    node.incoming = null;
    next.targetRef = null;
    next.sourceRef = null;
  };

  return (
    <div id={id}>
      <div className="line"></div>
      <div className="node">
        <div className="content">
          <div onClick={del}>删除我</div>
          <div> {name}</div>
        </div>
      </div>
      <div className="line"></div>
    </div>
  );
});

export default Task;
