import StartEvent from "./nodes/StartEvent";

let render: any = {
  handler: {
    "bpmn:StartEvent": function (ele: any) {
      return <StartEvent name={ele.name} id={ele.id}></StartEvent>;
    },
    "bpmn:UserTask": function (ele: any) {
      return <StartEvent name={ele.name} id={ele.id}></StartEvent>;
    },
    "bpmn:ExclusiveGateway": function (ele: any) {
      return <StartEvent name={ele.name} id={ele.id}></StartEvent>;
    },
    "bpmn:ServiceTask": function (ele: any) {
      return <StartEvent name={ele.name} id={ele.id}></StartEvent>;
    },
    "bpmn:EndEvent": function (ele: any) {
      return <StartEvent name={ele.name} id={ele.id}></StartEvent>;
    },
    "bpmn:Task": function (ele: any) {
      return <StartEvent name={ele.name} id={ele.id}></StartEvent>;
    },
  },
};

export default render;
