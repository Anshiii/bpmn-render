import React, { memo } from "react";
import "./index.css";
interface IProps {
  name: string;
  id: string;
}

const StartEvent: React.FC<IProps> = memo(({ name, id }) => {
  const addNode = () => {};

  return (
    <div id={id}>
      <div className="line"></div>
      <div className="node">
        <div className="content">
          <div> {name}</div>
        </div>
      </div>
      <div className="line"></div>
      <div onClick={addNode}>+</div>
      <div className="line"></div>
    </div>
  );
});

export default StartEvent;
