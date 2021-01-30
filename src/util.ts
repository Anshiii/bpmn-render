import { TEM } from "./App";
import BpmnModdle from "bpmn-moddle";

const moddle = new BpmnModdle();

export function uuid(type: string): string {
  return `${type}_${Math.random().toString(36).slice(-6)}`;
}

export function next(node: any) {
  if (!node) return;
  if (node.$type === "bpmn:EndEvent") return;
  return node.targetRef || node.outgoing[0];
}

/* 找到下一个 end（EndEvent 或者 unless 节点） 节点的节点 */
export function findEndLast(node: any): any {
  if (!node) return undefined;
  if (next(node).$type === "bpmn:EndEvent" || next(node).name === "unless") {
    return node;
  }
  // 如果遇到的是网关，且存在 endWay 指针，那么跳到网关分支汇聚的地方，继续查找
  if (node.$type === "bpmn:ExclusiveGateway") {
    return findEndLast(next(getEndWayFromGateway(node)));
  }
  // outgoing 默认都是一条出路;只有网关才会多出路
  return findEndLast(next(node));
}

// 从 parent的 flowElements 索引中删除或者添加元素
export function changeFlowElements(parent: any, action: any, ...nodes: any[]) {
  switch (action) {
    case "-":
      parent.flowElements = parent.flowElements.filter(
        (item: any) => !nodes.includes(item)
      );
      break;
    case "+":
      nodes.forEach((item) => {
        item.$parent = parent;
      });
      parent.flowElements.push(...nodes);
      break;
  }
}

// 生成新的 parent 节点
export function updateParent(oldParent: any): any {
  const { id, flowElements } = oldParent;
  const newParent = moddle.create("bpmn:Process", {
    id,
    flowElements,
    isExecutable: true,
  });
  newParent.$parent = oldParent.$parent;

  return newParent;
}

// 遍历寻找节点
export function findElementFromParent(parent: any, id: string) {
  return parent.flowElements.find((item: any) => item.id === id);
}

// 获取节点的 endWay
export function getEndWayFromGateway(node: any) {
  const endWayId = node?.$attrs["xmlns:props"];
  if (!endWayId) return;
  return findElementFromParent(node.$parent, endWayId);
}

// walk 节点
export function walk(
  start: any,
  endFc: (node: any) => boolean,
  cb: (node: any) => void
) {
  if (!start) return;
  if (endFc(start)) return;
  cb(start);
  walk(next(start), endFc, cb);
}

// 下载文件
export function download(content: any, filename?: string) {
  const eleLink = document.createElement("a");
  eleLink.download = filename || "test.bpmn";
  eleLink.style.display = "none";
  const blob = new Blob([content]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}
