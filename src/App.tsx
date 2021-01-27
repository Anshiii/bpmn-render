// disable-eslint
import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import BpmnModdle from "bpmn-moddle";
import render from "./render";
import { Popover } from "antd";
// import bpmn from './duban.bpmp'
import "antd/dist/antd.css";
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

// 出现内环时，需要记录绘制过的元素，不然会栈溢出
const done: any = {};
let END: any = {};

export const TEM: any = {};

export const drawNode = ({ node, ...rest }: any): any => {
  console.log(node);
  if (!node || !node.$type) return;
  const { $type, id, name, outgoing, targetRef, sourceRef } = node;
  const { setEnd } = rest;

  // 不绘制的元素，仅用于存储指针的点
  if (name === "unless") {
    return drawNode({ node: outgoing[0]?.targetRef, ...rest });
  }
  // 重复元素排除
  // if (done[id]) return null;
  // done[id] = true;
  // if ($type === "bpmn:SequenceFlow") {
  //   // 如果是网关后面的 SequenceFlow 需要绘制出来
  //   if (sourceRef.$type === "bpmn:ExclusiveGateway") {
  //     return [
  //       render.handler($type, node, rest),
  //       drawNode({ node: targetRef, ...rest }),
  //     ];
  //   }
  //   return drawNode({ node: targetRef, ...rest });
  // }
  // end 节点特殊对待,要渲染在最后
  if ($type === "bpmn:EndEvent") {
    console.log($type, node);

    setEnd(node);
    return;
  }
  return [
    render.handler($type, node, rest),
    (() => {
      if ($type === "bpmn:ExclusiveGateway") {
        return (
          <div className="branch">
            <div style={{ display: "flex" }}>
              {outgoing?.map((item: any) => (
                <div className="wrap">{drawNode({ node: item, ...rest })}</div>
              ))}
            </div>

            <div className="line"></div>
            <Popover
              content={
                <div onClick={undefined}>
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
      } else {
        return (outgoing || [targetRef])?.map((item: any) =>
          drawNode({ node: item, ...rest })
        );
      }
    })(),
  ];
};

// tree 结构
function App() {
  const [content, setContent] = useState<any>(null);
  const [parent, setParent] = useState<any>();
  const [end, setEnd] = useState<any>();

  useEffect(() => {
    if (!parent) return;
    const start = parent.flowElements.find(
      (item: any) => item.$type === "bpmn:StartEvent"
    );
    setContent(drawNode({ node: start, setParent, setEnd, end }));
  }, [parent, setContent, setParent, end]);

  console.log("END", end);

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
                // @ts-ignore
                .fromXML(xmlData as string)
                //@ts-ignore
                .then((res) => {
                  TEM.elementsById = res.elementsById;
                  console.log("response", res);
                  setParent(res.rootElement.rootElements[0]);
                });
            };
          }}
        />
        {content}
        {end?.$type ? render.handler(end.$type, end) : null}
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
