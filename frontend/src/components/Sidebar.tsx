import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Award,
  GraduationCap,
  Sparkles,
  Calendar,
  Users,
  Bell,
  Sliders,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavView =
  | 'dashboard'
  | 'attendance'
  | 'assignments'
  | 'grading'
  | 'gradebook'
  | 'ai-studio'
  | 'timetable'
  | 'classes'
  | 'behavior'
  | 'notices'
  | 'parent-chat';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { school } = useAuth();

  const navItems: {
    view: NavView;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    isAi?: boolean;
    section?: string;
  }[] = [
    {
      section: 'Instruction & Daily',
      view: 'dashboard',
      label: 'Teacher Command',
      icon: <LayoutDashboard size={18} />,
    },
    {
      view: 'attendance',
      label: 'Smart Attendance',
      icon: <CheckSquare size={18} />,
      badge: 'Live',
    },
    {
      view: 'timetable',
      label: 'Class Timetable',
      icon: <Calendar size={18} />,
    },
    {
      section: 'Assessments & Learning',
      view: 'assignments',
      label: 'Assignments Hub',
      icon: <FileText size={18} />,
    },
    {
      view: 'grading',
      label: 'Grading Studio',
      icon: <GraduationCap size={18} />,
      badge: 'Speed',
    },
    {
      view: 'gradebook',
      label: 'Matrix Gradebook',
      icon: <Sliders size={18} />,
    },
    {
      section: 'Pedagogical Studio',
      view: 'ai-studio',
      label: 'Teacher AI Studio',
      icon: <Sparkles size={18} />,
    },
    {
      section: 'Pastoral & Community',
      view: 'classes',
      label: 'Class Roster & 360°',
      icon: <Users size={18} />,
    },
    {
      view: 'behavior',
      label: 'Praise & Merits',
      icon: <Award size={18} />,
    },
    {
      view: 'notices',
      label: 'Notice Board',
      icon: <Bell size={18} />,
    },
    {
      view: 'parent-chat',
      label: 'Parent Messages',
      icon: <MessageSquare size={18} />,
      badge: 'Confidential',
    },
  ];

  let lastSection = '';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="sidebar-brand-title">SchoolMate</div>
          <div className="sidebar-brand-subtitle">
            {school ? school.code : 'SaaS Platform'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section!;

          return (
            <React.Fragment key={item.view}>
              {showSection && <div className="nav-section-title">{item.section}</div>}
              <div
                className={`nav-item ${currentView === item.view ? 'active' : ''}`}
                onClick={() => onNavigate(item.view)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.isAi ? 'ai' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Multi-Tenant Isolated
          </span>
        </div>
      </div>
    </aside>
  );
};
