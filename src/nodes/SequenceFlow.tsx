import React, { memo } from "react";
import "./index.css";
import { Popover, Button, Divider } from "antd";

import {
  uuid,
  findEndLast,
  next,
  changeFlowElements,
  updateParent,
  getEndWayFromGateway,
  walk,
} from "../util";
import BpmnModdle from "bpmn-moddle";

const moddle = new BpmnModdle();

const addUserTaskToNode = (userTask: any, node: any) => {
  const SequenceFlow = moddle.create("bpmn:SequenceFlow", {
    id: uuid("SequenceFlow"),
    sourceRef: userTask,
    targetRef: node.targetRef,
  });
  userTask.outgoing = [SequenceFlow];
  userTask.incoming = [node];

  node.targetRef.incoming = [SequenceFlow];
  node.targetRef = userTask;

  changeFlowElements(node.$parent, "+", userTask, SequenceFlow);
  // node.$parent.flowElements.push(userTask, SequenceFlow);
};

interface IProps {
  name: string;
  id: string;
  node?: any;
  setParent?: any;
}

const SequenceFlow: React.FC<IProps> = memo(
  ({ name, id, node, setParent, ...rest }) => {
    const { conditionExpression } = node;
    const addNode = (e: any) => {
      // 需要 endNode 的索引
      // 支持添加 审批人|抄送人|条件分支
      const type = e.target.dataset.type;
      console.log(type);

      switch (type) {
        // 添加审批人
        case "append":
          var userTask = moddle.create("bpmn:UserTask", {
            id: uuid("UserTask"),
            name: "审批人",
          });
          addUserTaskToNode(userTask, node);
          // @TIP set 相同对象不会触发更新
          break;

        // 添加抄送人,本质和 审批人的逻辑一致
        case "cc":
          {
            const ccTask = moddle.create("bpmn:UserTask", {
              id: uuid("UserTask"),
              name: "抄送人",
            });
            addUserTaskToNode(ccTask, node);
          }
          break;
        // 添加条件

        case "condition":
          // 在此处添加网关，
          /* 为便于查询，添加条件时，会绑定此次网关的分支结束点，方便之后在分支结束点添加节点 */
          const unlessNodeId = uuid("ManualTask");
          const end = moddle.create("bpmn:ManualTask", {
            id: unlessNodeId,
            name: "unless",
          });
          const gateway = moddle.create("bpmn:ExclusiveGateway", {
            id: uuid("ExclusiveGateway"),
            name: "添加条件",
            "xmlns:props": unlessNodeId, // 用于连接 end id 的指针
          });
          //@ts-ignore  @TODO 这样设置属性对吗？
          const condition1 = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            name: "设置条件",
            sourceRef: gateway,
            targetRef: node.targetRef,
            conditionExpression: moddle.create("bpmn:FormalExpression", {
              body: "${ foo < bar }",
            }),
          });
          const condition2 = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            name: "设置条件",
            sourceRef: gateway,
            targetRef: end,
            conditionExpression: moddle.create("bpmn:FormalExpression", {
              body: "${ foo < bar }",
            }),
          });

          // 记录终点节点
          const endLast = findEndLast(node); // endLast 应该是个 bpmn:SequenceFlow
          const endNext = endLast.targetRef;

          // 起点转换
          gateway.incoming = [node];
          gateway.outgoing = [condition1, condition2];
          node.targetRef = gateway;

          condition1.targetRef.incoming = [condition1];

          // 终点转换
          // FLOW END 和 下一个结点的连接线
          const flow = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            sourceRef: end,
            targetRef: endNext,
          });

          end.incoming = [endLast, condition2];
          end.outgoing = [flow];

          const idx = endNext.incoming.findIndex(
            (item: any) => item === endLast
          );
          endNext.incoming.splice(idx, 1, flow);
          endLast.targetRef = end;

          // 添加新节点到 flow 列表
          changeFlowElements(
            node.$parent,
            "+",
            end,
            gateway,
            condition1,
            condition2,
            flow
          );
          break;
      }

      // 触发渲染更新
      setParent(updateParent(node.$parent));
    };

    // 删除条件
    const delCondition = () => {
      const gateWay = node.sourceRef;
      const endWay = getEndWayFromGateway(gateWay);
      const parent = node.$parent;

      const conditionIdx = gateWay.outgoing.findIndex(
        (item: any) => item === node
      );

      // 被删除的分支所有节点
      const delNodes: any[] = [];
      walk(
        node,
        (node: any) => node === endWay, // 不会包括符合 endFc 的node
        (node: any) => {
          delNodes.push(node);
        }
      );

      if (gateWay.outgoing.length > 2) {
        console.log("del confition");

        // 只删除某条 condition 分支

        gateWay.outgoing.splice(conditionIdx, 1);
        endWay.incoming.splice(conditionIdx, 1);

        changeFlowElements(node.$parent, "-", ...delNodes);
        // @TODO 清除被删除节点的指针关系？
      } else {
        console.log("del gateway");
        // 删除包括 gateway/unless 在内的整个条件分支...
        const gateWayLastSeq = gateWay.incoming[0]; //
        const endWayNextSeq = endWay.outgoing[0];

        // 此时 outgoing/incoming 应该只有两个分支
        const restConditionStart = gateWay.outgoing.find(
          (i: any, idx: any) => idx !== conditionIdx
        );
        const restConditionEnd = endWay.incoming.find(
          (i: any, idx: any) => idx !== conditionIdx
        ).sourceRef; // 取节点，不取seq

        // 删除条件后，多余的 seq 也需要删除
        const endWayNextNode = endWayNextSeq.targetRef;
        const endWayNextSeqIdx = endWayNextNode.incoming.findIndex(
          (item: any) => item === endWayNextSeq
        );
        // 如果节点是gateWay，表示剩余分支只有条件。
        if (restConditionEnd === gateWay) {
          endWayNextNode.incoming.splice(endWayNextSeqIdx, 1, gateWayLastSeq);
          gateWayLastSeq.targetRef = endWayNextNode;
        } else {
          gateWayLastSeq.targetRef = restConditionEnd;
          restConditionEnd.incoming = [gateWayLastSeq];
          const endWayLastSeq = restConditionEnd.outgoing[0];

          endWayNextNode.incoming.splice(endWayNextSeqIdx, 1, endWayLastSeq);
          endWayLastSeq.targetRef = endWayNextNode;
        }

        changeFlowElements(
          node.$parent,
          "-",
          ...delNodes,
          gateWay,
          endWay,
          endWayNextSeq,
          restConditionStart
        );
      }

      setParent(updateParent(parent));
    };

    return (
      <div id={id}>
        <div className="line"></div>
        {/* 条件语句的 flow 需要渲染条件内容 */}
        {conditionExpression
          ? [
              <div key="del" onClick={delCondition}>
                删除条件
              </div>,
              <div key="condition">{conditionExpression.body}</div>,
              <div key="line" className="line"></div>,
            ]
          : null}
        <Popover
          content={
            <div onClick={addNode}>
              <div data-type="append">审批人</div>
              <div data-type="cc">抄送人</div>
              <div data-type="condition">条件分支</div>
            </div>
          }
          title="null"
          trigger="click"
        >
          <div>+</div>
        </Popover>
        <div className="line"></div>
      </div>
    );
  }
);

export default SequenceFlow;
