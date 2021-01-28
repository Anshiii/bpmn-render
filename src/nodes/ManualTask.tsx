import React, { memo } from "react";
import "./index.css";
import { Popover, Button, Divider } from "antd";
import BpmnModdle from "bpmn-moddle";
import { uuid, findEndLast, next } from "../util";

const moddle = new BpmnModdle();

type NodeType = "append" | "cc" | "condition";
interface IProps {
  name: string;
  id: string;
  node?: any;
  setParent?: any;
}

const ManualTask: React.FC<IProps> = memo(
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
          const SequenceFlow = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            sourceRef: userTask,
            targetRef: node.targetRef,
          });
          userTask.outgoing = [SequenceFlow];
          userTask.incoming = [node];

          node.targetRef.incoming = [SequenceFlow];
          node.targetRef = userTask;

          // @TIP 使用 update 不会继承原型上的属性
          // const newContent = update(node, {
          //   outgoing: {
          //     $splice: [[0, 1, userTask]],
          //   },
          // });
          // console.log("update后", newContent);

          // @TIP set 相同对象不会出发更新
          break;
        // 添加条件
        case "condition":
          // 在此处添加网关，
          /* 为便于查询，添加条件时，会绑定此次网关的分支结束点，方便之后在分支结束点添加节点 */
          const unlessNodeId = uuid("ManualTask");
          var end = moddle.create("bpmn:ManualTask", {
            id: unlessNodeId,
            name: "unless",
          });
          var gateway = moddle.create("bpmn:ExclusiveGateway", {
            id: uuid("ExclusiveGateway"),
            name: "添加条件",
            $attr: { endWay: unlessNodeId },
          });
          var condition1 = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            name: "设置条件",
            sourceRef: gateway,
            targetRef: node.targetRef,
            conditionExpression: moddle.create("bpmn:FormalExpression", {
              body: "${ foo < bar }",
            }),
          });
          var condition2 = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            name: "设置条件",
            sourceRef: gateway,
            targetRef: end,
            conditionExpression: moddle.create("bpmn:FormalExpression", {
              body: "${ foo < bar }",
            }),
          });
          // 起点转换
          gateway.incoming = [node];
          gateway.outgoing = [condition1, condition2];
          node.targetRef = gateway;

          condition1.targetRef.incoming = [condition1];

          // 终点转换
          const endLast = findEndLast(node); // endLast 应该是个 bpmn:SequenceFlow
          const endNext = endLast.targetRef;

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
          break;
        // 添加抄送人,本质和 审批人的逻辑一致
        case "cc": {
          const ccTask = moddle.create("bpmn:UserTask", {
            id: uuid("UserTask"),
            name: "抄送人",
          });
          const SequenceFlow = moddle.create("bpmn:SequenceFlow", {
            id: uuid("SequenceFlow"),
            sourceRef: ccTask,
            targetRef: node.targetRef,
          });
          ccTask.outgoing = [SequenceFlow];
          ccTask.incoming = [node];

          node.targetRef.incoming = [SequenceFlow];
          node.targetRef = ccTask;
        }
      }

      // 触发渲染更新

      setParent(
        // node.$parent
        moddle.create("bpmn:Process", {
          ...node.$parent,
        })
      );
    };

    // 特别类型支持添加条件
    return (
      <div id={id}>
        <div className="line"></div>
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

export default ManualTask;
