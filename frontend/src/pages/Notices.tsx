import React, { useState, useEffect } from 'react';
import { Bell, Plus, AlertCircle, Send, Users, ShieldAlert } from 'lucide-react';
import { ApiClient } from '../services/api';
import { Modal } from '../components/Modal';

export const Notices: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [targetClassId, setTargetClassId] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const fetchNotices = async () => {
    try {
      const [noticeRes, classRes] = await Promise.all([
        ApiClient.get('/notices'),
        ApiClient.get('/classes'),
      ]);
      setNotices(noticeRes);
      setClasses(classRes);
      if (classRes.length > 0) setTargetClassId(classRes[0].id);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/notices', {
        title,
        content,
        targetAudience,
        targetClassId: targetAudience === 'CLASS' ? targetClassId : null,
        isUrgent,
      });

      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setIsUrgent(false);
      fetchNotices();
    } catch (err: any) {
      alert(`Failed to broadcast notice: ${err.message}`);
    }
  };

  return (
    <div>
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
            Announcements & Notice Board
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Broadcast targeted communications to parents, students, and institutional faculty
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Broadcast Announcement
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notices.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              borderLeft: n.isUrgent ? '4px solid var(--danger)' : '4px solid var(--primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {n.isUrgent && (
                  <span className="badge badge-danger">
                    <AlertCircle size={14} /> URGENT NOTICE
                  </span>
                )}
                <span className="badge badge-primary">
                  Audience: {n.targetAudience} {n.targetClass ? `(${n.targetClass.name})` : ''}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(n.createdAt).toLocaleDateString()} at{' '}
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{n.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>{n.content}</p>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Posted by: <strong>{n.author?.firstName} {n.author?.lastName}</strong> ({n.author?.role})
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast New Institutional Announcement"
      >
        <form onSubmit={handleCreateNotice}>
          <div className="form-group">
            <label className="form-label">Notice Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Science Fair Safety Protocols"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-select"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="ALL">Entire School Community (Parents & Staff)</option>
                <option value="TEACHERS">Faculty & Staff Only</option>
                <option value="CLASS">Specific Class Group</option>
              </select>
            </div>

            {targetAudience === 'CLASS' && (
              <div className="form-group">
                <label className="form-label">Select Target Class</label>
                <select
                  className="form-select"
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Content</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Write the full communication details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="urgentCheck"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
            />
            <label htmlFor="urgentCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)', cursor: 'pointer' }}>
              Mark as High Priority / Urgent Alert (Sends immediate push alert)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Broadcast Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
