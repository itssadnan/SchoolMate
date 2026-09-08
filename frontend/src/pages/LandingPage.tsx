import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  BarChart3,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronRight,
  School,
  FileSpreadsheet,
  Zap,
  Check,
  Calendar,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { openAuthModal, login } = useAuth();
  const [activePortalTab, setActivePortalTab] = useState<'teacher' | 'student' | 'parent' | 'admin'>('teacher');
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  const handleQuickLogin = async (email: string, roleName: string) => {
    setLoggingInRole(roleName);
    try {
      await login(email, 'password123');
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoggingInRole(null);
    }
  };

  const portalDetails = {
    teacher: {
      title: 'Faculty Command Center & Instructional Studio',
      badge: 'For Educators & Academic Leaders',
      description:
        'A high-velocity instructional workspace equipped with live class period detection, 1-click attendance roll call, continuous assessment matrix gradebooks, and Canvas LMS-inspired speed grading.',
      features: [
        'Live Active Instruction Period Indicator with 1-click class roll call',
        'Interactive Matrix Gradebook with instant percentage & letter bands',
        'Speed Grading Studio with side-by-side submission inspection & AI feedback',
        'Evidence-based Pedagogical AI Studio (lesson plans, rubrics, interventions)',
      ],
      demoRole: 'Teacher',
      demoEmail: 'sarah.jenkins@oakridge.edu',
      demoName: 'Dr. Sarah Jenkins',
      tagline: 'Streamline 10+ weekly administrative hours into single-click workflows',
    },
    student: {
      title: 'Student Academic Workspace & Coursework Cockpit',
      badge: 'For Enrolled Students & Scholars',
      description:
        'An autonomous student cockpit enabling learners to track attendance rates, review evaluated coursework with teacher commentary, and turn in assignments with immediate digital receipts.',
      features: [
        'Interactive "Turn In Coursework" modal with rich text & link submission',
        'Continuous academic scorecard with teacher commentary & rubric scores',
        'Live attendance percentage & daily presence records',
        'Weekly class timetable with subject educators and room assignments',
      ],
      demoRole: 'Student',
      demoEmail: 'leo.vance@student.oakridge.edu',
      demoName: 'Leo Vance',
      tagline: 'Fostering academic ownership and transparent feedback loops',
    },
    parent: {
      title: 'Guardian Portal & Confidential Teacher Communications',
      badge: 'For Families & Guardians',
      description:
        'Bridging the classroom and home with verified morning arrival radars, continuous attendance tracking, and a direct confidential 1-on-1 private messaging channel with subject teachers.',
      features: [
        'Real-time morning arrival confirmation & daily attendance radar',
        'Confidential 1-on-1 direct messaging channel with subject educators',
        'Evaluated coursework breakdown with marks, percentages, and teacher notes',
        'Child active assignments & upcoming deadline completion tracker',
      ],
      demoRole: 'Parent',
      demoEmail: 'david.vance@parent.oakridge.edu',
      demoName: 'David Vance',
      tagline: 'Active partnership in your child’s educational trajectory',
    },
    admin: {
      title: 'Multi-Tenant SaaS Governance & Institutional Sovereignty',
      badge: 'For School Leaders & Trustees',
      description:
        'Built for multi-academy trusts, independent schools, and global education networks. Run any number of institutions with complete request-level data sovereignty.',
      features: [
        'Request-level tenant isolation via x-tenant-code HTTP headers',
        'Instant Multi-School Switcher (Oakridge Academy ⇄ St. Jude High School)',
        'Zero-setup internal SQL database with PostgreSQL compatibility',
        'Granular RBAC: School Admin, Faculty Educator, Student, and Guardian roles',
      ],
      demoRole: 'School 2 Tenant',
      demoEmail: 'robert.vance@stjude.edu',
      demoName: 'Mr. Robert Vance',
      tagline: 'Complete data sovereignty with enterprise-grade multi-tenancy',
    },
  };

  const aiFeatures = [
    {
      title: 'Evidence-Based Report Card Writer',
      subtitle: 'Synthesizes actual student attendance, grade average, and strengths',
      desc: 'Evaluates 5 academic tiers (High Distinction to Targeted Support) and weaves real attendance data with customizable teacher tones (Warm, Formal, Growth-Mindset).',
      badge: 'Pedagogical Synthesis',
      highlight: 'Tailored term remarks in under 1 second',
    },
    {
      title: '45-Min Toddle / IB Inquiry Lesson Planner',
      subtitle: 'Structured around the IB Inquiry Cycle (Provocation ➔ Investigation ➔ Reflection)',
      desc: 'Generates subject-tailored inquiry questions, timed lesson blocks (Hook 16%, Guided 28%, Collaborative 36%, 3-2-1 Exit Ticket 20%), and 3-tier differentiated scaffolding.',
      badge: 'Curriculum Scaffolding',
      highlight: 'Aligned with Toddle, IB & Cambridge standards',
    },
    {
      title: '4-Tier Assessment Rubric Generator',
      subtitle: 'Exemplary, Proficient, Developing, and Novice criterion matrices',
      desc: 'Detects discipline context (Scientific Labs vs Critical Research Essays vs Mathematical Problem Sets) with quantified weightings and explicit point breakdowns.',
      badge: 'Assessment Design',
      highlight: 'Instant multi-criteria evaluation matrices',
    },
    {
      title: 'Early Intervention Academic & Attendance Radar',
      subtitle: 'Proactive pastoral care and risk diagnosis',
      desc: 'Calculates Risk Indices (Tier 3 Critical to Tier 1 Monitoring), analyzes root causes (absenteeism vs conceptual deficit), and builds a 3-phase pastoral recovery roadmap.',
      badge: 'Pastoral Care',
      highlight: 'Intervene before term grade drops occur',
    },
    {
      title: 'Speed Grading AI Feedback Assistant',
      subtitle: 'Canvas LMS-inspired submission inspection',
      desc: 'Analyzes student homework submissions side-by-side with scoring rubrics to generate constructive, encouraging, criterion-referenced teacher feedback.',
      badge: 'Live Grading',
      highlight: 'Integrated directly into Speed Grading Studio',
    },
  ];

  const currentPortal = portalDetails[activePortalTab];

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* 1. Global Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.9rem 2rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                SchoolMate
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>
                Unified Multi-Tenant SIS & LMS
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <a href="#portals" style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}>
              Portals
            </a>
            <a href="#features" style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
              Pillars
            </a>
            <a href="#ai-studio" style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
              AI Studio
            </a>
            <a href="#demos" style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
              1-Click Demos
            </a>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => openAuthModal('login')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register-school')}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              Register School
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5.5rem 2rem 4.5rem' }}>
        <div
          style={{
            position: 'absolute',
            top: '-25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(11, 15, 25, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Institutional Tag Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(37, 99, 235, 0.14)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: '999px',
              padding: '0.4rem 1.1rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#60a5fa',
              marginBottom: '1.75rem',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
            }}
          >
            <Sparkles size={14} color="#60a5fa" />
            Next-Generation Multi-Tenant School Operating System
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.2vw, 4.2rem)',
              fontWeight: 850,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              color: '#ffffff',
            }}
          >
            The Operating System for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Modern Schools & Academies
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#94a3b8',
              maxWidth: '850px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.65,
            }}
          >
            Unifying <strong>Faculty Workspaces</strong>, continuous <strong>Matrix Gradebooks</strong>, an autonomous{' '}
            <strong>Student Coursework Cockpit</strong>, verified <strong>Guardian Arrival Radars</strong>, and{' '}
            <strong>5 Pedagogical AI Synthesizers</strong> under 100% tenant data isolation.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button
              onClick={() => openAuthModal('register-school')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.9rem 1.9rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <School size={18} />
              Register Your School Institution
            </button>

            <button
              onClick={() => openAuthModal('register-teacher')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#f8fafc',
                borderRadius: '10px',
                padding: '0.9rem 1.7rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Users size={18} />
              Sign Up as Faculty Teacher
            </button>
          </div>

          {/* 1-Click Instant Evaluation Launch Bar */}
          <div
            style={{
              maxWidth: '920px',
              margin: '0 auto',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
              ⚡ 1-Click Live Test Drive (No Password Required)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
              <button
                onClick={() => handleQuickLogin('sarah.jenkins@oakridge.edu', 'Teacher')}
                disabled={!!loggingInRole}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#60a5fa' }}>👨‍🏫 Faculty Teacher</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Dr. Sarah Jenkins</div>
                </div>
                <ArrowRight size={14} color="#60a5fa" />
              </button>

              <button
                onClick={() => handleQuickLogin('leo.vance@student.oakridge.edu', 'Student')}
                disabled={!!loggingInRole}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#34d399' }}>🎒 Enrolled Student</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Leo Vance (Grade 9-A)</div>
                </div>
                <ArrowRight size={14} color="#34d399" />
              </button>

              <button
                onClick={() => handleQuickLogin('david.vance@parent.oakridge.edu', 'Parent')}
                disabled={!!loggingInRole}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fbbf24' }}>👨‍👩‍👧 Verified Guardian</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>David Vance</div>
                </div>
                <ArrowRight size={14} color="#fbbf24" />
              </button>
            </div>
          </div>

          {/* Institutional Trust Badges Strip */}
          <div
            style={{
              marginTop: '4.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              textAlign: 'left',
            }}
          >
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ color: '#38bdf8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>100% Tenant Isolation</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Strict request-level isolation via <code>x-tenant-code</code> headers. Zero cross-school leakage.
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ color: '#a78bfa', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zero-Cost AI Studio</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Offline pedagogical synthesis with optional NVIDIA NIM Llama 3.3-70B model acceleration.
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ color: '#34d399', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>10+ Hours Saved/Week</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Automate roll call, speed rubric grading, term remarks, and inquiry lesson planning.
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ color: '#fbbf24', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>FERPA & GDPR Aligned</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Role-based access enforcement for teachers, learners, parents, and trust leaders.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Portals Showcase (Interactive Multi-Tab / Multi-Page) */}
      <section id="portals" style={{ padding: '5rem 2rem', backgroundColor: '#070b12', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Dedicated Cockpits
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff' }}>
              Tailored Workspaces for Every Stakeholder
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0.5rem auto 0', fontSize: '1rem' }}>
              Switch perspectives to inspect role-specific functionality and institutional interfaces.
            </p>
          </div>

          {/* Portal Selector Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.6rem',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            {(['teacher', 'student', 'parent', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePortalTab(tab)}
                style={{
                  backgroundColor: activePortalTab === tab ? '#1e293b' : 'transparent',
                  border: activePortalTab === tab ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: activePortalTab === tab ? '#ffffff' : '#94a3b8',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: activePortalTab === tab ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                }}
              >
                {tab === 'teacher' && <BookOpen size={16} color="#60a5fa" />}
                {tab === 'student' && <GraduationCap size={16} color="#34d399" />}
                {tab === 'parent' && <Users size={16} color="#fbbf24" />}
                {tab === 'admin' && <School size={16} color="#c084fc" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Portal
              </button>
            ))}
          </div>

          {/* Portal Showcase Card */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              <span
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {currentPortal.badge}
              </span>

              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', margin: '1rem 0 0.8rem' }}>
                {currentPortal.title}
              </h3>

              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {currentPortal.description}
              </p>

              {/* Feature Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                {currentPortal.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                    <span style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.4 }}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* 1-Click Launch Action for this portal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => handleQuickLogin(currentPortal.demoEmail, currentPortal.demoRole)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  Launch {currentPortal.demoRole} Workspace ({currentPortal.demoName})
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Right Visual Representation: Interactive Live UI Simulation */}
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1.5rem',
                boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 600 }}>
                    SchoolMate Cockpit // {currentPortal.demoRole} View
                  </span>
                </div>
                <span className="badge" style={{ backgroundColor: '#0f172a', color: '#38bdf8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  Tenant: OAKRIDGE
                </span>
              </div>

              {/* Dynamic Mockup Card based on active tab */}
              {activePortalTab === 'teacher' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>🟢 INSTRUCTION ACTIVE (08:30 - 09:15)</span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>96% Attendance</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Grade 9-A • Physics & Mechanics</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Room 302 • 24 Students Present • 1 Late</div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem' }}>SPEED GRADING QUEUE</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Leo Vance — Newtonian Dynamics</div>
                        <div style={{ fontSize: '0.72rem', color: '#34d399' }}>AI Suggested: 95/100 pts (Grade A+)</div>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>Graded</span>
                    </div>
                  </div>
                </div>
              )}

              {activePortalTab === 'student' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>STUDENT COCKPIT</span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>100% Attendance</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Leo Vance • Grade 9-A (Roll #01)</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Academic Average: 94% (Grade A+) • +5 Merits</div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Newton's Second Law Lab Write-Up</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Due Tomorrow • Max 100 pts</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Turned In ✓</span>
                    </div>
                  </div>
                </div>
              )}

              {activePortalTab === 'parent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>VERIFIED GUARDIAN RADAR</span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Arrived 08:25 AM</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>David Vance supervising Leo Vance</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>100% Morning Presence • Term 1 Physics A+</div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700 }}>CONFIDENTIAL TEACHER THREAD</div>
                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                      "Leo demonstrated remarkable laboratory precision during today's mechanics experiment."
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>— Dr. Sarah Jenkins (09:45 AM)</div>
                  </div>
                </div>
              )}

              {activePortalTab === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700 }}>INSTITUTIONAL SOVEREIGNTY</span>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Multi-Tenant Active</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Oakridge Global Academy ⇄ St. Jude High</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Request Isolation: Header x-tenant-code enforced</div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Zero Cross-School Data Leakage</div>
                        <div style={{ fontSize: '0.72rem', color: '#34d399' }}>FERPA & GDPR Schema Isolated</div>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Verified Safe</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Teacher AI Studio Showcase */}
      <section id="ai-studio" style={{ padding: '5.5rem 2rem', position: 'relative', backgroundColor: '#0b0f19' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#a78bfa',
                padding: '0.35rem 0.95rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <Sparkles size={13} style={{ display: 'inline', marginRight: '0.35rem' }} />
              Teacher AI Studio
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.8rem', color: '#ffffff' }}>
              Built-in Pedagogical Intelligence
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '680px', margin: '0.5rem auto 0', fontSize: '1rem' }}>
              Engineered with a high-fidelity local pedagogical synthesizer that works 100% offline at zero cost, with optional NVIDIA Build / OpenAI model acceleration.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {aiFeatures.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.badge}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                      Zero-Cost Ready
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.85rem' }}>
                    {item.subtitle}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55 }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {item.highlight}
                  </span>
                  <button
                    onClick={() => handleQuickLogin('sarah.jenkins@oakridge.edu', 'Teacher')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    Test in Studio <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 1-Click Test Personas Evaluation Section */}
      <section id="demos" style={{ padding: '5.5rem 2rem', backgroundColor: '#070b12', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Instant Stakeholder Evaluation
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff' }}>
            Experience SchoolMate in 1 Click
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0.5rem auto 2.5rem', fontSize: '1rem' }}>
            Instantly evaluate pre-seeded institutional personas with real course cohorts, attendance logs, and speed rubrics.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Persona 1: Teacher */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '14px',
                padding: '1.6rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🏫</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>Dr. Sarah Jenkins</div>
                <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700 }}>Faculty Educator</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.6rem 0 1rem' }}>
                  Oakridge Academy • Physics Dept
                </div>
                <div style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  Live period roll call, continuous matrix gradebook, speed grading & AI Studio.
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('sarah.jenkins@oakridge.edu', 'Teacher')}
                style={{
                  marginTop: '1.25rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log In as Teacher
              </button>
            </div>

            {/* Persona 2: Student */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '14px',
                padding: '1.6rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎒</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>Leo Vance</div>
                <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>Enrolled Student</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.6rem 0 1rem' }}>
                  Oakridge Academy • Grade 9-A
                </div>
                <div style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  Turn in coursework, view evaluated teacher marks, timetable & positive merits.
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('leo.vance@student.oakridge.edu', 'Student')}
                style={{
                  marginTop: '1.25rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log In as Student
              </button>
            </div>

            {/* Persona 3: Parent */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '14px',
                padding: '1.6rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍👩‍👧</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>David Vance</div>
                <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>Verified Guardian</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.6rem 0 1rem' }}>
                  Guardian to Leo Vance (Grade 9-A)
                </div>
                <div style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  Morning arrival radar, evaluated marks, homework tracker, and direct teacher chat.
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('david.vance@parent.oakridge.edu', 'Parent')}
                style={{
                  marginTop: '1.25rem',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log In as Parent
              </button>
            </div>

            {/* Persona 4: Multi-Tenant Institution */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '14px',
                padding: '1.6rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>Mr. Robert Vance</div>
                <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700 }}>School 2 Tenant</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.6rem 0 1rem' }}>
                  St. Jude High School • STJUDE
                </div>
                <div style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  Test complete multi-tenant separation across separate school systems.
                </div>
              </div>
              <button
                onClick={() => handleQuickLogin('robert.vance@stjude.edu', 'School 2')}
                style={{
                  marginTop: '1.25rem',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Log In as School 2
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Institutional Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '3.5rem 2rem', backgroundColor: '#070b12' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>SchoolMate</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Multi-Tenant Institutional SIS & LMS</div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            © {new Date().getFullYear()} SchoolMate Institutional Systems. Built with React, Vite, Express, Prisma ORM & TypeScript.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href="https://github.com/itssadnan/SchoolMate"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              GitHub Repository <ExternalLink size={14} />
            </a>
            <button
              onClick={() => openAuthModal('login')}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '0.45rem 0.95rem',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
