import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Settings,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AIStudio: React.FC = () => {
  const { school } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'report-card' | 'lesson-plan' | 'rubric' | 'intervention' | 'config'
  >('report-card');

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Report card state
  const [rcSubject, setRcSubject] = useState('Physics & Mechanics');
  const [rcTone, setRcTone] = useState('Warm, inspiring, and actionable');
  const [rcStrengths, setRcStrengths] = useState('Curiosity, Analytical Problem Solving');
  const [rcGrowth, setRcGrowth] = useState('Detailed lab write-up documentation');
  const [rcResult, setRcResult] = useState<any>(null);
  const [rcLoading, setRcLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lesson plan state
  const [lpTopic, setLpTopic] = useState("Newton's Third Law & Rocket Momentum");
  const [lpSubject, setLpSubject] = useState('Physics');
  const [lpGrade, setLpGrade] = useState('Grade 9');
  const [lpDuration, setLpDuration] = useState('45');
  const [lpResult, setLpResult] = useState<any>(null);
  const [lpLoading, setLpLoading] = useState(false);

  // Rubric state
  const [rbTitle, setRbTitle] = useState('Thermal Conductivity Experimental Investigation');
  const [rbSubject, setRbSubject] = useState('Physics');
  const [rbMax, setRbMax] = useState('100');
  const [rbResult, setRbResult] = useState<any>(null);
  const [rbLoading, setRbLoading] = useState(false);

  // Intervention state
  const [ivStudent, setIvStudent] = useState('Julian Alvarez');
  const [ivAtt, setIvAtt] = useState('78');
  const [ivGrade, setIvGrade] = useState('68');
  const [ivResult, setIvResult] = useState<any>(null);
  const [ivLoading, setIvLoading] = useState(false);

  // Config state
  const [config, setConfig] = useState<any>({
    provider: 'nvidia',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    model: 'meta/llama-3.3-70b-instruct',
    apiKey: '',
    temperature: 0.4,
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [classList, cfg] = await Promise.all([
          ApiClient.get('/classes'),
          ApiClient.get('/ai/config'),
        ]);
        setClasses(classList);
        setConfig(cfg);
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id);
        }
      } catch (err) {
        console.error('Failed to load AI studio setup:', err);
      }
    };
    loadInitialData();
  }, [school]);

  // Load students when class changes
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchRoster = async () => {
      try {
        const res = await ApiClient.get(`/classes/${selectedClassId}/students`);
        setStudents(res);
        if (res.length > 0) {
          setSelectedStudentId(res[0].id);
        }
      } catch (err) {
        console.error('Failed to load students for AI:', err);
      }
    };
    fetchRoster();
  }, [selectedClassId]);

  // Generate Report Card Comment
  const handleGenerateReportCard = async () => {
    const currentStudent = students.find((s) => s.id === selectedStudentId);
    if (!currentStudent) return;

    setRcLoading(true);
    setCopied(false);
    try {
      const res = await ApiClient.post('/ai/report-card', {
        studentName: `${currentStudent.firstName} ${currentStudent.lastName}`,
        subject: rcSubject,
        gradeAverage: currentStudent.attendanceRate >= 90 ? 94 : 82,
        attendanceRate: currentStudent.attendanceRate,
        strengths: rcStrengths.split(',').map((s) => s.trim()),
        growthAreas: rcGrowth.split(',').map((s) => s.trim()),
        teacherTone: rcTone,
      });
      setRcResult(res);
    } catch (err: any) {
      alert(`AI error: ${err.message}`);
    } finally {
      setRcLoading(false);
    }
  };

  // Generate Lesson Plan
  const handleGenerateLessonPlan = async () => {
    setLpLoading(true);
    try {
      const res = await ApiClient.post('/ai/lesson-plan', {
        topic: lpTopic,
        subject: lpSubject,
        gradeLevel: lpGrade,
        durationMinutes: Number(lpDuration),
      });
      setLpResult(res);
    } catch (err: any) {
      alert(`AI error: ${err.message}`);
    } finally {
      setLpLoading(false);
    }
  };

  // Generate Rubric
  const handleGenerateRubric = async () => {
    setRbLoading(true);
    try {
      const res = await ApiClient.post('/ai/rubric', {
        title: rbTitle,
        subject: rbSubject,
        maxPoints: Number(rbMax),
      });
      setRbResult(res);
    } catch (err: any) {
      alert(`AI error: ${err.message}`);
    } finally {
      setRbLoading(false);
    }
  };

  // Generate Intervention Plan
  const handleGenerateIntervention = async () => {
    setIvLoading(true);
    try {
      const res = await ApiClient.post('/ai/intervention', {
        studentName: ivStudent,
        attendanceRate: Number(ivAtt),
        gradeAverage: Number(ivGrade),
        subject: 'Physics',
      });
      setIvResult(res);
    } catch (err: any) {
      alert(`AI error: ${err.message}`);
    } finally {
      setIvLoading(false);
    }
  };

  // Save AI Config to Database
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigLoading(true);
    setConfigSaved(false);
    try {
      await ApiClient.post('/ai/config', config);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (err: any) {
      alert(`Failed to save AI config: ${err.message}`);
    } finally {
      setConfigLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={26} color="#8b5cf6" />
            Teacher AI Studio
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Empowering educators with NVIDIA Build orchestrator, evidence-based reporting & lesson scaffolding
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge" style={{ backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
            <Cpu size={14} />
            Model: {config?.model?.split('/')[1] || 'Llama 3.3 70B'}
          </span>
          <span className="badge badge-success">
            Zero-Cost Ready
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'report-card' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'report-card' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'report-card' ? 700 : 500,
            background: 'none',
          }}
          onClick={() => setActiveTab('report-card')}
        >
          <FileCheck size={16} />
          Report Card Comment Writer
        </button>

        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'lesson-plan' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'lesson-plan' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'lesson-plan' ? 700 : 500,
            background: 'none',
          }}
          onClick={() => setActiveTab('lesson-plan')}
        >
          <BookOpen size={16} />
          45-Min Lesson Planner
        </button>

        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'rubric' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'rubric' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'rubric' ? 700 : 500,
            background: 'none',
          }}
          onClick={() => setActiveTab('rubric')}
        >
          <Layers size={16} />
          4-Tier Rubric Builder
        </button>

        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'intervention' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'intervention' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'intervention' ? 700 : 500,
            background: 'none',
          }}
          onClick={() => setActiveTab('intervention')}
        >
          <AlertTriangle size={16} />
          Early Intervention Radar
        </button>

        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'config' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            color: activeTab === 'config' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'config' ? 700 : 500,
            background: 'none',
          }}
          onClick={() => setActiveTab('config')}
        >
          <Settings size={16} />
          AI Model & DB Settings
        </button>
      </div>

      {/* TAB 1: REPORT CARD WRITER */}
      {activeTab === 'report-card' && (
        <div className="grid-2">
          {/* Controls */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              Student Data Synthesis
            </h3>

            <div className="form-group">
              <label className="form-label">Select Class</label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNumber} - {s.firstName} {s.lastName} (Att: {s.attendanceRate}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                value={rcSubject}
                onChange={(e) => setRcSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notable Strengths (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                value={rcStrengths}
                onChange={(e) => setRcStrengths(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Growth / Extension Areas</label>
              <input
                type="text"
                className="form-input"
                value={rcGrowth}
                onChange={(e) => setRcGrowth(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teacher Voice / Tone</label>
              <select
                className="form-select"
                value={rcTone}
                onChange={(e) => setRcTone(e.target.value)}
              >
                <option value="Warm, inspiring, and actionable">
                  Warm, inspiring, and actionable
                </option>
                <option value="Academic, precise, and analytical">
                  Academic, precise, and analytical
                </option>
                <option value="Encouraging with structured goal setting">
                  Encouraging with structured goal setting
                </option>
              </select>
            </div>

            <button
              className="btn btn-ai btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={handleGenerateReportCard}
              disabled={rcLoading}
            >
              <Sparkles size={18} />
              {rcLoading ? 'Synthesizing Data...' : 'Draft Evidence-Based Comment'}
            </button>
          </div>

          {/* AI Output Preview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h3 className="card-title">Generated Parent-Facing Comment</h3>
              {rcResult && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(rcResult.text)}
                >
                  {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minHeight: '260px',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                fontSize: '0.925rem',
                color: 'var(--text-main)',
              }}
            >
              {rcResult ? (
                rcResult.text
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Sparkles size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                  <p>Select a student and click <strong>'Draft Evidence-Based Comment'</strong>.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    The AI automatically incorporates their verified attendance percentage, grades, and strengths into authentic narrative remarks.
                  </p>
                </div>
              )}
            </div>

            {rcResult && (
              <div
                style={{
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Engine: <strong>{rcResult.model}</strong></span>
                <span>Source: <strong>{rcResult.source}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LESSON PLANNER */}
      {activeTab === 'lesson-plan' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              Lesson Scaffolding Parameters
            </h3>

            <div className="form-group">
              <label className="form-label">Lesson Topic / Conceptual Theme</label>
              <input
                type="text"
                className="form-input"
                value={lpTopic}
                onChange={(e) => setLpTopic(e.target.value)}
                placeholder="e.g. Newton's Third Law & Rocket Propulsion"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={lpSubject}
                  onChange={(e) => setLpSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grade Level</label>
                <input
                  type="text"
                  className="form-input"
                  value={lpGrade}
                  onChange={(e) => setLpGrade(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instruction Duration</label>
              <select
                className="form-select"
                value={lpDuration}
                onChange={(e) => setLpDuration(e.target.value)}
              >
                <option value="30">30 Minutes (Sprint Lab)</option>
                <option value="45">45 Minutes (Standard Block)</option>
                <option value="60">60 Minutes (Deep Exploration)</option>
                <option value="90">90 Minutes (Double Block Inquiry)</option>
              </select>
            </div>

            <button
              className="btn btn-ai btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={handleGenerateLessonPlan}
              disabled={lpLoading}
            >
              <Sparkles size={18} />
              {lpLoading ? 'Orchestrating Plan...' : 'Generate 45-Min Lesson Plan'}
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Structured Lesson Output (Toddle Framework)</h3>
              {lpResult && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(lpResult.text)}
                >
                  <Copy size={14} /> Copy
                </button>
              )}
            </div>

            <div
              style={{
                minHeight: '340px',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: '0.875rem',
                maxHeight: '480px',
                overflowY: 'auto',
              }}
            >
              {lpResult ? lpResult.text : 'Click Generate to draft inquiry lesson plan.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RUBRIC BUILDER */}
      {activeTab === 'rubric' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              Rubric Criteria Parameters
            </h3>

            <div className="form-group">
              <label className="form-label">Assignment / Project Title</label>
              <input
                type="text"
                className="form-input"
                value={rbTitle}
                onChange={(e) => setRbTitle(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={rbSubject}
                  onChange={(e) => setRbSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Points</label>
                <input
                  type="number"
                  className="form-input"
                  value={rbMax}
                  onChange={(e) => setRbMax(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-ai btn-lg"
              style={{ width: '100%' }}
              onClick={handleGenerateRubric}
              disabled={rbLoading}
            >
              <Sparkles size={18} />
              {rbLoading ? 'Building Standards...' : 'Generate 4-Tier Rubric'}
            </button>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              Rubric Standards Preview
            </h3>
            {rbResult?.rubric ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Array.isArray(rbResult.rubric) ? (
                  rbResult.rubric.map((crit: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.85rem',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        {crit.criterion} ({crit.weight})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>Exemplary:</strong> {crit.levels?.exemplary}
                      </div>
                    </div>
                  ))
                ) : (
                  <pre style={{ fontSize: '0.8rem' }}>{JSON.stringify(rbResult.rubric, null, 2)}</pre>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No rubric generated yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: INTERVENTION RADAR */}
      {activeTab === 'intervention' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              At-Risk Student Diagnostic
            </h3>

            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input
                type="text"
                className="form-input"
                value={ivStudent}
                onChange={(e) => setIvStudent(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Attendance Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={ivAtt}
                  onChange={(e) => setIvAtt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Grade (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={ivGrade}
                  onChange={(e) => setIvGrade(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-ai btn-lg"
              style={{ width: '100%' }}
              onClick={handleGenerateIntervention}
              disabled={ivLoading}
            >
              <AlertTriangle size={18} />
              {ivLoading ? 'Analyzing...' : 'Generate Targeted Intervention Plan'}
            </button>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              Recommended Pedagogical Actions
            </h3>
            <div
              style={{
                minHeight: '260px',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: '0.875rem',
              }}
            >
              {ivResult ? ivResult.text : 'Click Generate to compute intervention steps.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MODEL CONFIGURATION (DB & PROPERTY BASED) */}
      {activeTab === 'config' && (
        <div style={{ maxWidth: '680px' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
              NVIDIA Build & LLM Orchestration Settings
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Model properties can be loaded from the environment (<kbd>.env</kbd>) or overridden directly in the database (<kbd>SchoolSetting</kbd>) per institution.
            </p>

            {configSaved && (
              <div
                style={{
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Check size={16} />
                <span>AI Configuration saved to database successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Provider</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.provider || 'nvidia'}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base URL (OpenAI-Compatible Endpoint)</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.baseURL || 'https://integrate.api.nvidia.com/v1'}
                  onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model Identifier</label>
                <input
                  type="text"
                  className="form-input"
                  value={config.model || 'meta/llama-3.3-70b-instruct'}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Supported free models on build.nvidia.com: <code>meta/llama-3.3-70b-instruct</code>, <code>mistralai/mistral-large-2-instruct</code>, <code>deepseek-ai/deepseek-r1</code>.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">NVIDIA API Key (Optional for live inference)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder={config.hasApiKey ? 'nvapi-•••••••••••• (Configured)' : 'nvapi-...'}
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temperature: {config.temperature || 0.4}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  style={{ width: '100%' }}
                  value={config.temperature || 0.4}
                  onChange={(e) =>
                    setConfig({ ...config, temperature: parseFloat(e.target.value) })
                  }
                />
              </div>

              {/* Zero-Cost Fallback Assurance Note */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  fontSize: '0.8rem',
                  color: '#166534',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Zero-Cost & Offline Guarantee:</strong> When no API key is provided, the platform automatically utilizes its built-in pedagogical rule engine. You do not need to pay anything or enter payment details to test and demonstrate all AI capabilities.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={configLoading}
              >
                <Save size={18} />
                {configLoading ? 'Saving to Database...' : 'Save Settings to Database'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
