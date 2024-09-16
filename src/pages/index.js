import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  NodeResizer,
  NodeToolbar,
  Background,
  useNodesState,
  Handle,
  Position,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [i, setI] = useState(100);
  const [json, setJson] = useState();

  function isValidJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function createNodesAndEdgesFromJson(json) {
    const nodes = [];
    const edges = [];
    const queue = [{ data: json, parent: null, level: 0, dataKey: null }];
    let id = 0;

    const levelSpacing = 200; // Vertical spacing between levels
    const nodeSpacing = 150; // Horizontal spacing between nodes within the same level

    const positionMap = new Map(); // Keep track of x-position for each level to space nodes horizontally

    while (queue.length > 0) {
      const { data, parent, level, dataKey } = queue.shift();
      const nodeId = id++;

      // Initialize x-position for the current level if not already done
      if (!positionMap.has(level)) {
        positionMap.set(level, 0);
      }

      const xpos = positionMap.get(level); // Get the current x-position for the level
      const ypos = level * levelSpacing; // Calculate y-position based on level

      // Add current node
      nodes.push({
        id: nodeId.toString(),
        position: { x: xpos, y: ypos },
        data: {
          label: parent === null ? "JSON Object" : dataKey,
        },
        style: {
          margin: "0px",
          borderRadius: "10px",
          padding: "10px",
          backgroundColor: "beige",
          overflowWrap: "break-word",
          fontWeight: "bold",
        },
      });

      // Update the x-position for the next node in the same level
      positionMap.set(level, xpos + nodeSpacing + 100);

      // If there's a parent node, add an edge
      if (parent !== null) {
        edges.push({
          id: `${parent}-${nodeId}`,
          source: parent.toString(),
          target: nodeId.toString(),
        });
      }
      let hasPrimitives = false;
      let primitiveLabel = "";
      let goIntoSetNodeFlag = false;
      // Add children to the queue if they are objects, or create leaf nodes for primitive values
      for (const key in data) {
        const childNodeId = id++;
        if (typeof data[key] === "object") {
          queue.push({
            data: data[key],
            parent: nodeId,
            level: level + 1,
            dataKey: key,
          });
        } else {
          if (!hasPrimitives) {
            for (const key in data) {
              if (typeof data[key] !== "object") {
                primitiveLabel += `${key}: ${data[key]}` + ", ";
                hasPrimitives = true;
              }
              goIntoSetNodeFlag = true;
            }
          }
          if (goIntoSetNodeFlag) {
            nodes.push({
              id: childNodeId.toString(),
              position: { x: xpos + 500, y: ypos + (levelSpacing - 150) + 50 },
              data: {
                label: primitiveLabel,
              },
              style: {
                marginBottom: "100px",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "lightblue",
                overflowWrap: "break-word",
              },
            });
            edges.push({
              id: `${nodeId}-${childNodeId}`,
              source: nodeId.toString(),
              target: childNodeId.toString(),
            });
            goIntoSetNodeFlag = false;
          }
        }
      }
    }

    setNodes(nodes);
    setEdges(edges);
    return { nodes, edges };
  }

  return (
    <>
      <div className="p-10">
        <div className="my-5 px-10">
          <h1 className="text-2xl font-bold mb-5">JSON Visualizer 💖</h1>
          <h2>Aapka Apna, Sasta, Sundar aur Tikau - JSON स्पष्टीकरण यंत्र</h2>
          <code className="mt-2">
            Please paste your JSON in the left box to visualize it as a graph on
            the right.
          </code>
        </div>
        <div className="md:flex md:flex-row md:h-screen flex flex-col">
          <div className="md:w-1/2 h-screen md:px-10 px-5 ">
            {/* input section for json */}
            <textarea
              className="w-full md:h-screen bg-black text-green-600 rounded-md p-2"
              value={json}
              onChange={(e) => {
                setJson(e.target.value);
                try {
                  if (isValidJsonString(e.target.value)) {
                    const json = JSON.parse(e.target.value);
                    createNodesAndEdgesFromJson(json);
                  } else {
                    setNodes([]);
                    setEdges([]);
                  }
                } catch (e) {
                  console.log(json);
                  console.log("corrrect");
                  console.log(nodes);
                  console.log(e);
                  setNodes([]);
                  setEdges([]);
                }
              }}
            ></textarea>
          </div>
          <div className="md:w-1/2 md:h-screen w-full">
            {/* <button
          onClick={() => {
            createNodesAndEdgesFromJson(json);
          }}
        >
          Log Nodes
        </button> */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              // onConnect={onConnect}
            >
              <Handle type="target" position={Position.Left} />
              <Handle type="source" position={Position.Right} />

              <Controls />
              <MiniMap />
              <NodeToolbar />
              <NodeResizer />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>
      </div>
      <footer className="text-center text-white text-sm mt-5 py-5 bg-black">
        Made with ❤️ by{" "}
        <a
          className="text-blue-500"
          href="https://github.com/shashank_iter"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shashank Pandey
        </a>
      </footer>
    </>
  );
}
