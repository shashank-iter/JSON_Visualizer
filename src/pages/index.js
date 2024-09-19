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
    let nodeCounter = 0;
    let edgeCounter = 0;

    const levelSpacing = 200; // Vertical spacing between levels
    const nodeSpacing = 150; // Horizontal spacing between nodes within the same level

    const positionMap = new Map(); // Keep track of x-position for each level to space nodes horizontally

    while (queue.length > 0) {
      const { data, parent, level, dataKey } = queue.shift();
      const nodeId = `node-${nodeCounter++}`; // Unique node id

      // Initialize x-position for the current level if not already done
      if (!positionMap.has(level)) {
        positionMap.set(level, 0);
      }

      const xpos = positionMap.get(level); // Get the current x-position for the level
      const ypos = level * levelSpacing; // Calculate y-position based on level

      // Add current node
      nodes.push({
        id: nodeId,
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
          id: `edge-${edgeCounter++}-{parent}-${nodeId}`,
          source: parent,
          target: nodeId,
        });
      }

      const childNodeId = `node-${nodeCounter++}`; // Unique child node id

      // Add children to the queue based on the type of data
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          queue.push({
            data: item,
            parent: nodeId,
            level: level + 1,
            dataKey: `Index ${index}`,
          });
          edges.push({
            id: `edge-${edgeCounter++}-${nodeId}`,
            source: nodeId,
            target: childNodeId,
          });
        });
      } else if (typeof data === "object") {
        for (const key in data) {
          queue.push({
            data: data[key],
            parent: nodeId,
            level: level + 1,
            dataKey: key,
          });
          edges.push({
            id: `edge-${edgeCounter++}-${nodeId}`,
            source: nodeId,
            target: childNodeId,
          });
        }
      } else {
        // Handle leaf nodes for primitive values
        // redefine nodeId to prevent duplicate ids
        const nodeId = `node-${nodeCounter++}`;
        nodes.push({
          id: nodeId,
          position: { x: xpos + 150, y: ypos + (levelSpacing - 150) + 50 },
          data: {
            label: `${dataKey}: ${data}`,
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
          id: `edge-${edgeCounter++}-${parent}-${nodeId}`,
          source: parent,
          target: nodeId,
        });
      }
    }

    setNodes(nodes);
    setEdges(edges);
    return { nodes, edges };
  }

  return (
    <>
      <div className="p-5">
        <div className="my-5 F">
          <h1 className="text-2xl font-bold mb-5">JSON Visualizer 💖</h1>
          <h2>Aapka Apna, Sasta, Sundar aur Tikau - JSON स्पष्टीकरण यंत्र</h2>
          <code className="mt-2">
            Please paste your JSON in the left box to visualize it as a graph on
            the right.
          </code>
        </div>
        <div className="md:flex md:flex-row md:h-screen flex flex-col">
          <div className="md:w-1/2 h-96 md:px-10  mb-5 md:mb-0">
            {/* input section for json */}
            <textarea
              className="w-full md:h-screen bg-black text-green-600 rounded-md p-2 h-96 "
              value={json}
              placeholder="Paste your JSON here"
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
          <div className=" h-[80vw] w-[90vw] md:w-1/2 md:h-screen ">
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
