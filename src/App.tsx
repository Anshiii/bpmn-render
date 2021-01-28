// disable-eslint
// @ts-nocheck
import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import BpmnModdle from "bpmn-moddle";
import render from "./render";
import { Popover } from "antd";
import { uuid, download, getEndWayFromGateway } from "./util";
import draw from "./walker/draw";
// import bpmn from './duban.bpmp'
import "antd/dist/antd.css";
const moddle = new BpmnModdle();

// 出现内环时，需要记录绘制过的元素，不然会栈溢出

export const TEM: any = {};

// tree 结构
function App() {
  const [content, setContent] = useState<any>(null);
  const [parent, setParent] = useState<any>();
  const [definitions, setDefinitions] = useState<any>();
  const [end, setEnd] = useState<any>();

  useEffect(() => {
    if (!parent) return;
    const start = parent.flowElements.find(
      (item: any) => item.$type === "bpmn:StartEvent"
    );
    setContent(draw({ node: start, setParent, setEnd, end }));
  }, [parent, setContent, setParent, end]);

  const toXML = async () => {
    const moddle = new BpmnModdle();
    const xmlStr =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="empty-definitions" ' +
      'targetNamespace="http://bpmn.io/schema/bpmn">' +
      "</bpmn2:definitions>";

    const { rootElement: definitions } = await moddle.fromXML(xmlStr);
    // update id attribute
    definitions.set("id", uuid("Definitions"));

    definitions.get("rootElements").push(parent);

    // parent.$parent = definitions;
    // add a root element
    // definitions.rootElements = [parent];

    console.log("parent", parent, parent.isGeneric);

    // xmlStrUpdated contains new id and the added process
    const { xml: xmlStrUpdated } = await moddle.toXML(definitions);
    download(xmlStrUpdated);
  };

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
                  setDefinitions(res.rootElement);
                  console.log("response", res);
                  setParent(res.rootElement.rootElements[0]);
                });
            };
          }}
        />
        {content}
        {end?.$type ? render.handler(end.$type, end) : null}
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={toXML}>导出 XML ???</p>
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
