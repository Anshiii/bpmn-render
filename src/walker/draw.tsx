import React, { memo } from "react";
import render from "../render";
import { getEndWayFromGateway, next } from "../util";

const drawBranch = ({ node, ...rest }: any) => {
  const { $type, id, name, outgoing, targetRef, sourceRef } = node;

  return (
    <div className="branch">
      {render.handler($type, node, rest)}

      <div style={{ display: "flex" }}>
        {outgoing?.map((item: any) => (
          <div className="wrap" key={item.id}>
            {draw({ node: item, ...rest })}
          </div>
        ))}
      </div>

      {/* {render.handler("bpmn:ManualTask", getEndWayFromGateway(node), rest)} */}
    </div>
  );
};

const drawNode = ({ node, ...rest }: any): any => {
  if (!node || !node.$type) return;
  const { $type, id, name, outgoing, targetRef, sourceRef } = node;

  return <div key={id}>{render.handler($type, node, rest)}</div>;
};

const draw = ({ node: start, ...rest }: any) => {
  const result = [];

  let current = start;

  while (current && current.$type) {
    const { $type, id, name, outgoing, targetRef, sourceRef } = current;
    if (name === "unless") {
      // unless 节点代表 branch 结束节点
      break;
    }

    if ($type === "bpmn:ExclusiveGateway") {
      result.push(drawBranch({ node: current, ...rest }));
      current = next(getEndWayFromGateway(current));
    }
    result.push(drawNode({ node: current, ...rest }));
    current = next(current);
  }

  console.log("end???", result);

  return result;
};

export default draw;
