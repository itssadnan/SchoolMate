import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Modal } from '../components/Modal';
import { NavView } from '../components/Sidebar';

interface AssignmentsProps {
  onNavigate: (view: NavView) => void;
  onSelectAssignmentForGrading?: (assignmentId: string) => void;
}

export const Assignments: React.FC<AssignmentsProps> = ({
  onNavigate,
  onSelectAssignmentForGrading,
}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [classGroupId, setClassGroupId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');
  const [category, setCategory] = useState('HOMEWORK');
  const [rubric, setRubric] = useState<any[] | null>(null);
  const [generatingRubric, setGeneratingRubric] = useState(false);

  const fetchAssignments = async () => {
    try {
      const [assignRes, classRes] = await Promise.all([
        ApiClient.get('/assignments'),
        ApiClient.get('/classes'),
      ]);
      setAssignments(assignRes);
      setClasses(classRes);
      if (classRes.length > 0) {
        setClassGroupId(classRes[0].id);
        if (classRes[0].subjects?.length > 0) {
          setSubjectId(classRes[0].subjects[0].subject.id);
        }
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleGenerateAiRubric = async () => {
    if (!title) {
      alert('Please enter an assignment title first.');
      return;
    }
    setGeneratingRubric(true);
    try {
      const selectedClass = classes.find((c) => c.id === classGroupId);
      const subjectName = selectedClass?.subjects?.[0]?.subject?.name || 'Physics';

      const res = await ApiClient.post('/ai/rubric', {
        title,
        subject: subjectName,
        maxPoints: Number(maxPoints),
      });

      setRubric(Array.isArray(res.rubric) ? res.rubric : []);
    } catch (err: any) {
      alert(`AI Rubric generation error: ${err.message}`);
    } finally {
      setGeneratingRubric(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/assignments', {
        classGroupId,
        subjectId,
        title,
        description,
        dueAt: dueAt || new Date(Date.now() + 5 * 86400000).toISOString(),
        maxPoints: Number(maxPoints),
        category,
        rubric,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setRubric(null);
      fetchAssignments();
    } catch (err: any) {
      alert(`Failed to create assignment: ${err.message}`);
    }
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Assignments & Coursework Hub
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Curriculum tasks, rubric evaluation, and student submission tracking
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Create New Assignment
        </button>
      </div>

      {/* Assignment List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assignments.map((a) => {
          const isOverdue = new Date(a.dueAt) < new Date();
          return (
            <div key={a.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-primary">{a.classGroup?.name}</span>
                  <span className="badge badge-info">{a.subject?.name}</span>
                  <span
                    className="badge"
                    style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                  >
                    {a.category}
                  </span>
                  {a.rubric && (
                    <span className="badge badge-success">Rubric Attached</span>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Due:{' '}
                  <strong style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-main)' }}>
                    {new Date(a.dueAt).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{a.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {a.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.825rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Max Score:</span>{' '}
                    <strong>{a.maxPoints} pts</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Evaluated:</span>{' '}
                    <strong style={{ color: 'var(--success)' }}>
                      {a.gradedCount} / {a.totalSubmissions}
                    </strong>
                  </div>
                  {a.pendingGrading > 0 && (
                    <div>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
                        ⚡ {a.pendingGrading} awaiting review
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (onSelectAssignmentForGrading) {
                      onSelectAssignmentForGrading(a.id);
                    }
                    onNavigate('grading');
                  }}
                >
                  <GraduationCap size={16} color="var(--primary)" />
                  Open in Grading Studio
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Assignment / Coursework"
      >
        <form onSubmit={handleCreateAssignment}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Class</label>
              <select
                className="form-select"
                value={classGroupId}
                onChange={(e) => setClassGroupId(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="HOMEWORK">Homework / Practice</option>
                <option value="PROJECT">Project / Lab Work</option>
                <option value="QUIZ">Weekly Quiz</option>
                <option value="EXAM">Term Exam</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Dynamics & Friction Coefficients Lab Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Prompt</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detailed guidelines, required problem numbers, or submission criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Due Date & Time</label>
              <input
                type="date"
                className="form-input"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Points</label>
              <input
                type="number"
                className="form-input"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                required
              />
            </div>
          </div>

          {/* AI Rubric Generator Section */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#6d28d9', fontSize: '0.85rem' }}>
                <Sparkles size={16} />
                <span>AI 4-Tier Rubric Builder</span>
              </div>
              <button
                type="button"
                className="btn btn-ai btn-sm"
                onClick={handleGenerateAiRubric}
                disabled={generatingRubric}
              >
                {generatingRubric ? 'Drafting Rubric...' : 'Generate Rubric'}
              </button>
            </div>

            {rubric && rubric.length > 0 ? (
              <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
                ✓ Generated {rubric.length} assessment criteria (
                {rubric.map((r: any) => r.criterion).join(', ')})
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Click 'Generate Rubric' to automatically attach 4-tier evaluation standards to this assignment.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
