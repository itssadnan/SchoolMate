import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Phone,
  Mail,
  Sparkles,
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ApiClient } from '../services/api';
import { Modal } from '../components/Modal';

const STANDARD_GRADES = [
  'Pre-KG',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

type FieldType = 'name' | 'rollNumber' | 'className' | 'section' | 'email' | 'phone' | 'skip';

export const Classes: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent360, setSelectedStudent360] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Bulk Excel/CSV Import Wizard State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [numColumns, setNumColumns] = useState<number>(4);
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true);
  const [columnMappings, setColumnMappings] = useState<FieldType[]>([
    'name',
    'rollNumber',
    'className',
    'section',
  ]);
  const [defaultGrade, setDefaultGrade] = useState<string>('Grade 9');
  const [defaultSection, setDefaultSection] = useState<string>('A');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const list = await ApiClient.get('/classes');
      setClasses(list);
      if (list.length > 0 && !selectedClassId) {
        setSelectedClassId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClassStudents = async (classId: string) => {
    try {
      const res = await ApiClient.get(`/classes/${classId}/students`);
      setStudents(res);
    } catch (err) {
      console.error('Failed to load class students:', err);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents(selectedClassId);
    }
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

  // Adjust column mappings array whenever numColumns changes
  const handleNumColumnsChange = (count: number) => {
    const clamped = Math.max(2, Math.min(10, count));
    setNumColumns(clamped);
    const defaults: FieldType[] = ['name', 'rollNumber', 'className', 'section', 'email', 'phone'];
    const newMappings: FieldType[] = [];
    for (let i = 0; i < clamped; i++) {
      newMappings.push(columnMappings[i] || defaults[i] || 'skip');
    }
    setColumnMappings(newMappings);
  };

  const handleMappingChange = (colIdx: number, val: FieldType) => {
    const updated = [...columnMappings];
    updated[colIdx] = val;
    setColumnMappings(updated);
  };

  // Handle file selection and parsing via xlsx
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawGrid: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawGrid.length === 0) {
          setImportError('The uploaded file contains no data.');
          return;
        }

        const dataRows = hasHeaderRow ? rawGrid.slice(1) : rawGrid;
        const mappedList = dataRows
          .filter((row) => row && row.some((cell) => cell !== undefined && String(cell).trim() !== ''))
          .map((row) => {
            const item: any = {
              className: defaultGrade,
              section: defaultSection,
            };

            columnMappings.forEach((field, colIdx) => {
              if (field && field !== 'skip') {
                const cellValue = row[colIdx];
                if (cellValue !== undefined && cellValue !== null) {
                  item[field] = String(cellValue).trim();
                }
              }
            });

            return item;
          });

        setParsedRows(mappedList);
        setImportStep(3);
      } catch (err: any) {
        setImportError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit parsed data to backend for atomic import
  const handleExecuteImport = async () => {
    setImportError(null);
    setImportSuccess(null);
    setImporting(true);
    try {
      const res = await ApiClient.post('/classes/import-students', {
        rows: parsedRows,
      });

      setImportSuccess(res.message || `Successfully imported ${parsedRows.length} students!`);
      await fetchClasses();
      if (selectedClassId) {
        await fetchClassStudents(selectedClassId);
      }
      setTimeout(() => {
        setImportModalOpen(false);
        setImportStep(1);
        setParsedRows([]);
        setFileName('');
        setImportSuccess(null);
      }, 2000);
    } catch (err: any) {
      setImportError(err.message || 'Import failed due to data validation errors.');
    } finally {
      setImporting(false);
    }
  };

  const resetImportWizard = () => {
    setImportStep(1);
    setParsedRows([]);
    setFileName('');
    setImportError(null);
    setImportSuccess(null);
  };

  return (
    <div>
      {/* Header with Title and Import Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Classrooms & Student 360° Rosters
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Comprehensive student profiles, academic trajectories, and bulk student onboarding
          </p>
        </div>

        <div>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetImportWizard();
              setImportModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <FileSpreadsheet size={16} /> Bulk Student Import (Excel / CSV)
          </button>
        </div>
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
                transition: 'all 0.15s ease',
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
              <th>Student Name</th>
              <th>Contact Email</th>
              <th style={{ textAlign: 'center' }}>Attendance Rate</th>
              <th style={{ textAlign: 'center' }}>Merit Points</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No students currently enrolled in this class cohort. Use <strong>"Bulk Student Import"</strong> above to import students from an Excel/CSV sheet.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{s.rollNumber}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
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
              ))
            )}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img
                src={selectedStudent360.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
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
          </div>
        </Modal>
      )}

      {/* BULK STUDENT IMPORT WIZARD MODAL */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Student Import (Excel / CSV Sheet)"
        maxWidth="800px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Progress Steps Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: importStep === 1 ? 700 : 500, color: importStep === 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: importStep >= 1 ? 'var(--primary)' : '#e2e8f0', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  1
                </span>
                <span>Sheet Format</span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: importStep === 2 ? 700 : 500, color: importStep === 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: importStep >= 2 ? 'var(--primary)' : '#e2e8f0', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  2
                </span>
                <span>Column Mapping</span>
              </div>
              <ArrowRight size={14} color="#94a3b8" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: importStep === 3 ? 700 : 500, color: importStep === 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: importStep >= 3 ? 'var(--primary)' : '#e2e8f0', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  3
                </span>
                <span>Preview & Validate</span>
              </div>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Pre-KG to 12th Cohort Support
            </span>
          </div>

          {/* Error Alert Card */}
          {importError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Import Rejected (Atomic Rollback)</div>
                <div style={{ fontSize: '0.825rem', marginTop: '0.2rem', lineHeight: 1.4 }}>{importError}</div>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.35rem' }}>
                  Zero records were saved. Please resolve the issue in your sheet and re-upload.
                </div>
              </div>
            </div>
          )}

          {/* Success Alert Card */}
          {importSuccess && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #34d399',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <CheckCircle2 size={18} />
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{importSuccess}</div>
            </div>
          )}

          {/* STEP 1: Define Sheet Format */}
          {importStep === 1 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Configure the structure of your Excel or CSV file. Define how many columns exist in your spreadsheet so they can be mapped to student properties.
              </p>

              <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Number of Columns in Your Sheet</label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    className="form-input"
                    value={numColumns}
                    onChange={(e) => handleNumColumnsChange(parseInt(e.target.value, 10) || 4)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Example: 4 columns for Name, Roll No, Class, Section
                  </span>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={hasHeaderRow}
                      onChange={(e) => setHasHeaderRow(e.target.checked)}
                    />
                    First row contains column headers (skip row 1)
                  </label>
                </div>
              </div>

              <div className="grid-2" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Default Class / Grade (if column is omitted)</label>
                  <select
                    className="form-select"
                    value={defaultGrade}
                    onChange={(e) => setDefaultGrade(e.target.value)}
                  >
                    {STANDARD_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Section (if column is omitted)</label>
                  <select
                    className="form-select"
                    value={defaultSection}
                    onChange={(e) => setDefaultSection(e.target.value)}
                  >
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setImportStep(2)}
                >
                  Next: Map Columns <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Map Columns */}
          {importStep === 2 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Specify which student property corresponds to each column in your file:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {columnMappings.map((mappedField, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      Column {idx + 1}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maps to:</span>
                      <select
                        className="form-select"
                        style={{ width: '240px' }}
                        value={mappedField}
                        onChange={(e) => handleMappingChange(idx, e.target.value as FieldType)}
                      >
                        <option value="name">Full Name (Required)</option>
                        <option value="rollNumber">Roll Number (Required)</option>
                        <option value="className">Class / Grade (Pre-KG to 12th)</option>
                        <option value="section">Section (A, B, C...)</option>
                        <option value="email">Student Email (Optional)</option>
                        <option value="phone">Phone Number (Optional)</option>
                        <option value="skip">-- Ignore / Skip Column --</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload File Input */}
              <div
                style={{
                  border: '2px dashed var(--primary-border)',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  textAlign: 'center',
                  backgroundColor: '#f0f7ff',
                  marginBottom: '1.25rem',
                }}
              >
                <Upload size={28} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a8a', marginBottom: '0.25rem' }}>
                  Select your Excel (.xlsx, .xls) or CSV (.csv) file
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem' }}>
                  The file will be read and matched with the {numColumns} mapped columns above.
                </p>

                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  id="excel-upload-input"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="excel-upload-input"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                >
                  <FileSpreadsheet size={16} /> Browse File to Preview
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImportStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImportModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Atomic Commit */}
          {importStep === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    Parsed {parsedRows.length} Students from <code>{fileName}</code>
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Review parsed cohort assignments before committing. Any invalid grade or duplicate will cancel the entire batch.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setImportStep(2)}
                >
                  Re-Map Columns
                </button>
              </div>

              {/* Data Preview Table */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <table className="data-table" style={{ margin: 0, fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Student Name</th>
                      <th>Roll #</th>
                      <th>Class / Grade</th>
                      <th>Section</th>
                      <th>Email (Assigned)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{r.name || 'Missing Name'}</td>
                        <td>#{r.rollNumber || 'N/A'}</td>
                        <td>
                          <span className="badge badge-info">{r.className || defaultGrade}</span>
                        </td>
                        <td>{r.section || defaultSection}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {r.email || '(Auto-generated)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setImportStep(2)}
                  disabled={importing}
                >
                  Back
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setImportModalOpen(false)}
                    disabled={importing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleExecuteImport}
                    disabled={importing || parsedRows.length === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                  >
                    {importing ? (
                      <>
                        <RefreshCw size={15} className="spinner" /> Validating & Importing...
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Commit Atomic Import ({parsedRows.length} Students)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
