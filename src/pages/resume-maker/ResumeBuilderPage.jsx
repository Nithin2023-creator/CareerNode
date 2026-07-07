import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resumeApi } from '../../lib/api';
import ResumeEditor from '../../components/resume/ResumeEditor';

const DEFAULT_RESUME_DATA = {
  personalInfo: { fullName: '', phone: '', email: '', linkedin: '', github: '' },
  education: [],
  skills: [],
  experience: [],
  projects: [],
  publications: [],
  achievements: []
};

export default function ResumeBuilderPage() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId);
    } else {
      setInitialData({
        title: 'Untitled Resume',
        mode: 'scratch',
        data: DEFAULT_RESUME_DATA
      });
      setIsLoading(false);
    }
  }, [resumeId]);

  const loadResume = async (id) => {
    try {
      setIsLoading(true);
      const data = await resumeApi.get(id);
      setInitialData(data);
    } catch (err) {
      console.error('Failed to load resume:', err);
      setError('Could not load the saved resume.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveComplete = (savedResume) => {
    // If we just created a new resume, update the URL so we are editing it
    if (!resumeId) {
      navigate(`/dashboard/resume-maker/build?id=${savedResume._id}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card p-8 bg-red-50 text-red-900 border border-red-200">
        <h2 className="font-bold text-xl mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard/resume-maker')} className="mt-4 underline font-bold">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 print:hidden">
        <div className="pill-badge bg-black/5 text-black w-fit mb-2">BUILD MODE</div>
      </div>
      <ResumeEditor 
        initialData={initialData.data} 
        initialTitle={initialData.title || 'Untitled Resume'}
        mode="scratch"
        resumeId={resumeId}
        onSaveComplete={handleSaveComplete}
      />
    </div>
  );
}
