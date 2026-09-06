import React, { useState, useEffect } from 'react';
import { Download, Sliders, FileSpreadsheet, Award } from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Gradebook: React.FC = () => {
  const { school } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        console.error('Failed to load classes for gradebook:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [school]);

  // Load gradebook matrix for selected class
  useEffect(() => {
    if (!selectedClassId) return;

    const fetchGradebook = async () => {
      try {
        const data = await ApiClient.get(`/gradebook/${selectedClassId}`);
        setMatrixData(data);
      } catch (err) {
        console.error('Failed to load gradebook matrix:', err);
      }
    };

    fetchGradebook();
  }, [selectedClassId]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!matrixData) return;

    const headers = [
      'Roll #',
      'Student Name',
      ...matrixData.assignments.map((a: any) => `"${a.title} (${a.maxPoints} pts)"`),
      'Total Earned',
      'Total Max',
      'Percentage',
      'Letter Grade',
    ];

    const rows = matrixData.students.map((s: any) => [
      s.rollNumber,
      `"${s.fullName}"`,
      ...matrixData.assignments.map((a: any) =>
        s.grades[a.id] ? s.grades[a.id].pointsAwarded : 'N/A'
      ),
      s.totalEarned,
      s.totalMax,
      `${s.overallPercentage}%`,
      s.letterGrade,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Gradebook_${matrixData.className.replace(/\s+/g, '_')}_2026.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeClassForGrade = (grade: string) => {
    if (grade.startsWith('A')) return 'badge-success';
    if (grade.startsWith('B')) return 'badge-primary';
    if (grade.startsWith('C')) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div>
      {/* Header */}
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
            Matrix Gradebook & Assessment Ledger
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Real-time spreadsheet-grade continuous evaluation with automatic weighted calculations
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleExportCSV} disabled={!matrixData}>
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      {/* Class Selector Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            CLASS REGISTER:
          </label>
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Assignments Tracked: <strong>{matrixData?.assignments?.length || 0}</strong> • Students: <strong>{matrixData?.students?.length || 0}</strong>
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="table-container" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, zIndex: 5, backgroundColor: '#f8fafc', width: '60px' }}>
                Roll #
              </th>
              <th style={{ position: 'sticky', left: '60px', zIndex: 5, backgroundColor: '#f8fafc', minWidth: '200px' }}>
                Student Name
              </th>

              {matrixData?.assignments?.map((a: any) => (
                <th key={a.id} style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {a.category} • Max {a.maxPoints} pts
                  </div>
                </th>
              ))}

              <th style={{ textAlign: 'center', minWidth: '110px', backgroundColor: '#f1f5f9' }}>
                Total Points
              </th>
              <th style={{ textAlign: 'center', minWidth: '100px', backgroundColor: '#f1f5f9' }}>
                Overall %
              </th>
              <th style={{ textAlign: 'center', minWidth: '100px', backgroundColor: '#f1f5f9' }}>
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {matrixData?.students?.map((s: any) => (
              <tr key={s.studentId}>
                <td style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: '#ffffff', fontWeight: 700, color: 'var(--text-muted)' }}>
                  #{s.rollNumber}
                </td>
                <td style={{ position: 'sticky', left: '60px', zIndex: 2, backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={s.avatarUrl}
                      alt={s.firstName}
                      style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{s.fullName}</span>
                  </div>
                </td>

                {matrixData.assignments.map((a: any) => {
                  const grade = s.grades[a.id];
                  return (
                    <td key={a.id} style={{ textAlign: 'center' }}>
                      {grade ? (
                        <div>
                          <div className="matrix-cell-score">
                            {grade.pointsAwarded}
                          </div>
                          <div className="matrix-cell-pct">{grade.percentage}%</div>
                        </div>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                  );
                })}

                <td style={{ textAlign: 'center', fontWeight: 700, backgroundColor: '#fafbfc' }}>
                  {s.totalEarned} / {s.totalMax}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)', backgroundColor: '#fafbfc' }}>
                  {s.overallPercentage}%
                </td>
                <td style={{ textAlign: 'center', backgroundColor: '#fafbfc' }}>
                  <span className={`badge ${getBadgeClassForGrade(s.letterGrade)}`}>
                    {s.letterGrade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
