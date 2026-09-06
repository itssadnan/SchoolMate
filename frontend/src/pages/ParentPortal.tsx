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
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ParentPortal: React.FC = () => {
  const { user, school } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchParentData = async () => {
    try {
      const res = await ApiClient.get('/mobile/parent/children');
      setChildren(res.children || []);
      if (res.children?.length > 0) {
        setSelectedChild(res.children[0]);
      }

      // Load confidential teacher messages
      const threads = await ApiClient.get('/messages/threads');
      if (threads.length > 0) {
        const otherId = threads[0].otherUser.id;
        const conv = await ApiClient.get(`/messages/${otherId}`);
        setMessages(conv);
      }
    } catch (err) {
      console.error('Failed to load parent portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [school]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const teacherId =
        messages[0]?.senderId === user?.id
          ? messages[0]?.receiverId
          : messages[0]?.senderId;

      await ApiClient.post('/messages', {
        receiverId: teacherId || 'sarah-jenkins-id',
        content: replyText,
        studentId: selectedChild?.id,
        isPrivateParentOnly: true,
      });

      setReplyText('');
      // Refresh messages
      const threads = await ApiClient.get('/messages/threads');
      if (threads.length > 0) {
        const otherId = threads[0].otherUser.id;
        const conv = await ApiClient.get(`/messages/${otherId}`);
        setMessages(conv);
      }
    } catch (err: any) {
      alert(`Message delivery failed: ${err.message}`);
    } finally {
      setSending(false);
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
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PARENT & GUARDIAN PORTAL • {school?.name}
          </div>
          <h1 style={{ fontSize: '1.65rem', marginTop: '0.2rem' }}>
            Guardian Dashboard: {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Supervising: <strong>{selectedChild?.firstName} {selectedChild?.lastName}</strong> ({selectedChild?.class})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-success">
            <ShieldCheck size={14} /> Verified Guardian Access
          </span>
        </div>
      </div>

      {/* Child Metrics Snapshot */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {selectedChild?.firstName.toUpperCase()}'S ATTENDANCE RATE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', marginTop: '0.25rem' }}>
            {selectedChild?.attendanceRate || 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Marked present this morning at 08:25 AM
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            ACADEMIC PROGRESS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            Grade A+ (94%)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Physics Lab: 94/100 pts • Calculus: 48/50 pts
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            HOMEROOM TEACHER
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            Dr. Sarah Jenkins
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Department of Physics • Room 302
          </div>
        </div>
      </div>

      {/* Main Grid: Discussion Room + Recent Work */}
      <div className="grid-2">
        {/* Confidential Teacher - Parent Discussion Room */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--primary)" />
                Direct Teacher Communication Channel
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Confidential 1-on-1 thread with Dr. Sarah Jenkins
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: '260px',
              maxHeight: '360px',
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
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
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
                    {m.sender?.firstName} {m.sender?.lastName} ({m.sender?.role})
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
            })}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Inquire about Leo's coursework or schedule..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Send size={15} /> Send
            </button>
          </form>
        </div>

        {/* Academic Evaluations & Teacher Remarks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Evaluated Coursework</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="badge badge-success">Score: 94 / 100 pts (Grade A+)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Graded Yesterday</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                Newton's Second Law & Friction Dynamics Analysis
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                "Outstanding experimental analysis, Leo. Excellent breakdown of dynamic vs static friction!"
                <br />
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>— Dr. Sarah Jenkins</span>
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="badge badge-success">Score: 48 / 50 pts (Grade A+)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Graded 3 days ago</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                Thermodynamics & Heat Transfer Problem Set
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                "Well reasoned solutions with clear step-by-step units."
                <br />
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>— Dr. Sarah Jenkins</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
