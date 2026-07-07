import React from 'react';

const ResumePreview = React.forwardRef(({ data }, ref) => {
  const {
    personalInfo = {},
    education = [],
    skills = [],
    experience = [],
    projects = [],
    publications = [],
    achievements = []
  } = data;

  return (
    <div 
      ref={ref} 
      id="resume-preview"
      className="bg-white text-black p-[0.5in] w-full min-h-[11in] shadow-[var(--shadow-soft)] mx-auto relative overflow-hidden"
      style={{
        fontFamily: "Georgia, 'Times New Roman', Times, serif",
        fontSize: "11pt",
        lineHeight: "1.4",
        maxWidth: "8.5in" // Standard US Letter/A4 width approx for display
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center items-center text-[10.5pt]">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          
          {personalInfo.phone && personalInfo.email && <span className="mx-2">—</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          
          {(personalInfo.phone || personalInfo.email) && personalInfo.linkedin && <span className="mx-2">—</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          
          {(personalInfo.phone || personalInfo.email || personalInfo.linkedin) && personalInfo.github && <span className="mx-2">—</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4 resume-section">
          <h2 className="text-[12pt] font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>Education</h2>
          <hr className="border-black mb-2" />
          
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start font-bold">
                  <span>{edu.institution || "Institution Name"}</span>
                  <span className="font-normal">{edu.location || "Location"}</span>
                </div>
                <div className="flex justify-between items-start italic">
                  <span>{edu.degree || "Degree"}</span>
                  <span className="not-italic">{edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4 resume-section">
          <h2 className="text-[12pt] font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>Technical Skills</h2>
          <hr className="border-black mb-2" />
          
          <div className="space-y-1">
            {skills.map((skillGroup, index) => (
              <div key={index} className="flex">
                <span className="font-bold mr-2 whitespace-nowrap">{skillGroup.category}:</span>
                <span>{skillGroup.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4 resume-section">
          <h2 className="text-[12pt] font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>Experience</h2>
          <hr className="border-black mb-2" />
          
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start font-bold">
                  <span>{exp.company || "Company Name"}</span>
                  <span className="font-normal">{exp.location || "Location"}</span>
                </div>
                <div className="flex justify-between items-start italic mb-1">
                  <span>{exp.role || "Role"}</span>
                  <span className="not-italic">{exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Present'}` : ''}</span>
                </div>
                
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="pl-4 space-y-1 mt-1">
                    {exp.bullets.map((bullet, bIndex) => (
                      <li key={bIndex} className="relative before:content-['–'] before:absolute before:-left-4">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4 resume-section">
          <h2 className="text-[12pt] font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>Projects</h2>
          <hr className="border-black mb-2" />
          
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between items-start font-bold">
                  <div className="flex items-center">
                    <span className="mr-2">•</span>
                    <span>{project.name || "Project Name"}</span>
                  </div>
                  <div className="font-normal">
                    {project.links && <span>{project.links}</span>}
                  </div>
                </div>
                
                {project.bullets && project.bullets.length > 0 && (
                  <ul className="pl-6 space-y-1 mt-1">
                    {project.bullets.map((bullet, bIndex) => (
                      <li key={bIndex} className="relative before:content-['-'] before:absolute before:-left-3">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                
                {project.techStack && (
                  <div className="pl-6 mt-1">
                    <span className="font-bold">Tech Stack:</span> {project.techStack}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research & Publications */}
      {publications.length > 0 && (
        <div className="mb-4 resume-section">
          <h2 className="text-[12pt] font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>Research & Publications</h2>
          <hr className="border-black mb-2" />
          
          <div className="space-y-3">
            {publications.map((pub, index) => (
              <div key={index}>
                <div className="flex items-start">
                  <span className="mr-2 font-bold">•</span>
                  <div>
                    <div className="font-bold">"{pub.title || "Publication Title"}"</div>
                    {pub.description && <div className="mt-1">{pub.description}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leadership & Achievements */}
      {achievements.length > 0 && (
        <div className="mb-4 resume-section">
          <h2 className="text-[12pt] font-bold uppercase mb-1" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>Leadership & Achievements</h2>
          <hr className="border-black mb-2" />
          
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2 font-bold">•</span>
                <div>{achievement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
