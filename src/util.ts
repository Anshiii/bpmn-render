import { TEM } from "./App";
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

// 获取节点的 endWay
export function getEndWayFromGateway(node: any) {
  console.log(node?.$attrs?.endWay);
  return TEM.elementsById[node?.$attrs?.endWay];
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
