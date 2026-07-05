import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { nodeCatalog } from '../../pages/automations/nodeCatalog';

export default function NodeConfigDrawer({ selectedNode, onClose, onUpdateNode, onDeleteNode }) {
  const isOpen = !!selectedNode;
  
  // Find catalog entry to get fields
  const catalogEntry = selectedNode ? nodeCatalog.find(n => n.id === selectedNode.data.id) : null;
  const fields = catalogEntry?.fields || [];
  
  const IconComponent = catalogEntry ? (Icons[catalogEntry.icon] || Icons.Circle) : Icons.Circle;

  const handleChange = (fieldName, value) => {
    if (!selectedNode) return;
    const newData = { ...selectedNode.data, [fieldName]: value };
    onUpdateNode(selectedNode.id, newData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/5 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-[400px] max-w-full bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-black/10 flex justify-between items-center bg-white/50">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                {catalogEntry && (
                  <div 
                    className="h-8 w-8 rounded-[8px] flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: catalogEntry.accent, color: catalogEntry.accent === 'black' ? 'white' : 'black' }}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                )}
                Configure Node
              </h2>
              <button 
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {catalogEntry && (
                <div className="space-y-1 mb-8">
                  <h3 className="font-display font-bold text-lg uppercase leading-tight text-black">{catalogEntry.label}</h3>
                  <p className="text-sm font-medium text-black/50 leading-relaxed">{catalogEntry.description}</p>
                </div>
              )}

              {fields.length === 0 ? (
                <div className="text-center p-8 border border-black/5 rounded-[24px] bg-black/5">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-black/40">No configuration needed</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {fields.map(field => (
                    <div key={field.name} className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-black/60 pl-1">
                        {field.label}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select 
                          className="w-full bg-white border-2 border-black/10 rounded-xl px-4 py-3 font-medium text-black focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors appearance-none"
                          value={selectedNode.data[field.name] || field.defaultValue || ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                        >
                          <option value="" disabled>Select {field.label}</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type={field.type} 
                          className="w-full bg-white border-2 border-black/10 rounded-xl px-4 py-3 font-medium text-black focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                          value={selectedNode.data[field.name] || field.defaultValue || ''}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-black/10">
              <button 
                onClick={() => {
                  onDeleteNode(selectedNode.id);
                  onClose();
                }}
                className="w-full pill-btn-secondary !text-red-500 !border-red-500/20 hover:!bg-red-500 hover:!text-white flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> DELETE NODE
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
