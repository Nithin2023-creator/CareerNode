import React from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SectionHeader = ({ title, isOpen, onToggle }) => (
  <button 
    onClick={onToggle}
    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-black/5"
  >
    <h3 className="font-display font-bold text-xl uppercase tracking-tight">{title}</h3>
    {isOpen ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
  </button>
);

const Input = ({ label, placeholder, value, onChange, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-widest text-black/60">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
    />
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-widest text-black/60">{label}</label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium resize-none"
    />
  </div>
);

export const PersonalInfoSection = ({ data, updateData }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Personal Information" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Full Name" placeholder="John Doe" value={data.fullName || ''} onChange={(e) => updateData({ ...data, fullName: e.target.value })} />
              </div>
              <Input label="Phone" placeholder="(555) 123-4567" value={data.phone || ''} onChange={(e) => updateData({ ...data, phone: e.target.value })} />
              <Input label="Email" placeholder="john@example.com" type="email" value={data.email || ''} onChange={(e) => updateData({ ...data, email: e.target.value })} />
              <Input label="LinkedIn" placeholder="linkedin.com/in/johndoe" value={data.linkedin || ''} onChange={(e) => updateData({ ...data, linkedin: e.target.value })} />
              <Input label="GitHub" placeholder="github.com/johndoe" value={data.github || ''} onChange={(e) => updateData({ ...data, github: e.target.value })} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EducationSection = ({ items, updateItems }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const addItem = () => updateItems([...items, { institution: '', degree: '', location: '', startDate: '', endDate: '' }]);
  const updateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateItems(newItems);
  };
  const removeItem = (index) => updateItems(items.filter((_, i) => i !== index));

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Education" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="relative p-4 border border-black/10 rounded-2xl bg-black/5 group">
                  <button onClick={() => removeItem(index)} className="absolute top-4 right-4 p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                    <Input label="Institution" placeholder="University of Example" value={item.institution} onChange={(e) => updateItem(index, { institution: e.target.value })} />
                    <Input label="Degree" placeholder="B.S. Computer Science" value={item.degree} onChange={(e) => updateItem(index, { degree: e.target.value })} />
                    <Input label="Location" placeholder="City, State" value={item.location} onChange={(e) => updateItem(index, { location: e.target.value })} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input label="Start Date" placeholder="Aug 2019" value={item.startDate} onChange={(e) => updateItem(index, { startDate: e.target.value })} />
                      <Input label="End Date" placeholder="May 2023" value={item.endDate} onChange={(e) => updateItem(index, { endDate: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-black/15 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all">
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SkillsSection = ({ items, updateItems }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const addItem = () => updateItems([...items, { category: '', items: '' }]);
  const updateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateItems(newItems);
  };
  const removeItem = (index) => updateItems(items.filter((_, i) => i !== index));

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Technical Skills" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="relative p-4 border border-black/10 rounded-2xl bg-black/5 flex gap-4 pr-14 items-center">
                  <div className="w-1/3">
                    <Input label="Category" placeholder="e.g. Languages" value={item.category} onChange={(e) => updateItem(index, { category: e.target.value })} />
                  </div>
                  <div className="w-2/3">
                    <Input label="Skills" placeholder="React, Node, Python..." value={item.items} onChange={(e) => updateItem(index, { items: e.target.value })} />
                  </div>
                  <button onClick={() => removeItem(index)} className="absolute right-4 p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-black/15 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all">
                <Plus className="w-4 h-4" /> Add Skill Category
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ExperienceSection = ({ items, updateItems }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const addItem = () => updateItems([...items, { company: '', role: '', location: '', startDate: '', endDate: '', bullets: [''] }]);
  
  const updateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateItems(newItems);
  };
  
  const removeItem = (index) => updateItems(items.filter((_, i) => i !== index));

  const updateBullet = (expIndex, bulletIndex, value) => {
    const newItems = [...items];
    const newBullets = [...newItems[expIndex].bullets];
    newBullets[bulletIndex] = value;
    newItems[expIndex].bullets = newBullets;
    updateItems(newItems);
  };

  const addBullet = (expIndex) => {
    const newItems = [...items];
    newItems[expIndex].bullets.push('');
    updateItems(newItems);
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const newItems = [...items];
    newItems[expIndex].bullets = newItems[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    updateItems(newItems);
  };

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Experience" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="relative p-4 border border-black/10 rounded-2xl bg-black/5">
                  <button onClick={() => removeItem(index)} className="absolute top-4 right-4 p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10 mb-4">
                    <Input label="Company" placeholder="Google" value={item.company} onChange={(e) => updateItem(index, { company: e.target.value })} />
                    <Input label="Role" placeholder="Software Engineer" value={item.role} onChange={(e) => updateItem(index, { role: e.target.value })} />
                    <Input label="Location" placeholder="San Francisco, CA" value={item.location} onChange={(e) => updateItem(index, { location: e.target.value })} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input label="Start Date" placeholder="Jan 2021" value={item.startDate} onChange={(e) => updateItem(index, { startDate: e.target.value })} />
                      <Input label="End Date" placeholder="Present" value={item.endDate} onChange={(e) => updateItem(index, { endDate: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-black/10">
                    <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Description Bullets</label>
                    {item.bullets.map((bullet, bIndex) => (
                      <div key={bIndex} className="flex gap-2 items-start">
                        <textarea
                          placeholder="Describe what you did..."
                          value={bullet}
                          onChange={(e) => updateBullet(index, bIndex, e.target.value)}
                          rows={2}
                          className="flex-1 px-4 py-2 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-sm resize-none"
                        />
                        <button onClick={() => removeBullet(index, bIndex)} className="p-2 mt-1 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addBullet(index)} className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-blue)] hover:underline mt-2">
                      + Add Bullet
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-black/15 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all">
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProjectsSection = ({ items, updateItems }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const addItem = () => updateItems([...items, { name: '', links: '', techStack: '', bullets: [''] }]);
  
  const updateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateItems(newItems);
  };
  
  const removeItem = (index) => updateItems(items.filter((_, i) => i !== index));

  const updateBullet = (projIndex, bulletIndex, value) => {
    const newItems = [...items];
    const newBullets = [...newItems[projIndex].bullets];
    newBullets[bulletIndex] = value;
    newItems[projIndex].bullets = newBullets;
    updateItems(newItems);
  };

  const addBullet = (projIndex) => {
    const newItems = [...items];
    newItems[projIndex].bullets.push('');
    updateItems(newItems);
  };

  const removeBullet = (projIndex, bulletIndex) => {
    const newItems = [...items];
    newItems[projIndex].bullets = newItems[projIndex].bullets.filter((_, i) => i !== bulletIndex);
    updateItems(newItems);
  };

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Projects" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="relative p-4 border border-black/10 rounded-2xl bg-black/5">
                  <button onClick={() => removeItem(index)} className="absolute top-4 right-4 p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10 mb-4">
                    <Input label="Project Name" placeholder="My Awesome Project" value={item.name} onChange={(e) => updateItem(index, { name: e.target.value })} />
                    <Input label="Links (e.g. GitHub)" placeholder="github.com/..." value={item.links} onChange={(e) => updateItem(index, { links: e.target.value })} />
                    <div className="md:col-span-2">
                      <Input label="Tech Stack" placeholder="React, Node.js, MongoDB" value={item.techStack} onChange={(e) => updateItem(index, { techStack: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-black/10">
                    <label className="block text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Description Bullets</label>
                    {item.bullets.map((bullet, bIndex) => (
                      <div key={bIndex} className="flex gap-2 items-start">
                        <textarea
                          placeholder="Describe the project..."
                          value={bullet}
                          onChange={(e) => updateBullet(index, bIndex, e.target.value)}
                          rows={2}
                          className="flex-1 px-4 py-2 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 text-sm resize-none"
                        />
                        <button onClick={() => removeBullet(index, bIndex)} className="p-2 mt-1 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addBullet(index)} className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent-blue)] hover:underline mt-2">
                      + Add Bullet
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-black/15 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all">
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PublicationsSection = ({ items, updateItems }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const addItem = () => updateItems([...items, { title: '', description: '' }]);
  const updateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateItems(newItems);
  };
  const removeItem = (index) => updateItems(items.filter((_, i) => i !== index));

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Research & Publications" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="relative p-4 border border-black/10 rounded-2xl bg-black/5">
                  <button onClick={() => removeItem(index)} className="absolute top-4 right-4 p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-10 space-y-4">
                    <Input label="Title" placeholder="Paper Title" value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} />
                    <TextArea label="Description" placeholder="Authored a paper on..." value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} />
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-black/15 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all">
                <Plus className="w-4 h-4" /> Add Publication
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AchievementsSection = ({ items, updateItems }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const addItem = () => updateItems([...items, '']);
  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    updateItems(newItems);
  };
  const removeItem = (index) => updateItems(items.filter((_, i) => i !== index));

  return (
    <div className="bento-card bg-white border border-black/10 shadow-[var(--shadow-soft)] overflow-hidden">
      <SectionHeader title="Leadership & Achievements" isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input label={`Achievement ${index + 1}`} placeholder="1st Place Hackathon..." value={item} onChange={(e) => updateItem(index, e.target.value)} />
                  </div>
                  <button onClick={() => removeItem(index)} className="mt-6 p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-black/15 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold uppercase tracking-widest text-black/60 hover:text-black hover:border-black/30 hover:bg-black/5 transition-all">
                <Plus className="w-4 h-4" /> Add Achievement
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
