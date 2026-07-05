import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Workflow, GitMerge } from 'lucide-react';
import { motion } from 'framer-motion';
import { listWorkflows, deleteWorkflow } from './workflowsStorage';

export default function WorkflowsListPage() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    setWorkflows(listWorkflows());
  }, []);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id);
      setWorkflows(listWorkflows());
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="pill-badge bg-black/5 text-black mb-4">AUTOMATIONS</div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
            Workflows.
          </h1>
          <p className="mt-4 text-black/50 font-medium max-w-lg">
            Build and manage visual automations across Job Finder, Cold Mailer, and Wallet.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/dashboard/automations/new" className="pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)] transition-colors flex items-center gap-2 shadow-[var(--shadow-soft)]">
            <Plus className="h-4 w-4" /> NEW WORKFLOW
          </Link>
        </motion.div>
      </div>

      {workflows.length === 0 ? (
        <div className="bento-card p-16 bg-white/50 backdrop-blur-sm border-2 border-black/5 flex flex-col items-center justify-center text-center">
          <Workflow className="h-16 w-16 text-black/20 mb-4" />
          <h3 className="font-display text-3xl font-bold uppercase mb-2">No Workflows Yet</h3>
          <p className="text-black/50 font-medium mb-6">Create your first visual automation to get started.</p>
          <Link to="/dashboard/automations/new" className="pill-btn-secondary bg-white">
            BUILD WORKFLOW
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(w => (
            <div key={w.id} className="bento-card bg-white p-6 border-2 border-black/5 flex flex-col justify-between group hover:shadow-[var(--shadow-soft)] hover:border-black/20 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-[12px] bg-black/5 flex items-center justify-center text-black">
                    <GitMerge className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2 truncate">
                  {w.name || 'Untitled Workflow'}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-3">
                  {w.nodes?.length || 0} Nodes • Last updated {new Date(w.updatedAt).toLocaleDateString()}
                </p>
                {(w.nodes?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {w.nodes.slice(0, 4).map((node) => (
                      <span
                        key={node.id}
                        className="pill-badge !text-[9px] !py-0.5 !px-2 max-w-[120px] truncate bg-black/5 text-black/70"
                        title={node.data?.label}
                      >
                        {node.data?.label || 'Node'}
                      </span>
                    ))}
                    {(w.nodes?.length || 0) > 4 && (
                      <span className="pill-badge !text-[9px] !py-0.5 !px-2 bg-black/5 text-black/50">
                        +{w.nodes.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-8 flex gap-3">
                <Link to={`/dashboard/automations/${w.id}`} className="pill-btn bg-black/5 text-black hover:bg-black hover:text-white transition-colors flex-1 text-center justify-center">
                  EDIT
                </Link>
                <button onClick={() => handleDelete(w.id)} className="pill-btn-secondary !text-red-500 !border-red-500/20 hover:!bg-red-500 hover:!text-white px-4 transition-colors">
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
