import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  FileText,
  Sparkles,
  Send,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Bell,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

export const StudentPortal: React.FC = () => {
  const { user, school } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Homework submission state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchStudentDashboard = async () => {
    try {
      const res = await ApiClient.get('/mobile/student/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboard();
  }, [school]);

  // Handle student submitting homework
  const handleOpenSubmit = (assign: any) => {
    setSelectedAssign(assign);
    const existing = assign.submissions?.[0];
    setSubmissionContent(existing?.content || '');
    setSubmitSuccess(false);
    setSubmitModalOpen(true);
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssign) return;
    setSubmitting(true);
    try {
      await ApiClient.post(`/student/assignments/${selectedAssign.id}/submit`, {
        content: submissionContent,
      });
      setSubmitSuccess(true);
      await fetchStudentDashboard();
      setTimeout(() => {
        setSubmitModalOpen(false);
        setSubmitSuccess(false);
      }, 1200);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading Student Workspace...</p>
      </div>
    );
  }

  const attendanceRate = data?.attendanceRate ?? 100;
  const gradeAverage = data?.gradeAverage ?? 94;
  const merits = data?.merits ?? 5;
  const assignments = data?.assignments || [];
  const grades = data?.grades || [];
  const timetable = data?.timetable || [];
  const announcements = data?.announcements || [];

  return (
    <div>
      {/* Student Welcome Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            STUDENT ACADEMIC WORKSPACE • {school?.name}
          </div>
          <h1 style={{ fontSize: '1.75rem', marginTop: '0.2rem', fontWeight: 800 }}>
            Welcome back, {user?.firstName}! 🎒
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Class: <strong>{data?.class || 'Grade 9-A'}</strong> • Roll Number: <strong>#{data?.rollNumber || '01'}</strong> • Academic Year 2026-2027
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-success" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            <UserCheck size={14} /> Enrolled Student
          </span>
        </div>
      </div>

      {/* Academic Highlights Cards */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ATTENDANCE RECORD
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#065f46', marginTop: '0.25rem' }}>
            {attendanceRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {data?.attendanceRecords?.length ? `${data.attendanceRecords.length} sessions logged` : 'Consistent morning presence'}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ACADEMIC AVERAGE
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {gradeAverage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {gradeAverage >= 90 ? 'Grade A+ (High Distinction)' : gradeAverage >= 80 ? 'Grade A (Proficient)' : 'Grade B'}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            POSITIVE CONDUCT MERITS
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#4338ca', marginTop: '0.25rem' }}>
            +{merits} pts
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Recognized for curiosity & initiative
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ASSIGNED COURSEWORK
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {assignments.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Active tasks in current term
          </div>
        </div>
      </div>

      {/* Main Grid: Assignments Hub & Evaluated Grades */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Coursework & Homework Hub */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--primary)" />
                My Coursework & Homework
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Review criteria and submit work directly to your teacher
              </div>
            </div>
            <span className="badge" style={{ backgroundColor: '#eff6ff', color: 'var(--primary)' }}>
              {assignments.length} Tasks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {assignments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active assignments assigned for this cohort yet.
              </div>
            ) : (
              assignments.map((a: any) => {
                const submission = a.submissions?.[0];
                const isGraded = submission?.status === 'GRADED';
                const isSubmitted = submission?.status === 'SUBMITTED';

                return (
                  <div
                    key={a.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-info">{a.subject?.name || 'Academic'}</span>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                          {a.category || 'Assignment'}
                        </span>
                        {isGraded ? (
                          <span className="badge badge-success">
                            ✓ Graded
                          </span>
                        ) : isSubmitted ? (
                          <span className="badge badge-warning">
                            Submitted • Under Review
                          </span>
                        ) : (
                          <span className="badge badge-danger">Due Soon</span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.2rem 0' }}>{a.title}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Due: <strong>{new Date(a.dueAt).toLocaleDateString()}</strong> • Max: {a.maxPoints} pts
                      </div>
                    </div>

                    <div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenSubmit(a)}
                        style={{ fontWeight: 600 }}
                      >
                        {isSubmitted || isGraded ? 'View Submission' : 'Turn In Work'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Evaluated Grades & Teacher Remarks */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--primary)" />
                Evaluated Grades & Teacher Feedback
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Constructive remarks and criterion breakdown
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {grades.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Award size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                <div>No evaluated assessments yet. Complete assignments to receive grades!</div>
              </div>
            ) : (
              grades.map((g: any) => {
                const maxPoints = g.assignment?.maxPoints || 100;
                const percentage = Math.round((g.pointsAwarded / maxPoints) * 100);
                return (
                  <div
                    key={g.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="badge badge-success">
                        Score: {g.pointsAwarded} / {maxPoints} pts ({percentage}%)
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(g.gradedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>
                      {g.assignment?.title || 'Assignment Evaluation'}
                    </h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Subject: {g.assignment?.subject?.name || 'Core Curriculum'}
                    </div>

                    {g.feedback && (
                      <p
                        style={{
                          fontSize: '0.825rem',
                          color: '#334155',
                          backgroundColor: '#f8fafc',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-xs)',
                          borderLeft: '3px solid var(--primary)',
                          fontStyle: 'italic',
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        "{g.feedback}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Daily Timetable & Campus Bulletins */}
      <div className="grid-2">
        {/* Class Timetable */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" />
              Weekly Class Schedule ({data?.class || 'Grade 9-A'})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {timetable.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No schedule slots found.</p>
            ) : (
              timetable.slice(0, 5).map((slot: any) => (
                <div
                  key={slot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        padding: '0.3rem 0.6rem',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{slot.subject?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {slot.room} • {slot.teacher ? `Dr. ${slot.teacher.lastName}` : 'Faculty Instructor'}
                      </div>
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: '#eff6ff', color: 'var(--primary)', fontSize: '0.7rem' }}>
                    {slot.dayOfWeek}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Campus Notices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--primary)" />
              Campus Bulletins & Announcements
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {announcements.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No new school notices today.</p>
            ) : (
              announcements.map((notice: any) => (
                <div
                  key={notice.id}
                  style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="badge badge-info">{notice.category || 'General'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>{notice.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {notice.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Homework Submission Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Turn In Coursework: ${selectedAssign?.title}`}
      >
        <form onSubmit={handleSubmitHomework}>
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Instructions:</strong> {selectedAssign?.description || 'Submit your completed assignment solutions or essay below.'}
          </div>

          {submitSuccess && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#ecfdf5',
                border: '1px solid #10b981',
                borderRadius: 'var(--radius-sm)',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} /> Coursework submitted successfully to your instructor!
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Your Solution / Submission Text / Link</label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="Type your experimental conclusions, mathematical formulas, or shared document link..."
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSubmitModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Turn In to Teacher'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
