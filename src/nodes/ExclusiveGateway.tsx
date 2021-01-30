import React, { memo } from "react";
import BpmnModdle from "bpmn-moddle";
import {
  uuid,
  findEndLast,
  next,
  changeFlowElements,
  getEndWayFromGateway,
  updateParent,
} from "../util";

const moddle = new BpmnModdle();
interface IProps {
  node: any;
  setParent: any;
}

const ExclusiveGateway: React.FC<IProps> = memo(({ node, setParent }) => {
  const { id, name } = node;
  const addCondition = () => {
    console.log("addCondition");

    // 当前分支节点到 end 节点
    const end = getEndWayFromGateway(node);
    const condition = moddle.create("bpmn:SequenceFlow", {
      id: uuid("SequenceFlow"),
      name: "设置条件",
      sourceRef: node,
      targetRef: end,
      conditionExpression: moddle.create("bpmn:FormalExpression", {
        body: "${ b < a }",
      }),
    });
    // 新增条件插入倒二
    node.outgoing.splice(-1, 0, condition);
    end.incoming.splice(-1, 0, condition);
    changeFlowElements(node.$parent, "+", condition);
    setParent(updateParent(node.$parent));
  };

  return (
    <div id={id}>
      <div className="line"></div>
      <div className="node gateway">
        <div className="content" onClick={addCondition}>
          <div> 添加条件</div>
        </div>
      </div>
      <div className="line"></div>

      <div className="line"></div>
    </div>
  );
});

export default ExclusiveGateway;
