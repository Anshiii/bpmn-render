import React, { memo } from "react";
import "./index.css";
import BpmnModdle from "bpmn-moddle";
import { pick } from "lodash";

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
    last.set("targetRef", next.targetRef);
    next.targetRef.set("incoming", [last]);

    node.$parent.set(
      "flowElements",
      node.$parent.flowElements.filter(
        (item: any) => item !== node && item !== next
      )
    );

    setParent(
      moddle.create("bpmn:Process", {
        ...pick(node.$parent, ["flowElements", "id"]),
      })
    );

    // 清空被删除节点的指针
    node.set("outgoing", undefined);
    node.set("incoming", undefined);

    next.set("targetRef", undefined);
    next.set("sourceRef", undefined);

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
