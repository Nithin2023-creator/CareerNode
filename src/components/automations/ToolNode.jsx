import React from 'react';
import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';

export default function ToolNode({ data, selected }) {
  const IconComponent = Icons[data.icon] || Icons.Circle;
  const isIfNode = data.id === 'logic_if';

  const hasInput = data.kind === 'action' || data.kind === 'logic';

  return (
    <div className={`bento-card bg-white p-4 w-[260px] border-2 transition-all ${selected ? 'border-black' : 'border-black/5 hover:border-black/20'} shadow-[var(--shadow-soft)] relative`}>
      {hasInput && (
        <Handle type="target" position={Position.Left} isConnectable={true} />
      )}

      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{
            backgroundColor: data.accent,
            color: data.accent === 'black' ? 'white' : 'black',
          }}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-black/50 mb-0.5 truncate">
            {data.category}
          </div>
          <h3 className="font-display font-bold text-sm uppercase leading-tight text-black line-clamp-2">
            {data.label}
          </h3>
        </div>
      </div>

      {isIfNode ? (
        <>
          <div className="mt-3 pt-3 border-t border-black/5 flex justify-end gap-6 text-[9px] font-bold uppercase tracking-widest text-black/40 pr-1">
            <span>True</span>
            <span>False</span>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            isConnectable={true}
            style={{ top: '42%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            isConnectable={true}
            style={{ top: '78%' }}
          />
        </>
      ) : (
        <Handle type="source" position={Position.Right} isConnectable={true} />
      )}
    </div>
  );
}
