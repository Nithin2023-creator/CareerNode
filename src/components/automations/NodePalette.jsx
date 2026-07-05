import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { nodeCatalog } from '../../pages/automations/nodeCatalog';
import { isMobileViewport } from '../../lib/viewport';

const categories = [...new Set(nodeCatalog.map((n) => n.category))];

export default function NodePalette({ onAddNode }) {
  const [openCategories, setOpenCategories] = useState(() =>
    Object.fromEntries(categories.map((c) => [c, true]))
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const onDragStart = (event, nodeDef) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeDef));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (nodeDef) => {
    if (onAddNode && isMobileViewport()) {
      onAddNode(nodeDef);
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Floating Button */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden absolute bottom-6 right-6 z-40 pill-btn bg-black text-white shadow-2xl flex items-center gap-2"
      >
        <Plus className="w-5 h-5" /> Add Node
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static top-0 right-0 lg:right-auto lg:left-0 h-full w-[300px] sm:w-[360px] lg:w-[300px] bg-white border-l lg:border-r lg:border-l-0 border-black/10 flex flex-col shadow-2xl lg:shadow-xl z-[70] lg:z-10 flex-shrink-0 transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-black/10 bg-white/50 backdrop-blur-sm flex justify-between items-center">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Nodes</h2>
            <p className="text-xs font-medium text-black/50 mt-1 uppercase tracking-widest hidden lg:block">Drag onto canvas</p>
            <p className="text-xs font-medium text-black/50 mt-1 uppercase tracking-widest lg:hidden">Tap to add to canvas</p>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-black/5 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {categories.map((category) => {
          const categoryNodes = nodeCatalog.filter((n) => n.category === category);
          const isOpen = openCategories[category];

          return (
            <div key={category} className="border border-black/5 rounded-[20px] overflow-hidden bg-white/80">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] transition-colors"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/60">
                  {category}
                </h3>
                <ChevronDown
                  className={`h-4 w-4 text-black/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  {categoryNodes.map((node) => {
                    const Icon = Icons[node.icon] || Icons.Circle;
                    return (
                      <div
                        key={node.id}
                        className="bento-card bg-white p-3 flex items-center gap-3 cursor-pointer lg:cursor-grab lg:active:cursor-grabbing border-2 border-black/5 hover:border-black/20 shadow-sm transition-all hover:shadow-[var(--shadow-soft)]"
                        draggable
                        onDragStart={(e) => onDragStart(e, node)}
                        onClick={() => handleNodeClick(node)}
                      >
                        <div
                          className="h-8 w-8 rounded-[8px] flex items-center justify-center shadow-sm flex-shrink-0"
                          style={{
                            backgroundColor: node.accent,
                            color: node.accent === 'black' ? 'white' : 'black',
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                            {node.kind}
                          </div>
                          <div className="font-display font-bold text-xs uppercase leading-tight truncate text-black">
                            {node.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
