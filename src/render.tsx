import StartEvent from "./nodes/StartEvent";
import ExclusiveGateway from "./nodes/ExclusiveGateway";
import EndEvent from "./nodes/EndEvent";
import SequenceFlow from "./nodes/SequenceFlow";
import Task from "./nodes/Task";

// 普通的 bpmn:SequenceFlow 不绘制？只绘制条件语句的 flow？
let render: any = {
  handler(type: string, node: any, option?: any) {
    const { name, id } = node;
    const { setContent } = option || {};
    console.log(type);

    switch (type) {
      case "bpmn:ExclusiveGateway":
        return <ExclusiveGateway node={node} {...option}></ExclusiveGateway>;
      case "bpmn:SequenceFlow":
        return (
          <SequenceFlow
            name={name || "请设置条件"}
            id={id}
            node={node}
            {...option}
          ></SequenceFlow>
        );
      case "bpmn:EndEvent":
        return <EndEvent name="流程结束" node={node} {...option}></EndEvent>;
      case "bpmn:ManualTask":
        return <div>unless</div>;
      case "bpmn:StartEvent":
        return (
          <StartEvent name={name} id={id} node={node} {...option}></StartEvent>
        );
      default:
        return <Task name={name} id={id} node={node} {...option}></Task>;
    }
  },
};

export default render;
