import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { nodeCatalog } from '../../pages/automations/nodeCatalog';

const categories = [...new Set(nodeCatalog.map((n) => n.category))];

export default function NodePalette() {
  const [openCategories, setOpenCategories] = useState(() =>
    Object.fromEntries(categories.map((c) => [c, true]))
  );

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const onDragStart = (event, nodeDef) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeDef));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[300px] h-full bg-white border-r border-black/10 flex flex-col shadow-xl z-10 relative flex-shrink-0">
      <div className="p-6 border-b border-black/10 bg-white/50 backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Nodes</h2>
        <p className="text-xs font-medium text-black/50 mt-1 uppercase tracking-widest">Drag onto canvas</p>
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
                        className="bento-card bg-white p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing border-2 border-black/5 hover:border-black/20 shadow-sm transition-all hover:shadow-[var(--shadow-soft)]"
                        draggable
                        onDragStart={(e) => onDragStart(e, node)}
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
  );
}
