import React, { useState } from 'react';
import { ChevronDown, School, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TopNavbar: React.FC = () => {
  const { user, school, schools, switchSchool, logout, login } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="topbar">
      {/* School Switcher Pill */}
      <div style={{ position: 'relative' }}>
        <button
          className="tenant-selector-pill"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span
            className="tenant-color-dot"
            style={{ backgroundColor: school?.accentColor || '#3b82f6' }}
          />
          <School size={16} color="var(--primary)" />
          <span>{school ? school.name : 'Select School'}</span>
          <span
            style={{
              fontSize: '0.7rem',
              background: '#e2e8f0',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-xs)',
              color: '#475569',
            }}
          >
            {school?.code}
          </span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-subtle)',
              padding: '0.5rem',
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                padding: '0.5rem 0.75rem 0.25rem',
                letterSpacing: '0.05em',
              }}
            >
              Switch Institution (Multi-Tenant Demo)
            </div>

            {schools.map((s) => {
              const isSelected = school?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setDropdownOpen(false);
                    switchSchool(s);
                  }}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: s.accentColor || '#3b82f6',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        }}
                      >
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Tenant Slug: <strong>{s.code}</strong>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="var(--primary)" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right side actions & User profile */}
      <div className="topbar-actions">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: '#f1f5f9',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#475569',
          }}
        >
          <span>🗓️ 2026-2027 • Term 1</span>
        </div>

        {/* Persona Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-btn"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            title="Click to Switch User Role (Teacher / Student / Parent)"
            style={{ cursor: 'pointer' }}
          >
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={user?.firstName}
              className="user-avatar"
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.role === 'TEACHER'
                  ? 'Faculty Educator ▾'
                  : user?.role === 'STUDENT'
                  ? 'Enrolled Student ▾'
                  : 'Guardian / Parent ▾'}
              </div>
            </div>
          </div>

          {roleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '0.5rem',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  padding: '0.4rem 0.6rem 0.2rem',
                }}
              >
                Switch Stakeholder View
              </div>

              <div
                onClick={() => {
                  setRoleDropdownOpen(false);
                  login('OAKRIDGE', 'sarah.jenkins@oakridge.edu', 'password123');
                }}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: user?.role === 'TEACHER' ? 700 : 500,
                  backgroundColor: user?.role === 'TEACHER' ? 'var(--primary-light)' : 'transparent',
                }}
              >
                👨‍🏫 Teacher: Dr. Sarah Jenkins
              </div>

              <div
                onClick={() => {
                  setRoleDropdownOpen(false);
                  login('OAKRIDGE', 'leo.vance@student.oakridge.edu', 'password123');
                }}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: user?.role === 'STUDENT' ? 700 : 500,
                  backgroundColor: user?.role === 'STUDENT' ? 'var(--primary-light)' : 'transparent',
                }}
              >
                🎒 Student: Leo Vance (Grade 9-A)
              </div>

              <div
                onClick={() => {
                  setRoleDropdownOpen(false);
                  login('OAKRIDGE', 'david.vance@parent.oakridge.edu', 'password123');
                }}
                style={{
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: user?.role === 'PARENT' ? 700 : 500,
                  backgroundColor: user?.role === 'PARENT' ? 'var(--primary-light)' : 'transparent',
                }}
              >
                👨‍👩‍👧 Parent: David Vance
              </div>
            </div>
          )}
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Sign Out"
          style={{ padding: '0.4rem 0.6rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
