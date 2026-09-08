import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  BookOpen,
  Award,
  Send,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Clock,
  ExternalLink,
  Bell,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ParentPortal: React.FC = () => {
  const { user, school } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTeacherId, setActiveTeacherId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchParentData = async () => {
    try {
      const res = await ApiClient.get('/mobile/parent/children');
      const kids = res.children || [];
      setChildren(kids);
      setAnnouncements(res.announcements || []);

      if (kids.length > 0) {
        const firstKid = kids[0];
        setSelectedChild(firstKid);

        // Find primary teacher ID for the child
        const teacherFromTimetable = firstKid.timetable?.find((t: any) => t.teacher?.id)?.teacher?.id;
        if (teacherFromTimetable) {
          setActiveTeacherId(teacherFromTimetable);
        }
      }

      // Load confidential teacher messages
      await loadTeacherThreads();
    } catch (err) {
      console.error('Failed to load parent portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherThreads = async () => {
    try {
      const threads = await ApiClient.get('/messages/threads');
      if (threads.length > 0) {
        const targetTeacherId = threads[0].otherUser.id;
        setActiveTeacherId(targetTeacherId);
        const conv = await ApiClient.get(`/messages/${targetTeacherId}`);
        setMessages(conv || []);
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [school]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Resolve teacher recipient
    let recipientId = activeTeacherId;
    if (!recipientId && selectedChild?.timetable?.length > 0) {
      recipientId = selectedChild.timetable.find((t: any) => t.teacher?.id)?.teacher?.id;
    }

    if (!recipientId) {
      alert('Unable to identify class teacher for this student.');
      return;
    }

    setSending(true);
    try {
      await ApiClient.post('/messages', {
        receiverId: recipientId,
        content: replyText,
        studentId: selectedChild?.id,
        isPrivateParentOnly: true,
      });

      setReplyText('');
      // Reload conversation
      const conv = await ApiClient.get(`/messages/${recipientId}`);
      setMessages(conv || []);
    } catch (err: any) {
      alert(`Message delivery failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading Guardian Dashboard...</p>
      </div>
    );
  }

  const attendanceRate = selectedChild?.attendanceRate ?? 100;
  const recentGrades = selectedChild?.recentGrades || [];
  const upcomingAssignments = selectedChild?.upcomingAssignments || [];

  return (
    <div>
      {/* Header */}
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
            GUARDIAN & PARENT DASHBOARD • {school?.name}
          </div>
          <h1 style={{ fontSize: '1.75rem', marginTop: '0.2rem', fontWeight: 800 }}>
            Family Portal: {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Supervising Scholar: <strong>{selectedChild?.firstName} {selectedChild?.lastName}</strong> ({selectedChild?.class || 'Grade 9-A'})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {children.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Child:</span>
              <select
                className="form-select"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                value={selectedChild?.id}
                onChange={(e) => {
                  const kid = children.find((c) => c.id === e.target.value);
                  if (kid) setSelectedChild(kid);
                }}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.class})
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="badge badge-success" style={{ padding: '0.45rem 0.85rem' }}>
            <ShieldCheck size={14} /> Verified Guardian Access
          </span>
        </div>
      </div>

      {/* Child Metrics Snapshot */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {selectedChild?.firstName?.toUpperCase() || 'STUDENT'}'S ATTENDANCE RATE
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#065f46', marginTop: '0.25rem' }}>
            {attendanceRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Morning presence confirmed on campus
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ACADEMIC PERFORMANCE
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {recentGrades.length > 0 ? 'Grade A+ (Distinction)' : 'Active Term 1'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {recentGrades.length} graded coursework assessments
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            CLASS & HOMEROOM
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            {selectedChild?.class || 'Grade 9-A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Roll #{selectedChild?.rollNumber || '01'} • Room 302
          </div>
        </div>
      </div>

      {/* Main Grid: Discussion Room + Evaluated Work */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Confidential Teacher - Parent Discussion Room */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--primary)" />
                Direct Teacher Communication Channel
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Confidential 1-on-1 private messaging with {selectedChild?.firstName}'s educators
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: '260px',
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '0.85rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}
          >
            {messages.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                <MessageSquare size={28} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                <div>Start a confidential discussion with {selectedChild?.firstName}'s teacher below.</div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isMe ? 'var(--primary)' : '#ffffff',
                      color: isMe ? '#ffffff' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        marginBottom: '0.2rem',
                        color: isMe ? '#bfdbfe' : 'var(--primary)',
                      }}
                    >
                      {m.sender?.firstName} {m.sender?.lastName} ({m.sender?.role || 'Educator'})
                    </div>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{m.content}</div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        marginTop: '0.3rem',
                        textAlign: 'right',
                        color: isMe ? '#cbd5e1' : 'var(--text-muted)',
                      }}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder={`Send private message regarding ${selectedChild?.firstName || 'your student'}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Send size={15} /> {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Evaluated Coursework & Teacher Remarks */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--primary)" />
                Recent Evaluated Coursework
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Teacher grading marks & personalized commentary
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentGrades.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No completed evaluations recorded yet for this term.
              </div>
            ) : (
              recentGrades.map((g: any) => {
                const max = g.assignment?.maxPoints || 100;
                const pct = Math.round((g.pointsAwarded / max) * 100);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span className="badge badge-success">
                        Score: {g.pointsAwarded} / {max} pts ({pct}%)
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(g.gradedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>
                      {g.assignment?.title}
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

      {/* Lower Row: Upcoming Tasks & School Announcements */}
      <div className="grid-2">
        {/* Child's Upcoming Assignments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--primary)" />
              {selectedChild?.firstName}'s Active Homework & Deadlines
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {upcomingAssignments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending homework at this time.</p>
            ) : (
              upcomingAssignments.map((a: any) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{a.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Due: <strong>{new Date(a.dueAt).toLocaleDateString()}</strong> • {a.subject?.name}
                    </div>
                  </div>
                  <span className="badge" style={{ backgroundColor: '#eff6ff', color: 'var(--primary)', fontSize: '0.72rem' }}>
                    {a.maxPoints} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* School Circulars & Bulletins */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--primary)" />
              Official Institutional Circulars & Notices
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {announcements.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent announcements.</p>
            ) : (
              announcements.map((n: any) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span className="badge badge-info">{n.category || 'School Notice'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0.2rem 0' }}>{n.title}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
