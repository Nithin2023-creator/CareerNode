const STORAGE_KEY = 'cn_workflows';

export const listWorkflows = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to list workflows:', err);
    return [];
  }
};

export const getWorkflow = (id) => {
  const workflows = listWorkflows();
  return workflows.find((w) => w.id === id) || null;
};

export const saveWorkflow = (workflow) => {
  let workflows = listWorkflows();
  const index = workflows.findIndex((w) => w.id === workflow.id);
  
  const updatedWorkflow = {
    ...workflow,
    updatedAt: new Date().toISOString()
  };

  if (index >= 0) {
    workflows[index] = updatedWorkflow;
  } else {
    workflows.push(updatedWorkflow);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  return updatedWorkflow;
};

export const deleteWorkflow = (id) => {
  let workflows = listWorkflows();
  workflows = workflows.filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
};
