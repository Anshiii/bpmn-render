import React, { memo } from "react";

interface IProps {
  node: any;
  end: any; // 结尾节点？
}

const ExclusiveGateway: React.FC<IProps> = memo(({ node }) => {
  const { id, name } = node;
  const addCondition = () => {
    // 当前分支节点到 end 节点
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
