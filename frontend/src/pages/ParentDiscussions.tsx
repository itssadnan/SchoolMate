import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ShieldCheck, User } from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ParentDiscussions: React.FC = () => {
  const { user, school } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      const list = await ApiClient.get('/messages/threads');
      setThreads(list);
      if (list.length > 0) {
        setSelectedThread(list[0]);
        loadConversation(list[0].otherUser.id);
      }
    } catch (err) {
      console.error('Failed to load message threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (otherUserId: string) => {
    try {
      const conv = await ApiClient.get(`/messages/${otherUserId}`);
      setMessages(conv);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [school]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;
    setSending(true);
    try {
      await ApiClient.post('/messages', {
        receiverId: selectedThread.otherUser.id,
        content: replyText,
        isPrivateParentOnly: true,
      });
      setReplyText('');
      loadConversation(selectedThread.otherUser.id);
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Confidential Parent Communications
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Private discussion channel with verified parents and guardians
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '1.5rem',
          height: 'calc(100vh - 200px)',
        }}
      >
        {/* Left: Parent Threads */}
        <div className="card" style={{ padding: '0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.5rem', textTransform: 'uppercase' }}>
            Parent Conversations
          </div>

          {threads.map((t) => {
            const isSelected = selectedThread?.otherUser?.id === t.otherUser.id;
            return (
              <div
                key={t.otherUser.id}
                onClick={() => {
                  setSelectedThread(t);
                  loadConversation(t.otherUser.id);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary-border)' : 'transparent',
                  marginBottom: '0.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {t.otherUser.firstName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {t.otherUser.firstName} {t.otherUser.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t.otherUser.role} (Leo Vance's Father)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Message Stream */}
        {selectedThread && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.85rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>
                  {selectedThread.otherUser.firstName} {selectedThread.otherUser.lastName}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Guardian of Leo Vance (Grade 9-A)
                </div>
              </div>
              <span className="badge badge-success">
                <ShieldCheck size={14} /> Confidential
              </span>
            </div>

            <div
              style={{
                flex: 1,
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
                      maxWidth: '75%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isMe ? 'var(--primary)' : '#ffffff',
                      color: isMe ? '#ffffff' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem', color: isMe ? '#bfdbfe' : 'var(--primary)' }}>
                      {m.sender?.firstName} {m.sender?.lastName}
                    </div>
                    <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{m.content}</div>
                    <div style={{ fontSize: '0.68rem', marginTop: '0.25rem', textAlign: 'right', color: isMe ? '#cbd5e1' : 'var(--text-muted)' }}>
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
                placeholder="Write reply to parent..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={sending}>
                <Send size={15} /> Send Reply
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
