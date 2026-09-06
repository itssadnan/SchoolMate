import React, { useState } from 'react';
import {
  GraduationCap,
  School,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Lock,
  Mail,
  Building,
  UserCheck,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth, AuthModalMode } from '../context/AuthContext';

interface LoginProps {
  isModal?: boolean;
  initialMode?: AuthModalMode;
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({ isModal = false, initialMode = 'login', onClose }) => {
  const { login, registerSchool, registerTeacher, schools, authModalMode } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthModalMode>(authModalMode || initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('sarah.jenkins@oakridge.edu');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginSchoolCode, setLoginSchoolCode] = useState('');
  const [showSchoolCodeInput, setShowSchoolCodeInput] = useState(false);

  // Teacher registration state
  const [tSchoolCode, setTSchoolCode] = useState('OAKRIDGE');
  const [tFirstName, setTFirstName] = useState('');
  const [tLastName, setTLastName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPassword, setTPassword] = useState('');
  const [tPhone, setTPhone] = useState('');

  // School registration state
  const [sName, setSName] = useState('');
  const [sCode, setSCode] = useState('');
  const [sAdminFirst, setSAdminFirst] = useState('');
  const [sAdminLast, setSAdminLast] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sAddress, setSAddress] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword, loginSchoolCode.trim() || undefined);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Teacher Registration
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerTeacher({
        schoolCode: tSchoolCode.trim(),
        firstName: tFirstName.trim(),
        lastName: tLastName.trim(),
        email: tEmail.trim(),
        password: tPassword,
        phone: tPhone.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Teacher registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle School Registration
  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerSchool({
        name: sName.trim(),
        code: sCode.trim(),
        adminFirstName: sAdminFirst.trim(),
        adminLastName: sAdminLast.trim(),
        email: sEmail.trim(),
        password: sPassword,
        phone: sPhone.trim() || undefined,
        address: sAddress.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'School registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Handlers
  const handleQuickDemo = async (email: string, schoolCode?: string) => {
    setLoginEmail(email);
    setLoginPassword('password123');
    if (schoolCode) setLoginSchoolCode(schoolCode);
    setError(null);
    setLoading(true);
    try {
      await login(email, 'password123', schoolCode);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div
      style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        padding: '2.25rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        color: '#1e293b',
      }}
    >
      {/* Close button if rendered as modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '6px',
          }}
        >
          <X size={20} />
        </button>
      )}

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
            marginBottom: '0.75rem',
          }}
        >
          <GraduationCap size={28} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          SchoolMate
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Multi-Tenant Institutional SIS & LMS Platform
        </p>
      </div>

      {/* Tab Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.35rem',
          backgroundColor: '#f1f5f9',
          padding: '0.3rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setError(null); }}
          style={{
            backgroundColor: activeTab === 'login' ? '#ffffff' : 'transparent',
            color: activeTab === 'login' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '7px',
            padding: '0.55rem 0.4rem',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'login' ? 700 : 500,
            cursor: 'pointer',
            boxShadow: activeTab === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register-teacher'); setError(null); }}
          style={{
            backgroundColor: activeTab === 'register-teacher' ? '#ffffff' : 'transparent',
            color: activeTab === 'register-teacher' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '7px',
            padding: '0.55rem 0.4rem',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'register-teacher' ? 700 : 500,
            cursor: 'pointer',
            boxShadow: activeTab === 'register-teacher' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          Teacher Sign Up
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register-school'); setError(null); }}
          style={{
            backgroundColor: activeTab === 'register-school' ? '#ffffff' : 'transparent',
            color: activeTab === 'register-school' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '7px',
            padding: '0.55rem 0.4rem',
            fontSize: '0.82rem',
            fontWeight: activeTab === 'register-school' ? 700 : 500,
            cursor: 'pointer',
            boxShadow: activeTab === 'register-school' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          Register School
        </button>
      </div>

      {/* Error / Success Notifications */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: SIGN IN (Email + Password, auto-detect school) */}
      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your.email@school.edu"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
              Your school institution will be automatically identified from your email.
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Optional School Code Accordion */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowSchoolCodeInput(!showSchoolCodeInput)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {showSchoolCodeInput ? '− Hide School Code option' : '+ Specify School Code manually (optional)'}
            </button>

            {showSchoolCodeInput && (
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={loginSchoolCode}
                  onChange={(e) => setLoginSchoolCode(e.target.value)}
                  placeholder="e.g. OAKRIDGE or STJUDE"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    textTransform: 'uppercase',
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight size={16} />}
          </button>

          {/* 1-Click Demo Personas */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', textAlign: 'center' }}>
              1-Click Instant Evaluation Logins
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.jenkins@oakridge.edu', 'OAKRIDGE')}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                👨‍🏫 <strong>Teacher:</strong> Dr. Sarah
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('leo.vance@student.oakridge.edu', 'OAKRIDGE')}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🎒 <strong>Student:</strong> Leo Vance
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('david.vance@parent.oakridge.edu', 'OAKRIDGE')}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                👨‍👩‍👧 <strong>Parent:</strong> David Vance
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('robert.vance@stjude.edu', 'STJUDE')}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🏫 <strong>Tenant 2:</strong> St. Jude
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: TEACHER SIGN UP */}
      {activeTab === 'register-teacher' && (
        <form onSubmit={handleTeacherSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Select School Institution
            </label>
            <select
              value={tSchoolCode}
              onChange={(e) => setTSchoolCode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            >
              {schools.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                First Name
              </label>
              <input
                type="text"
                required
                value={tFirstName}
                onChange={(e) => setTFirstName(e.target.value)}
                placeholder="e.g. Eleanor"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Last Name
              </label>
              <input
                type="text"
                required
                value={tLastName}
                onChange={(e) => setTLastName(e.target.value)}
                placeholder="e.g. Vance"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Academic Email
            </label>
            <input
              type="email"
              required
              value={tEmail}
              onChange={(e) => setTEmail(e.target.value)}
              placeholder="e.g. eleanor.vance@oakridge.edu"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Create Password
            </label>
            <input
              type="password"
              required
              value={tPassword}
              onChange={(e) => setTPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={tPhone}
              onChange={(e) => setTPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Creating Faculty Account...' : 'Complete Teacher Sign Up'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      )}

      {/* TAB 3: REGISTER A NEW SCHOOL */}
      {activeTab === 'register-school' && (
        <form onSubmit={handleSchoolSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                School Institution Name
              </label>
              <input
                type="text"
                required
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                placeholder="e.g. Oxford Cambridge Academy"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                School Code
              </label>
              <input
                type="text"
                required
                value={sCode}
                onChange={(e) => setSCode(e.target.value.toUpperCase())}
                placeholder="OXFORD"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box', textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Headmaster / Admin First
              </label>
              <input
                type="text"
                required
                value={sAdminFirst}
                onChange={(e) => setSAdminFirst(e.target.value)}
                placeholder="First name"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Admin Last Name
              </label>
              <input
                type="text"
                required
                value={sAdminLast}
                onChange={(e) => setSAdminLast(e.target.value)}
                placeholder="Last name"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={sEmail}
              onChange={(e) => setSEmail(e.target.value)}
              placeholder="admin@oxfordcambridge.edu"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Admin Account Password
            </label>
            <input
              type="password"
              required
              value={sPassword}
              onChange={(e) => setSPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Institutional Phone
              </label>
              <input
                type="tel"
                value={sPhone}
                onChange={(e) => setSPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Campus Address
              </label>
              <input
                type="text"
                value={sAddress}
                onChange={(e) => setSAddress(e.target.value)}
                placeholder="City, Country"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Initializing School Tenant...' : 'Onboard & Register School'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        {content}
      </div>
    );
  }

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
      {content}
    </div>
  );
};
