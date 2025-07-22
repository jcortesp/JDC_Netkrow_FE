// src/components/JourneyGraph.jsx
import React, { useMemo, useCallback, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";
import dagre from "dagre";
import { Box, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, Table, Tbody, Tr, Td, Heading, useDisclosure, Badge } from "@chakra-ui/react";

// Color mappings
const nodeTypeColor = {
  transaction: "#FF9800", // Naranja
  flow: "#1976D2",        // Azul fuerte
  service: "#43A047",     // Verde
  server: "#FBC02D"       // Amarillo fuerte
};
const nodeBgColor = {
  transaction: "#FFF3E0", // Naranja muy suave
  flow: "#E3F2FD",        // Azul claro
  service: "#E8F5E9",     // Verde claro
  server: "#FFFDE7"        // Amarillo muy suave
};

// Etiqueta del nodo
function nodeLabel(node) {
  if (!node) return "";
  if (node.type === "transaction") return `TX: ${node.label || node.TRANSACTION_KEY}`;
  if (node.type === "server") return `SERVER: ${node.serverKey || node.label}`;
  if (node.type === "flow") return node.flowName || node.label;
  if (node.type === "service") return node.label || "";
  return node.label || "";
}

// Layout vertical con dagre (flujo de arriba-abajo)
function layoutNodesAndEdges(routes) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80 }); // Top-Bottom layout

  // Unificar nodos por id único
  const nodeMap = new Map();
  const edges = [];
  routes.forEach(route => {
    let prevId = null;
    route.forEach(step => {
      let id = '';
      if (step.type === "transaction") id = `tx_${(step.TRANSACTION_KEY || step.label).trim()}`;
      else if (step.type === "flow") id = `flow_${(step.flowName || step.label).trim()}`;
      else if (step.type === "service") id = `svc_${(step.label || '').trim()}`;
      else if (step.type === "server") id = `srv_${(step.label || '').trim()}`;
      else id = `${step.type}_${(step.label || '').trim()}`;

      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          type: "default",
          data: { label: nodeLabel(step), ...step },
          style: {
            border: `2.5px solid ${nodeTypeColor[step.type] ?? "#1976D2"}`,
            borderRadius: 12,
            background: nodeBgColor[step.type] ?? "#E3F2FD",
            color: "#072246",
            fontWeight: 600,
            boxShadow: "0 1px 8px rgba(12,50,80,0.11)"
          }
        });
        // dagre needs width/height
        g.setNode(id, { width: 185, height: 54 });
      }
      if (prevId) {
        edges.push({
          id: `e_${prevId}_${id}`,
          source: prevId,
          target: id,
          animated: true,
          style: { stroke: nodeTypeColor[step.type] ?? "#1976D2", strokeWidth: 2 }
        });
        g.setEdge(prevId, id);
      }
      prevId = id;
    });
  });

  // dagre layout
  dagre.layout(g);
  // Aplicar posiciones a los nodos
  nodeMap.forEach((node, id) => {
    const dagreNode = g.node(id);
    node.position = {
      x: dagreNode.x - 90,
      y: dagreNode.y - 25
    };
  });

  return { nodes: Array.from(nodeMap.values()), edges, nodeMap };
}

export default function JourneyGraph({ routes }) {
  const { nodes, edges, nodeMap } = useMemo(() => layoutNodesAndEdges(routes), [routes]);
  const [nodesState, , onNodesChange] = useNodesState(nodes);
  const [edgesState, , onEdgesChange] = useEdgesState(edges);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNode, setSelectedNode] = useState(null);

  // Node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
    onOpen();
  }, [onOpen]);

  return (
    <Box width="100%" height="500px" borderWidth={1} borderRadius="lg"
      bg="rgba(33, 150, 243, 0.08)" // Azul tenue translúcido
      position="relative"
      boxShadow="lg"
    >
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.45}
        maxZoom={2}
        panOnDrag
        zoomOnPinch
      >
        <MiniMap
          nodeColor={n => nodeTypeColor[(n.data && n.data.type) || "flow"] ?? "#1976D2"}
        />
        <Controls />
        <Background variant="dots" gap={22} size={2} color="rgba(33, 150, 243, 0.18)" />
      </ReactFlow>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            Detalles del nodo
            {selectedNode && selectedNode.type && (
              <Badge ml={2} colorScheme="blue">{selectedNode.type}</Badge>
            )}
          </DrawerHeader>
          <DrawerBody>
            {selectedNode ? (
              <Box>
                <Heading size="sm" mb={2}>{nodeLabel(selectedNode)}</Heading>
                <Table size="sm">
                  <Tbody>
                    {Object.entries(selectedNode)
                      .filter(([k]) => k !== "label" && k !== "type")
                      .map(([k, v]) => (
                        <Tr key={k}>
                          <Td fontWeight="bold" fontSize="xs">{k}</Td>
                          <Td fontSize="xs">{String(v ?? "-")}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </Box>
            ) : <Box>Selecciona un nodo para ver detalles</Box>}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
