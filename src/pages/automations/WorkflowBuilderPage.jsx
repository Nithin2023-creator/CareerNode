import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReactFlow, Controls, Background, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../styles/reactflow-theme.css';

import { ArrowLeft, Save, Play } from 'lucide-react';
import ToolNode from '../../components/automations/ToolNode';
import NodePalette from '../../components/automations/NodePalette';
import NodeConfigDrawer from '../../components/automations/NodeConfigDrawer';
import { getWorkflow, saveWorkflow } from './workflowsStorage';

const nodeTypes = { toolNode: ToolNode };
const defaultViewport = { x: 0, y: 0, zoom: 1 };

export default function WorkflowBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = getWorkflow(id);
      if (existing) {
        setWorkflowName(existing.name || 'Untitled Workflow');
        setNodes(existing.nodes || []);
        setEdges(existing.edges || []);
      }
    }
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--color-accent-blue)', strokeWidth: 2 } }, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeDefString = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeDefString) return;
      
      const nodeDef = JSON.parse(nodeDefString);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'toolNode',
        position,
        data: { ...nodeDef },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleAddNodeTap = useCallback((nodeDef) => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowBounds.width / 2,
      y: reactFlowBounds.height / 2,
    });

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'toolNode',
      position,
      data: { ...nodeDef },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleUpdateNode = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
    );
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const handleSave = () => {
    const workflowId = id === 'new' ? `wf_${Date.now()}` : id;
    saveWorkflow({
      id: workflowId,
      name: workflowName,
      nodes,
      edges
    });
    if (id === 'new') {
      navigate(`/dashboard/automations/${workflowId}`, { replace: true });
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="-m-6 md:-m-10 lg:-m-12 h-[calc(100vh-8rem)] flex flex-col bg-[var(--color-background)] overflow-hidden">
      {/* Top Bar */}
      <div className="min-h-16 py-3 bg-white border-b border-black/10 flex flex-wrap items-center justify-between px-4 md:px-6 z-20 flex-shrink-0 shadow-sm gap-4">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-[200px]">
          <Link to="/dashboard/automations" className="h-10 w-10 rounded-full border border-black/10 hover:bg-black hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="font-display text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 w-full sm:w-64 md:w-96 text-black min-w-0"
            placeholder="Workflow Name"
          />
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="relative group">
            <button 
              disabled
              className="pill-btn-secondary opacity-50 cursor-not-allowed flex items-center gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-5"
            >
              <Play className="h-3 w-3 md:h-4 md:w-4" /> RUN
            </button>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
              Coming Soon
            </span>
          </div>
          <button 
            onClick={handleSave}
            className="pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-5"
          >
            <Save className="h-3 w-3 md:h-4 md:w-4" /> SAVE
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette onAddNode={handleAddNodeTap} />
        
        <div className="flex-1 relative h-full w-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultViewport={defaultViewport}
            fitView
            className="bg-[var(--color-background)]"
          >
            <Background color="#000" gap={20} size={1.5} variant="dots" className="opacity-[0.05]" />
            <Controls showInteractive={false} className="!m-6 shadow-xl" />
          </ReactFlow>
        </div>

        <NodeConfigDrawer 
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
        />
      </div>
    </div>
  );
}
