import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  ArrowRight,
  FileText,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { ApiClient } from '../services/api';

interface GradingStudioProps {
  initialAssignmentId?: string;
}

export const GradingStudio: React.FC<GradingStudioProps> = ({
  initialAssignmentId,
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form inputs for currently selected student
  const [points, setPoints] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [suggestingFeedback, setSuggestingFeedback] = useState(false);

  // Load all assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const list = await ApiClient.get('/assignments');
        setAssignments(list);
        if (list.length > 0) {
          const defaultId =
            initialAssignmentId && list.some((a: any) => a.id === initialAssignmentId)
              ? initialAssignmentId
              : list[0].id;
          setSelectedAssignmentId(defaultId);
        }
      } catch (err) {
        console.error('Failed to load assignments for grading:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [initialAssignmentId]);

  // Load submissions for selected assignment
  useEffect(() => {
    if (!selectedAssignmentId) return;

    const fetchSubmissions = async () => {
      try {
        const res = await ApiClient.get(`/assignments/${selectedAssignmentId}/submissions`);
        setData(res);
        setSelectedStudentIndex(0);
        if (res.students && res.students.length > 0) {
          const first = res.students[0];
          setPoints(first.grade !== null ? String(first.grade) : '');
          setFeedback(first.feedback || '');
        }
      } catch (err) {
        console.error('Failed to load submissions:', err);
      }
    };

    fetchSubmissions();
  }, [selectedAssignmentId]);

  // When switching selected student in roster
  const handleSelectStudent = (index: number) => {
    setSelectedStudentIndex(index);
    const st = data.students[index];
    setPoints(st.grade !== null ? String(st.grade) : '');
    setFeedback(st.feedback || '');
  };

  const currentStudent = data?.students?.[selectedStudentIndex];
  const maxScore = data?.assignment?.maxPoints || 100;

  // AI Feedback Generator
  const handleAiSuggestFeedback = async () => {
    if (!points) {
      alert('Please enter a score first to calibrate the feedback.');
      return;
    }
    setSuggestingFeedback(true);
    try {
      const scoreNum = Number(points);
      const isHigh = scoreNum >= maxScore * 0.85;
      const isMid = scoreNum >= maxScore * 0.7;

      const tone = isHigh
        ? 'Commendation on conceptual depth and rigorous analysis.'
        : isMid
        ? 'Constructive reinforcement on problem methodology and unit checks.'
        : 'Supportive guidance on foundational theory and step-by-step revision.';

      setFeedback(
        `Great effort on this submission, ${currentStudent.firstName}! ${tone} Keep up the focused momentum as we transition into the next topic.`
      );
    } finally {
      setSuggestingFeedback(false);
    }
  };

  // Save grade & advance to next
  const handleSaveGrade = async (advanceNext = true) => {
    if (!currentStudent || !selectedAssignmentId) return;
    setSaving(true);
    try {
      await ApiClient.post(
        `/assignments/${selectedAssignmentId}/submissions/${currentStudent.studentId}/grade`,
        {
          pointsAwarded: Number(points),
          feedback,
          submissionId: currentStudent.submissionId,
        }
      );

      // Update local state
      const updatedStudents = [...data.students];
      updatedStudents[selectedStudentIndex] = {
        ...currentStudent,
        status: 'GRADED',
        grade: Number(points),
        feedback,
      };
      setData({ ...data, students: updatedStudents });

      if (advanceNext && selectedStudentIndex < data.students.length - 1) {
        handleSelectStudent(selectedStudentIndex + 1);
      }
    } catch (err: any) {
      alert(`Grading failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header with Assignment Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Side-by-Side Grading Studio
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Rapid submission evaluation with AI-assisted feedback and rubric scoring
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            EVALUATING:
          </label>
          <select
            className="form-select"
            style={{ width: '320px' }}
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.classGroup?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.5rem',
          height: 'calc(100vh - 200px)',
        }}
      >
        {/* Left Pane: Student Roster List */}
        <div
          className="card"
          style={{
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.25rem 0.5rem 0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            Class Roster ({data?.students?.length || 0} Students)
          </div>

          {data?.students?.map((s: any, idx: number) => {
            const isSelected = idx === selectedStudentIndex;
            return (
              <div
                key={s.studentId}
                onClick={() => handleSelectStudent(idx)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary-border)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={s.avatarUrl}
                    alt={s.firstName}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {s.firstName} {s.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Roll #{s.rollNumber}
                    </div>
                  </div>
                </div>

                <div>
                  {s.status === 'GRADED' ? (
                    <span className="badge badge-success">
                      {s.grade}/{maxScore}
                    </span>
                  ) : s.status === 'SUBMITTED' ? (
                    <span className="badge badge-warning">Submitted</span>
                  ) : (
                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Pane: Student Submission & Grading Form */}
        {currentStudent && (
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
              overflowY: 'auto',
            }}
          >
            {/* Student Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={currentStudent.avatarUrl}
                  alt={currentStudent.firstName}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)',
                  }}
                />
                <div>
                  <h2 style={{ fontSize: '1.3rem' }}>
                    {currentStudent.firstName} {currentStudent.lastName}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Submission Status:{' '}
                    <strong>{currentStudent.status}</strong> • Roll #{currentStudent.rollNumber}
                  </div>
                </div>
              </div>

              {currentStudent.attachmentUrl && (
                <a
                  href={currentStudent.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} />
                  View File Attachment
                </a>
              )}
            </div>

            {/* Submission Content */}
            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                Student Work / Submission Body
              </div>
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  minHeight: '140px',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                }}
              >
                {currentStudent.content ||
                  'No written answer submitted online. (Physical/oral submission evaluated in class).'}
              </div>
            </div>

            {/* Grading Inputs */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="grid-2" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">
                    Points Awarded (out of {maxScore} pts)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ fontSize: '1.2rem', fontWeight: 800, width: '120px' }}
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      placeholder="0"
                      max={maxScore}
                      min={0}
                    />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      / {maxScore}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-ai btn-sm"
                    onClick={handleAiSuggestFeedback}
                    disabled={suggestingFeedback}
                  >
                    <Sparkles size={14} />
                    {suggestingFeedback ? 'Synthesizing...' : 'AI Suggest Feedback'}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Teacher Feedback & Learning Next Steps</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive, encouraging insights to guide the student..."
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleSaveGrade(false)}
                  disabled={saving || !points}
                >
                  <Save size={16} />
                  Save Only
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSaveGrade(true)}
                  disabled={saving || !points}
                >
                  <span>Save & Next Student</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
