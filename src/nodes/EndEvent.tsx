import React, { memo } from "react";

interface IProps {
  node: any;
  end: any; // 结尾节点？
}

const EndEvent: React.FC<IProps> = memo(({ node }) => {
  const { id, name } = node;

  return (
    <div id={id}>
      <div className="line"></div>
      <div className="node gateway">流程结束</div>
    </div>
  );
});

export default EndEvent;
