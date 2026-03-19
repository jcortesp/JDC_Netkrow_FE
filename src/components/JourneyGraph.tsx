import { useCallback, useMemo, useState } from 'react';
import dagre from 'dagre';
import ReactFlow, { Background, Controls, MiniMap, useEdgesState, useNodesState } from 'react-flow-renderer';
import {
  Badge,
  Box,
  Drawer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';

type StepNode = Record<string, unknown> & { type?: string; label?: string; flowName?: string; TRANSACTION_KEY?: string; serverKey?: string };

const nodeTypeColor: Record<string, string> = {
  transaction: '#FF9800',
  flow: '#1976D2',
  service: '#43A047',
  server: '#FBC02D',
};

const nodeBgColor: Record<string, string> = {
  transaction: '#FFF3E0',
  flow: '#E3F2FD',
  service: '#E8F5E9',
  server: '#FFFDE7',
};

function nodeLabel(node: StepNode) {
  if (!node) return '';
  if (node.type === 'transaction') return `TX: ${node.label || node.TRANSACTION_KEY || ''}`;
  if (node.type === 'server') return `SERVER: ${node.serverKey || node.label || ''}`;
  if (node.type === 'flow') return String(node.flowName || node.label || '');
  return String(node.label || '');
}

function layoutNodesAndEdges(routes: StepNode[][]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 });

  const nodeMap = new Map<string, Record<string, unknown>>();
  const edges: Record<string, unknown>[] = [];

  routes.forEach((route) => {
    let prevId: string | null = null;
    route.forEach((step) => {
      const base = String(step.label || step.flowName || step.TRANSACTION_KEY || '').trim();
      let id = `${step.type}_${base}`;
      if (step.type === 'transaction') id = `tx_${String(step.TRANSACTION_KEY || step.label || '').trim()}`;
      if (step.type === 'flow') id = `flow_${String(step.flowName || step.label || '').trim()}`;
      if (step.type === 'service') id = `svc_${String(step.label || '').trim()}`;
      if (step.type === 'server') id = `srv_${String(step.label || '').trim()}`;

      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          type: 'default',
          data: { label: nodeLabel(step), ...step },
          style: {
            border: `2.5px solid ${nodeTypeColor[String(step.type)] ?? '#1976D2'}`,
            borderRadius: 12,
            background: nodeBgColor[String(step.type)] ?? '#E3F2FD',
            color: '#072246',
            fontWeight: 600,
            boxShadow: '0 1px 8px rgba(12,50,80,0.11)',
          },
        });
        g.setNode(id, { width: 185, height: 54 });
      }

      if (prevId) {
        edges.push({
          id: `e_${prevId}_${id}`,
          source: prevId,
          target: id,
          animated: true,
          style: { stroke: nodeTypeColor[String(step.type)] ?? '#1976D2', strokeWidth: 2 },
        });
        g.setEdge(prevId, id);
      }

      prevId = id;
    });
  });

  dagre.layout(g);
  nodeMap.forEach((node, id) => {
    const dagreNode = g.node(id);
    (node as { position: { x: number; y: number } }).position = {
      x: dagreNode.x - 90,
      y: dagreNode.y - 25,
    };
  });

  return { nodes: Array.from(nodeMap.values()), edges };
}

export default function JourneyGraph({ routes }: { routes: StepNode[][] }) {
  const { nodes, edges } = useMemo(() => layoutNodesAndEdges(routes || []), [routes]);
  const [nodesState, , onNodesChange] = useNodesState(nodes as never[]);
  const [edgesState, , onEdgesChange] = useEdgesState(edges as never[]);
  const [open, setOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<StepNode | null>(null);

  const onNodeClick = useCallback((_: unknown, node: { data: StepNode }) => {
    setSelectedNode(node.data);
    setOpen(true);
  }, []);

  return (
    <Box sx={{ width: '100%', height: 500, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.45}
        maxZoom={2}
      >
        <MiniMap nodeColor={(n) => nodeTypeColor[String((n.data as StepNode)?.type)] ?? '#1976D2'} />
        <Controls />
        <Background variant="dots" gap={22} size={2} color="rgba(33, 150, 243, 0.18)" />
      </ReactFlow>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 420, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Detalles del nodo {selectedNode?.type && <Badge color="primary" badgeContent={selectedNode.type} />}
          </Typography>
          {selectedNode ? (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>{nodeLabel(selectedNode)}</Typography>
              <Table size="small">
                <TableBody>
                  {Object.entries(selectedNode)
                    .filter(([k]) => k !== 'label' && k !== 'type')
                    .map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ fontWeight: 700 }}>{k}</TableCell>
                        <TableCell>{String(v ?? '-')}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Typography>Selecciona un nodo para ver detalles</Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
