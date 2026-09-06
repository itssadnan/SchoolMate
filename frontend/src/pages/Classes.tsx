import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, CheckCircle2, Phone, Mail, Sparkles, X } from 'lucide-react';
import { ApiClient } from '../services/api';
import { Modal } from '../components/Modal';

export const Classes: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent360, setSelectedStudent360] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const list = await ApiClient.get('/classes');
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const fetchStudents = async () => {
      try {
        const res = await ApiClient.get(`/classes/${selectedClassId}/students`);
        setStudents(res);
      } catch (err) {
        console.error('Failed to load class students:', err);
      }
    };
    fetchStudents();
  }, [selectedClassId]);

  const handleOpen360 = async (studentId: string) => {
    try {
      const res = await ApiClient.get(`/students/${studentId}/360`);
      setSelectedStudent360(res);
      setModalOpen(true);
    } catch (err) {
      alert('Could not load student profile.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Classrooms & Student 360° Rosters
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Comprehensive student profiles, pastoral care history, and academic trajectory
        </p>
      </div>

      {/* Class Switcher Cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {classes.map((c) => {
          const isSelected = c.id === selectedClassId;
          return (
            <div
              key={c.id}
              className="card"
              onClick={() => setSelectedClassId(c.id)}
              style={{
                cursor: 'pointer',
                border: '2px solid',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                minWidth: '220px',
                padding: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                {c.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {c.room || 'Room 302'} • {c._count?.enrollments || 0} Students
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Roster Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Roll #</th>
              <th>Student</th>
              <th>Contact Email</th>
              <th style={{ textAlign: 'center' }}>Attendance Rate</th>
              <th style={{ textAlign: 'center' }}>Merit Points</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                  #{s.rollNumber}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={s.avatarUrl}
                      alt={s.firstName}
                      style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 700 }}>{s.fullName}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className={`badge ${
                      s.attendanceRate >= 90
                        ? 'badge-success'
                        : s.attendanceRate >= 80
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {s.attendanceRate}%
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                    +{s.meritPoints || 0} pts
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpen360(s.id)}
                  >
                    View 360° Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 360 Profile Modal */}
      {selectedStudent360 && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Student 360° Portfolio: ${selectedStudent360.firstName} ${selectedStudent360.lastName}`}
          maxWidth="720px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={selectedStudent360.avatarUrl}
                alt={selectedStudent360.firstName}
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>
                  {selectedStudent360.firstName} {selectedStudent360.lastName}
                </h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {selectedStudent360.email} • Class: {selectedStudent360.enrollments?.[0]?.classGroup?.name}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid-3">
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ATTENDANCE RATE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {selectedStudent360.attendanceRate}%
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVERAGE SCORE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedStudent360.averageGrade}%
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEHAVIOR MERITS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6' }}>
                  +{selectedStudent360.studentBehaviors?.length || 0} Badges
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Guardian & Contact Info</h4>
              {selectedStudent360.parentRelations?.length > 0 ? (
                selectedStudent360.parentRelations.map((pr: any) => (
                  <div
                    key={pr.id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong>{pr.parent.firstName} {pr.parent.lastName}</strong> ({pr.relationshipType})
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pr.parent.email}</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{pr.parent.phone || 'Phone on file'}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Guardian details registered with administration.</div>
              )}
            </div>

            {/* Pastoral Logs */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Pastoral Care & Merits Log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedStudent360.studentBehaviors?.map((b: any) => (
                  <div
                    key={b.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#6b21a8' }}>
                      <span>⭐ {b.category} (+{b.points} pts)</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By {b.teacher?.firstName} {b.teacher?.lastName}</span>
                    </div>
                    {b.note && <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '0.2rem' }}>"{b.note}"</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
