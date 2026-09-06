import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavView } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Assignments } from './pages/Assignments';
import { GradingStudio } from './pages/GradingStudio';
import { Gradebook } from './pages/Gradebook';
import { AIStudio } from './pages/AIStudio';
import { Timetable } from './pages/Timetable';
import { Classes } from './pages/Classes';
import { Behavior } from './pages/Behavior';
import { Notices } from './pages/Notices';
import { StudentPortal } from './pages/StudentPortal';
import { ParentPortal } from './pages/ParentPortal';
import { ParentDiscussions } from './pages/ParentDiscussions';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [selectedAssignId, setSelectedAssignId] = useState<string | undefined>(undefined);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading SchoolMate Workspace...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // 1. Dedicated Student Portal Web View
  if (user.role === 'STUDENT') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <TopNavbar />
        <main style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', padding: '1.75rem 1.5rem', flex: 1 }}>
          <StudentPortal />
        </main>
      </div>
    );
  }

  // 2. Dedicated Parent Portal Web View
  if (user.role === 'PARENT') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        <TopNavbar />
        <main style={{ maxWidth: '1180px', width: '100%', margin: '0 auto', padding: '1.75rem 1.5rem', flex: 1 }}>
          <ParentPortal />
        </main>
      </div>
    );
  }

  // 3. Faculty / Teacher Workspace Shell
  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <div className="main-wrapper">
        <TopNavbar />

        <main className="content-viewport">
          {currentView === 'dashboard' && (
            <Dashboard onNavigate={setCurrentView} />
          )}
          {currentView === 'attendance' && <Attendance />}
          {currentView === 'assignments' && (
            <Assignments
              onNavigate={setCurrentView}
              onSelectAssignmentForGrading={(id) => setSelectedAssignId(id)}
            />
          )}
          {currentView === 'grading' && (
            <GradingStudio initialAssignmentId={selectedAssignId} />
          )}
          {currentView === 'gradebook' && <Gradebook />}
          {currentView === 'ai-studio' && <AIStudio />}
          {currentView === 'timetable' && <Timetable />}
          {currentView === 'classes' && <Classes />}
          {currentView === 'behavior' && <Behavior />}
          {currentView === 'notices' && <Notices />}
          {currentView === 'parent-chat' && <ParentDiscussions />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
