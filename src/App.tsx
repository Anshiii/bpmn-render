// disable-eslint
import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import BpmnModdle from "bpmn-moddle";
import render from "./render";
// import bpmn from './duban.bpmp'

const moddle = new BpmnModdle();

// var reader = new FileReader();
// reader.readAsText(bpmn);
// reader.onloadend = function () {
//   var xmlData = reader.result;
//   moddle
//     .fromXML(xmlData as string, (res) => {
//       console.log(res);
//     })
//     //@ts-ignore
//     .then((res) => {
//       console.log("233", res);
//       setLoad(res.rootElement.rootElements);
//     });
// };

const BFS = (root: any) => {
  const result = [];
  result.push();
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const { $type, id, name, outgoing, targetRef } = current;
    if (done[id]) return null;
    done[id] = true;

    // 线条不绘制？
    if ($type === "bpmn:SequenceFlow") {
      continue;
    }

    // 进入条件分支
    if ($type === "bpmn:ExclusiveGateway") {

    }

    const children = outgoing || targetRef;
    if (Array.isArray(children)) {
      const nodes = [];
      children.map((item) => {});
    }

    result.push(render.handler[$type]({ id, name }));
  }
};




const done: any = {};
const drawNode = (props: any): any => {
  console.log(props);
  const { $type, id, name, outgoing, targetRef } = props;
  // 重复元素排除
  if (done[id]) return null;
  done[id] = true;
  if ($type === "bpmn:SequenceFlow") {
    return drawNode(targetRef);
  }
  return (
    <div id="wrap" key={id}>
      {render.handler[$type]({ id, name })}
      <div style={{ display: "flex" }}>
        {outgoing?.map((item: any) => drawNode(item))}
      </div>
    </div>
  );
};

// tree 结构
function App() {
  const [load, setLoad] = useState(null);
  const [content, setContent] = useState<any>(null);

  const toRender = () => {
    if (!load) return null;
    // 默认单起点
    const root: any = (load as any)[0];
    const start = root.flowElements.find(
      (item: any) => item.$type === "bpmn:StartEvent"
    );
    console.log("start", start);

    setContent(drawNode(start));
  };
  console.log(content);

  return (
    <div className="App">
      <header className="App-header">
        <input
          type="file"
          accept=".bpmn"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target?.files) return;
            let file = e.target?.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = function () {
              var xmlData = reader.result;
              moddle
                .fromXML(xmlData as string, (res) => {
                  console.log(res);
                })
                //@ts-ignore
                .then((res) => {
                  console.log("233", res);
                  setLoad(res.rootElement.rootElements);
                });
            };
          }}
        />
        <button onClick={toRender}>读取文件，生成js对象</button>
        {content}
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
