import React, { useState } from 'react';
import { GraduationCap, School, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth, School as SchoolType } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { schools, login } = useAuth();
  const [selectedSchoolCode, setSelectedSchoolCode] = useState('OAKRIDGE');
  const [email, setEmail] = useState('sarah.jenkins@oakridge.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(selectedSchoolCode, email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (schoolCode: string, demoEmail: string) => {
    setSelectedSchoolCode(schoolCode);
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);
    try {
      await login(schoolCode, demoEmail, 'password123');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
              marginBottom: '1rem',
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>SchoolMate</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Multi-Tenant School Management & Learning Platform
          </p>
        </div>

        {/* 1-Click Multi-Tenant Demo Switcher */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              marginBottom: '0.6rem',
            }}
          >
            <Sparkles size={14} />
            <span>Instant Demo Logins (Multi-Tenant)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('OAKRIDGE', 'sarah.jenkins@oakridge.edu')}
              style={{
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderLeft: '4px solid #1e3a8a',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                  👨‍🏫 Teacher: Dr. Sarah Jenkins
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Oakridge Academy • Physics Faculty & Homeroom
                </div>
              </div>
              <ArrowRight size={14} color="#1e3a8a" />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('OAKRIDGE', 'leo.vance@student.oakridge.edu')}
              style={{
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderLeft: '4px solid #065f46',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                  🎒 Student: Leo Vance (Grade 9-A)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Submit homework, view grades, Parent Zone PIN lock
                </div>
              </div>
              <ArrowRight size={14} color="#065f46" />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('OAKRIDGE', 'david.vance@parent.oakridge.edu')}
              style={{
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderLeft: '4px solid #4338ca',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                  👨‍👩‍👧 Parent: David Vance
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Child attendance, report cards, confidential teacher chat
                </div>
              </div>
              <ArrowRight size={14} color="#4338ca" />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('STJUDE', 'robert.vance@stjude.edu')}
              style={{
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderLeft: '4px solid #0f766e',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                  🏫 St. Jude High School: Mr. Robert Vance
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Separate institution tenant • English Literature
                </div>
              </div>
              <ArrowRight size={14} color="#0f766e" />
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">School / Tenant Code</label>
            <select
              className="form-select"
              value={selectedSchoolCode}
              onChange={(e) => setSelectedSchoolCode(e.target.value)}
            >
              {schools.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Staff / Teacher Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>Tenant Data Isolation & RBAC Enforced</span>
        </div>
      </div>
    </div>
  );
};
