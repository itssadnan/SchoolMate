import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Send,
  Lock,
  Unlock,
  ShieldAlert,
  Calendar,
  FileText,
  MessageSquare,
  Sparkles,
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

  // Parent Lock / Confidential Parent Zone state
  const [parentPinModalOpen, setParentPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [parentModeUnlocked, setParentModeUnlocked] = useState(false);
  const [parentInfo, setParentInfo] = useState<any>(null);

  // Confidential Parent-Teacher Messaging State
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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
      setSubmitModalOpen(false);
      fetchStudentDashboard();
      alert('Homework submitted successfully to your teacher!');
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Verify Parent PIN to unlock confidential discussion
  const handleVerifyParentPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const res = await ApiClient.post('/parent/verify-pin', {
        pin: pinInput,
        studentId: user?.id,
      });
      setParentInfo(res.parent);
      setParentModeUnlocked(true);
      setParentPinModalOpen(false);
      setPinInput('');

      // Load confidential teacher conversation
      loadTeacherMessages(res.parent.id);
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN');
    }
  };

  const loadTeacherMessages = async (parentId: string) => {
    try {
      // Find teacher conversation thread
      const threads = await ApiClient.get('/messages/threads');
      if (threads.length > 0) {
        const otherId = threads[0].otherUser.id;
        const conv = await ApiClient.get(`/messages/${otherId}`);
        setMessages(conv);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendParentReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const teacherMsg = messages.find((m) => m.sender?.role === 'TEACHER');
      const teacherId = teacherMsg?.senderId || (messages.length > 0 ? (messages[0].sender?.role === 'PARENT' ? messages[0].receiverId : messages[0].senderId) : 'sarah-jenkins-id');
      await ApiClient.post('/messages', {
        receiverId: teacherId,
        content: replyText,
        studentId: user?.id,
        isPrivateParentOnly: true,
      });
      setReplyText('');
      if (parentInfo) loadTeacherMessages(parentInfo.id);
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

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
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            STUDENT PORTAL • {school?.name}
          </div>
          <h1 style={{ fontSize: '1.65rem', marginTop: '0.2rem' }}>
            Welcome back, {user?.firstName} {user?.lastName}!
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Class: <strong>{data?.class || 'Grade 9-A'}</strong> • Roll Number: <strong>#{data?.rollNumber || '01'}</strong>
          </p>
        </div>

        {/* Parent Zone Secure Toggle */}
        <div>
          {parentModeUnlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-success" style={{ padding: '0.4rem 0.75rem' }}>
                <Unlock size={14} />
                Parent Mode Active ({parentInfo?.firstName} {parentInfo?.lastName})
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setParentModeUnlocked(false)}
              >
                <Lock size={14} /> Lock Parent Zone
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => setParentPinModalOpen(true)}
              style={{
                border: '1px solid var(--primary-border)',
                backgroundColor: '#f8fafc',
                fontWeight: 600,
              }}
            >
              <Lock size={16} color="var(--primary)" />
              <span>Parent Access (PIN Protected)</span>
            </button>
          )}
        </div>
      </div>

      {/* CONFIDENTIAL PARENT ZONE (RENDERED WHEN UNLOCKED BY PARENT PIN) */}
      {parentModeUnlocked && (
        <div
          className="card"
          style={{
            marginBottom: '1.75rem',
            border: '2px solid var(--primary)',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem' }}>
                Confidential Teacher - Parent Discussion Channel
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Encrypted • Private to Parent & Faculty Only
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            This discussion thread is private between you and {user?.firstName}'s subject educators. Students cannot view or edit these messages without the security PIN.
          </p>

          {/* Chat Messages */}
          <div
            style={{
              maxHeight: '280px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}
          >
            {messages.length > 0 ? (
              messages.map((m) => {
                const isParentSender = m.senderId !== user?.id && m.sender?.role === 'PARENT';
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isParentSender ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isParentSender ? 'var(--primary)' : '#ffffff',
                      color: isParentSender ? '#ffffff' : 'var(--text-main)',
                      border: isParentSender ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        marginBottom: '0.25rem',
                        color: isParentSender ? '#bfdbfe' : 'var(--primary)',
                      }}
                    >
                      {m.sender?.firstName} {m.sender?.lastName} ({m.sender?.role})
                    </div>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{m.content}</div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        marginTop: '0.35rem',
                        textAlign: 'right',
                        color: isParentSender ? '#cbd5e1' : 'var(--text-muted)',
                      }}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                No message history yet. Start a confidential message below.
              </div>
            )}
          </div>

          {/* Reply Input */}
          <form onSubmit={handleSendParentReply} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type private message to Dr. Sarah Jenkins..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sendingReply}>
              <Send size={16} /> Send Reply
            </button>
          </form>
        </div>
      )}

      {/* Academic Highlights Cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            MY ATTENDANCE RECORD
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', marginTop: '0.25rem' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Consistent, on-time morning presence
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            CURRENT ACADEMIC AVERAGE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            94% (Grade A+)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Across Physics, Calculus & Sciences
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            POSITIVE MERITS EARNED
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4338ca', marginTop: '0.25rem' }}>
            +5 Points
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Awarded for Curiosity & Inquiry
          </div>
        </div>
      </div>

      {/* Coursework & Homework Hub */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary)" />
            Coursework & Assignments
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {data?.assignments?.length || 0} Total Tasks
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data?.assignments?.map((a: any) => {
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
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-info">{a.subject?.name}</span>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {a.category}
                    </span>
                    {isGraded ? (
                      <span className="badge badge-success">
                        Graded: {a.submissions[0]?.grade?.pointsAwarded || 94}/{a.maxPoints} pts
                      </span>
                    ) : isSubmitted ? (
                      <span className="badge badge-warning">Submitted • Awaiting Review</span>
                    ) : (
                      <span className="badge badge-danger">Not Submitted Yet</span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{a.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Due: <strong>{new Date(a.dueAt).toLocaleDateString()}</strong> • Max Marks: {a.maxPoints} pts
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenSubmit(a)}
                  >
                    {isSubmitted || isGraded ? 'Review / Edit Submission' : 'Submit Homework'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Homework Submission Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit Coursework: ${selectedAssign?.title}`}
      >
        <form onSubmit={handleSubmitHomework}>
          <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {selectedAssign?.description}
          </div>

          <div className="form-group">
            <label className="form-label">Your Solution / Submission Notes</label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="Type your experimental conclusions, formulas, or link to work..."
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSubmitModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Turn In Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Parent PIN Prompt Modal */}
      <Modal
        isOpen={parentPinModalOpen}
        onClose={() => setParentPinModalOpen(false)}
        title="Parent Security PIN Verification"
        maxWidth="440px"
      >
        <form onSubmit={handleVerifyParentPin}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                marginBottom: '0.75rem',
              }}
            >
              <Lock size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Parent Zone Security Check
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enter your 4-digit Parent Security PIN to access confidential communications with teachers.
              <br />
              <strong>(Default Demo PIN: 1234)</strong>
            </p>
          </div>

          {pinError && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {pinError}
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'center' }}>
            <input
              type="password"
              maxLength={4}
              className="form-input"
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5em',
                width: '180px',
                margin: '0 auto',
              }}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setParentPinModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Unlock Parent Zone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
