'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  id: string
  degree: string
  school: string
  year: string
  grade: string
}

interface ResumeData {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
  summary: string
  experiences: Experience[]
  education: Education[]
  skills: string
  certifications: string
}

const uid = () => Math.random().toString(36).slice(2, 8)

const defaultData: ResumeData = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  summary: '',
  experiences: [{ id: uid(), company: '', role: '', startDate: '', endDate: '', description: '' }],
  education: [{ id: uid(), degree: '', school: '', year: '', grade: '' }],
  skills: '',
  certifications: '',
}

// ── Resume Preview (pure display, also used for PDF) ───────────────────────
function ResumePreview({ data, previewRef }: { data: ResumeData; previewRef: React.RefObject<HTMLDivElement> }) {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="resume-sheet" ref={previewRef} id="resume-output">
      {/* Header */}
      <div>
        <div className="resume-name">{data.fullName || 'Your Name'}</div>
        {data.jobTitle && <div className="resume-title">{data.jobTitle}</div>}
        <div className="resume-contacts">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          {data.github && <a href={data.github} target="_blank" rel="noreferrer">GitHub</a>}
          {data.portfolio && <a href={data.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="resume-section">
          <div className="resume-section-title">Profile</div>
          <p className="resume-summary">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experiences.some(e => e.company || e.role) && (
        <div className="resume-section">
          <div className="resume-section-title">Experience</div>
          {data.experiences.filter(e => e.company || e.role).map(exp => (
            <div className="resume-entry" key={exp.id}>
              <div className="entry-header">
                <span className="entry-company">{exp.company}</span>
                {(exp.startDate || exp.endDate) && (
                  <span className="entry-date">
                    {exp.startDate}{exp.startDate && exp.endDate ? ' – ' : ''}{exp.endDate || (exp.startDate ? 'Present' : '')}
                  </span>
                )}
              </div>
              {exp.role && <div className="entry-role">{exp.role}</div>}
              {exp.description && <div className="entry-desc">{exp.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.some(e => e.degree || e.school) && (
        <div className="resume-section">
          <div className="resume-section-title">Education</div>
          {data.education.filter(e => e.degree || e.school).map(edu => (
            <div className="resume-entry" key={edu.id}>
              <div className="entry-header">
                <span className="entry-degree">{edu.degree}</span>
                {edu.year && <span className="entry-date">{edu.year}</span>}
              </div>
              {edu.school && <div className="entry-school">{edu.school}{edu.grade ? ` · ${edu.grade}` : ''}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="resume-section">
          <div className="resume-section-title">Skills</div>
          <div className="skills-grid">
            {skills.map((s, i) => <span className="skill-tag" key={i}>{s}</span>)}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && (
        <div className="resume-section">
          <div className="resume-section-title">Certifications</div>
          <p className="resume-summary" style={{ whiteSpace: 'pre-wrap' }}>{data.certifications}</p>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [data, setData] = useState<ResumeData>(defaultData)
  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const set = useCallback((field: keyof ResumeData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Experience helpers
  const addExp = () => setData(prev => ({
    ...prev,
    experiences: [...prev.experiences, { id: uid(), company: '', role: '', startDate: '', endDate: '', description: '' }]
  }))

  const removeExp = (id: string) => setData(prev => ({
    ...prev,
    experiences: prev.experiences.filter(e => e.id !== id)
  }))

  const setExp = (id: string, field: keyof Experience, value: string) => setData(prev => ({
    ...prev,
    experiences: prev.experiences.map(e => e.id === id ? { ...e, [field]: value } : e)
  }))

  // Education helpers
  const addEdu = () => setData(prev => ({
    ...prev,
    education: [...prev.education, { id: uid(), degree: '', school: '', year: '', grade: '' }]
  }))

  const removeEdu = (id: string) => setData(prev => ({
    ...prev,
    education: prev.education.filter(e => e.id !== id)
  }))

  const setEdu = (id: string, field: keyof Education, value: string) => setData(prev => ({
    ...prev,
    education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
  }))

  // PDF Download
  const downloadPDF = async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${data.fullName.replace(/\s+/g, '_') || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      await html2pdf().set(opt).from(previewRef.current).save()
    } finally {
      setDownloading(false)
    }
  }

  const clearAll = () => {
    if (confirm('Clear all fields and start fresh?')) setData(defaultData)
  }

  return (
    <>
      {/* Header */}
      <header className="site-header">
        <span className="site-logo">resume<span>.</span>build</span>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noreferrer"
          className="dh-btn"
        >
          Built for Digital Heroes
        </a>
      </header>

      {/* App */}
      <div className="app-layout">

        {/* ── Form Panel ── */}
        <aside className="form-panel">
          <div className="form-inner">

            {/* Personal Info */}
            <div className="section-group">
              <div className="section-group-header">
                <span>👤</span> Personal Info
              </div>
              <div className="section-group-body">
                <div className="field-row single">
                  <div>
                    <label>Full Name *</label>
                    <input type="text" placeholder="Priya Sharma" value={data.fullName} onChange={e => set('fullName', e.target.value)} />
                  </div>
                </div>
                <div className="field-row single">
                  <div>
                    <label>Job Title / Role</label>
                    <input type="text" placeholder="Frontend Developer" value={data.jobTitle} onChange={e => set('jobTitle', e.target.value)} />
                  </div>
                </div>
                <div className="field-row">
                  <div>
                    <label>Email</label>
                    <input type="email" placeholder="you@email.com" value={data.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" value={data.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="field-row single">
                  <div>
                    <label>Location</label>
                    <input type="text" placeholder="Bangalore, India" value={data.location} onChange={e => set('location', e.target.value)} />
                  </div>
                </div>
                <div className="field-row">
                  <div>
                    <label>LinkedIn URL</label>
                    <input type="url" placeholder="linkedin.com/in/you" value={data.linkedin} onChange={e => set('linkedin', e.target.value)} />
                  </div>
                  <div>
                    <label>GitHub URL</label>
                    <input type="url" placeholder="github.com/you" value={data.github} onChange={e => set('github', e.target.value)} />
                  </div>
                </div>
                <div className="field-row single">
                  <div>
                    <label>Portfolio / Website</label>
                    <input type="url" placeholder="yourportfolio.com" value={data.portfolio} onChange={e => set('portfolio', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="section-group">
              <div className="section-group-header">
                <span>📝</span> Profile Summary
              </div>
              <div className="section-group-body">
                <div>
                  <label>2–4 sentences about you</label>
                  <textarea
                    placeholder="Results-driven developer with 2+ years building scalable web applications. Passionate about clean code, performance, and great UX."
                    value={data.summary}
                    onChange={e => set('summary', e.target.value)}
                    style={{ minHeight: 90 }}
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="section-group">
              <div className="section-group-header">
                <span>💼</span> Work Experience
              </div>
              <div className="section-group-body">
                {data.experiences.map((exp, idx) => (
                  <div className="entry-card" key={exp.id}>
                    {data.experiences.length > 1 && (
                      <button className="remove-btn" onClick={() => removeExp(exp.id)} title="Remove">×</button>
                    )}
                    <div className="field-row single">
                      <div>
                        <label>Company</label>
                        <input type="text" placeholder="Acme Corp" value={exp.company} onChange={e => setExp(exp.id, 'company', e.target.value)} />
                      </div>
                    </div>
                    <div className="field-row single">
                      <div>
                        <label>Role / Position</label>
                        <input type="text" placeholder="Frontend Developer" value={exp.role} onChange={e => setExp(exp.id, 'role', e.target.value)} />
                      </div>
                    </div>
                    <div className="field-row">
                      <div>
                        <label>Start</label>
                        <input type="text" placeholder="Jan 2022" value={exp.startDate} onChange={e => setExp(exp.id, 'startDate', e.target.value)} />
                      </div>
                      <div>
                        <label>End (or "Present")</label>
                        <input type="text" placeholder="Present" value={exp.endDate} onChange={e => setExp(exp.id, 'endDate', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label>Key achievements & responsibilities</label>
                      <textarea
                        placeholder="• Built and maintained React dashboards serving 10k+ users&#10;• Reduced load time by 40% through code splitting"
                        value={exp.description}
                        onChange={e => setExp(exp.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={addExp}>+ Add Experience</button>
              </div>
            </div>

            {/* Education */}
            <div className="section-group">
              <div className="section-group-header">
                <span>🎓</span> Education
              </div>
              <div className="section-group-body">
                {data.education.map(edu => (
                  <div className="entry-card" key={edu.id}>
                    {data.education.length > 1 && (
                      <button className="remove-btn" onClick={() => removeEdu(edu.id)} title="Remove">×</button>
                    )}
                    <div className="field-row single">
                      <div>
                        <label>Degree / Course</label>
                        <input type="text" placeholder="B.Tech in Computer Science" value={edu.degree} onChange={e => setEdu(edu.id, 'degree', e.target.value)} />
                      </div>
                    </div>
                    <div className="field-row single">
                      <div>
                        <label>College / University</label>
                        <input type="text" placeholder="IIT Bombay" value={edu.school} onChange={e => setEdu(edu.id, 'school', e.target.value)} />
                      </div>
                    </div>
                    <div className="field-row">
                      <div>
                        <label>Year / Duration</label>
                        <input type="text" placeholder="2018 – 2022" value={edu.year} onChange={e => setEdu(edu.id, 'year', e.target.value)} />
                      </div>
                      <div>
                        <label>Grade / CGPA</label>
                        <input type="text" placeholder="8.5 / 10" value={edu.grade} onChange={e => setEdu(edu.id, 'grade', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={addEdu}>+ Add Education</button>
              </div>
            </div>

            {/* Skills */}
            <div className="section-group">
              <div className="section-group-header">
                <span>⚡</span> Skills
              </div>
              <div className="section-group-body">
                <div>
                  <label>Comma-separated skills</label>
                  <textarea
                    placeholder="React, Next.js, TypeScript, Node.js, PostgreSQL, Figma, Git"
                    value={data.skills}
                    onChange={e => set('skills', e.target.value)}
                    style={{ minHeight: 70 }}
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="section-group">
              <div className="section-group-header">
                <span>🏅</span> Certifications (Optional)
              </div>
              <div className="section-group-body">
                <div>
                  <label>One per line</label>
                  <textarea
                    placeholder="Google UX Design Certificate — 2023&#10;AWS Cloud Practitioner — 2024"
                    value={data.certifications}
                    onChange={e => set('certifications', e.target.value)}
                    style={{ minHeight: 70 }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Action Strip */}
          <div className="action-strip">
            <button className="btn-secondary" onClick={clearAll}>Clear</button>
            <button className="btn-primary" onClick={downloadPDF} disabled={downloading}>
              {downloading ? 'Generating PDF…' : '⬇ Download PDF'}
            </button>
          </div>
        </aside>

        {/* ── Preview Panel ── */}
        <main className="preview-panel">
          <div className="preview-toolbar">
            <span className="preview-label">Live Preview</span>
            <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={downloadPDF} disabled={downloading}>
              {downloading ? 'Generating…' : '⬇ Download PDF'}
            </button>
          </div>
          <ResumePreview data={data} previewRef={previewRef} />

          {/* Footer inside preview panel */}
          <div className="site-footer" style={{ width: '100%', maxWidth: 760 }}>
            Made by <strong>Kavya</strong> · <a href="mailto:your@email.com">kavyakamatham@email.com</a>
            &nbsp;·&nbsp;
            <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer">Digital Heroes</a>
          </div>
        </main>

      </div>
    </>
  )
}
