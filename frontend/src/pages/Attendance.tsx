import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Send,
  Save,
  Bell,
  Calendar,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Attendance: React.FC = () => {
  const { school } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Load teacher classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const list = await ApiClient.get('/classes');
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [school]);

  // Load attendance records for selected class & date
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchAttendance = async () => {
      setLoading(true);
      setSaveSuccess(null);
      try {
        const res = await ApiClient.get(
          `/attendance/${selectedClassId}?date=${selectedDate}`
        );
        setRoster(res.roster || []);
      } catch (err) {
        console.error('Error loading attendance roster:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedClassId, selectedDate]);

  // Quick 1-click status changers
  const handleStatusChange = (studentId: string, status: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const markAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const records = roster.map((s) => ({
        studentId: s.studentId,
        status: s.status,
        remarks: s.remarks,
      }));

      const res = await ApiClient.post(`/attendance/${selectedClassId}/batch`, {
        date: selectedDate,
        records,
      });

      setSaveSuccess(
        `Roll call saved! Attendance rate: ${res.summary?.attendanceRate}% (${res.summary?.present}/${res.summary?.total} present).`
      );
    } catch (err: any) {
      alert(`Failed to save attendance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const total = roster.length;
  const presentCount = roster.filter((r) => r.status === 'PRESENT').length;
  const absentCount = roster.filter((r) => r.status === 'ABSENT').length;
  const lateCount = roster.filter((r) => r.status === 'LATE').length;
  const excusedCount = roster.filter((r) => r.status === 'EXCUSED').length;

  return (
    <div>
      {/* Page Header */}
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
            Smart Attendance Roll Call
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            One-click batch marking with automatic parent absence notifications
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={markAllPresent}>
            <CheckCircle2 size={16} color="var(--success)" />
            Mark All Present
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveAttendance}
            disabled={saving || roster.length === 0}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Submit & Lock Roll Call'}
          </button>
        </div>
      </div>

      {/* Filter Bar: Class & Date */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            CLASS / SECTION:
          </label>
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c._count?.enrollments || 0} students)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            DATE:
          </label>
          <input
            type="date"
            className="form-input"
            style={{ width: '160px' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Live Counter Badges */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-success">
            {presentCount} Present
          </span>
          <span className="badge badge-danger">
            {absentCount} Absent
          </span>
          <span className="badge badge-warning">
            {lateCount} Late
          </span>
          <span className="badge badge-info">
            {excusedCount} Excused
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Parent Alert Notice if Absentees exist */}
      {absentCount > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.825rem',
            color: '#b45309',
          }}
        >
          <Bell size={16} />
          <span>
            <strong>Parent Alert Trigger:</strong> {absentCount} student(s) marked absent. Automated SMS / push alerts will be dispatched to their registered guardians upon submission.
          </span>
        </div>
      )}

      {/* Roster Attendance Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Roll #</th>
              <th>Student Roster</th>
              <th style={{ textAlign: 'center', width: '380px' }}>Attendance Status</th>
              <th>Pastoral Notes / Reason</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => {
              return (
                <tr key={s.studentId}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{s.rollNumber}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={s.avatarUrl}
                        alt={s.firstName}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--border-subtle)',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {s.firstName} {s.lastName}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          Student ID: {s.studentId.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.studentId, 'PRESENT')}
                        className="btn btn-sm"
                        style={{
                          backgroundColor:
                            s.status === 'PRESENT' ? 'var(--success)' : '#f1f5f9',
                          color: s.status === 'PRESENT' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={14} /> Present
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.studentId, 'LATE')}
                        className="btn btn-sm"
                        style={{
                          backgroundColor:
                            s.status === 'LATE' ? 'var(--warning)' : '#f1f5f9',
                          color: s.status === 'LATE' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={14} /> Late
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.studentId, 'ABSENT')}
                        className="btn btn-sm"
                        style={{
                          backgroundColor:
                            s.status === 'ABSENT' ? 'var(--danger)' : '#f1f5f9',
                          color: s.status === 'ABSENT' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                        }}
                      >
                        <XCircle size={14} /> Absent
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.studentId, 'EXCUSED')}
                        className="btn btn-sm"
                        style={{
                          backgroundColor:
                            s.status === 'EXCUSED' ? 'var(--info)' : '#f1f5f9',
                          color: s.status === 'EXCUSED' ? '#ffffff' : '#475569',
                          fontWeight: 700,
                        }}
                      >
                        Excused
                      </button>
                    </div>
                  </td>

                  <td>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bus delay, medical leave"
                      value={s.remarks || ''}
                      onChange={(e) => handleRemarksChange(s.studentId, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
