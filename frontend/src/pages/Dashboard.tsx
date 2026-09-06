import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiClient } from '../services/api';
import { NavView } from '../components/Sidebar';

interface DashboardProps {
  onNavigate: (view: NavView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, school } = useAuth();
  const [liveData, setLiveData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [liveRes, classRes, assignRes] = await Promise.all([
          ApiClient.get('/timetable/live'),
          ApiClient.get('/classes'),
          ApiClient.get('/assignments'),
        ]);
        setLiveData(liveRes);
        setClasses(classRes);
        setAssignments(assignRes);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [school]);

  const currentSlot = liveData?.currentSlot;
  const pendingGradingCount = assignments.reduce(
    (sum, a) => sum + (a.pendingGrading || 0),
    0
  );
  const totalStudents = classes.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  );

  return (
    <div>
      {/* Welcome & Live Status Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Welcome, {user?.firstName}! 👋
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {school?.name} • Faculty Command Center
        </p>
      </div>

      {/* Hero: Active Live Period Widget */}
      {currentSlot && (
        <div className="live-period-banner">
          <div>
            <div className="live-indicator">
              <span className="live-pulse-dot" />
              <span>Instruction Period Active</span>
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              {currentSlot.classGroup.name} • {currentSlot.subject.name}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                fontSize: '0.875rem',
                color: '#c7d2fe',
                marginTop: '0.5rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={16} /> {currentSlot.startTime} - {currentSlot.endTime}
              </span>
              <span>📍 {currentSlot.room || 'Main Hall'}</span>
              <span>👥 {classes[0]?._count?.enrollments || 8} Students Enrolled</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e1b4b',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                fontWeight: 700,
              }}
              onClick={() => onNavigate('attendance')}
            >
              <CheckSquare size={18} color="#2563eb" />
              Take Roll Call (1-Click)
            </button>
            <button
              className="btn btn-ai"
              onClick={() => onNavigate('ai-studio')}
            >
              <Sparkles size={18} />
              AI Lesson Assistant
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                ATTENDANCE RATE
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#10b981' }}>
                96.4%
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
              }}
            >
              <CheckSquare size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            ↑ 2.1% higher than school target
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                PENDING SUBMISSIONS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#f59e0b' }}>
                {pendingGradingCount || 2}
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning)',
              }}
            >
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Ready for evaluation in Grading Studio
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                TOTAL STUDENTS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#3b82f6' }}>
                {totalStudents || 8}
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <BookOpen size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Across {classes.length} instructional sections
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                POSITIVE MERITS
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#8b5cf6' }}>
                +18
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
              }}
            >
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Awarded for Curiosity & Teamwork
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Action Queue */}
      <div className="grid-2">
        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" />
              Today's Teaching Schedule
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('timetable')}
            >
              Full Week
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {liveData?.allTodaySlots?.length > 0 ? (
              liveData.allTodaySlots.map((slot: any, idx: number) => {
                const isCurrent = idx === 0;
                return (
                  <div
                    key={slot.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'var(--primary-border)' : 'var(--border-subtle)',
                      backgroundColor: isCurrent ? 'var(--primary-light)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {slot.classGroup.name} • {slot.subject.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {slot.startTime} - {slot.endTime} • {slot.room || 'Room 302'}
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="badge badge-primary">Active Now</span>
                    ) : (
                      <span className="badge badge-info">Upcoming</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                No more scheduled teaching periods for today.
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch & AI Assistant Spotlight */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#8b5cf6" />
              Instructional Productivity Shortcuts
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1px solid #ddd6fe',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#5b21b6' }}>
                🤖 AI Report Card Comment Writer
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6d28d9', margin: '0.35rem 0 0.75rem' }}>
                Synthesize student grades, attendance records, and pastoral merits into personalized parent comments in seconds.
              </p>
              <button
                className="btn btn-ai btn-sm"
                onClick={() => onNavigate('ai-studio')}
              >
                Launch AI Studio <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem' }}
                onClick={() => onNavigate('attendance')}
              >
                <CheckSquare size={16} color="var(--primary)" />
                <span>Mark Attendance</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem' }}
                onClick={() => onNavigate('grading')}
              >
                <FileText size={16} color="var(--warning)" />
                <span>Grade Work</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem' }}
                onClick={() => onNavigate('gradebook')}
              >
                <BookOpen size={16} color="var(--success)" />
                <span>Open Gradebook</span>
              </button>

              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.85rem' }}
                onClick={() => onNavigate('notices')}
              >
                <Send size={16} color="var(--accent)" />
                <span>Class Notice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
