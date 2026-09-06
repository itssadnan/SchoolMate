import React, { useState, useEffect } from 'react';
import { Award, Plus, Sparkles, Star, Heart, Lightbulb, Users, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '../services/api';

export const Behavior: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [category, setCategory] = useState('Curiosity & Inquiry');
  const [points, setPoints] = useState('2');
  const [note, setNote] = useState('');
  const [recentBehaviors, setRecentBehaviors] = useState<any[]>([]);
  const [awarding, setAwarding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const loadClassData = async () => {
      try {
        const [studentList, behaviorList] = await Promise.all([
          ApiClient.get(`/classes/${selectedClassId}/students`),
          ApiClient.get(`/classes/${selectedClassId}/behaviors`),
        ]);
        setStudents(studentList);
        setRecentBehaviors(behaviorList);
        if (studentList.length > 0) {
          setSelectedStudentId(studentList[0].id);
        }
      } catch (err) {
        console.error('Error loading behavior records:', err);
      }
    };
    loadClassData();
  }, [selectedClassId]);

  const handleAwardMerit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAwarding(true);
    setSuccessMsg(null);
    try {
      await ApiClient.post('/behavior', {
        studentId: selectedStudentId,
        type: 'MERIT',
        category,
        points: Number(points),
        note,
      });

      const st = students.find((s) => s.id === selectedStudentId);
      setSuccessMsg(`Awarded +${points} merit points to ${st?.firstName} ${st?.lastName}!`);
      setNote('');

      // Refresh list
      const updated = await ApiClient.get(`/classes/${selectedClassId}/behaviors`);
      setRecentBehaviors(updated);
    } catch (err: any) {
      alert(`Failed to award merit: ${err.message}`);
    } finally {
      setAwarding(false);
    }
  };

  const categories = [
    { name: 'Curiosity & Inquiry', icon: <Lightbulb size={16} /> },
    { name: 'Leadership & Initiative', icon: <Star size={16} /> },
    { name: 'Collaboration & Teamwork', icon: <Users size={16} /> },
    { name: 'Kindness & Empathy', icon: <Heart size={16} /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Pastoral Care & Positive Praise Hub
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Foster student character growth, intrinsic motivation, and positive reinforcement
        </p>
      </div>

      <div className="grid-2">
        {/* Award Merit Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            Award Positive Merit Badge
          </h3>

          {successMsg && (
            <div
              style={{
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAwardMerit}>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select
                className="form-select"
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

            <div className="form-group">
              <label className="form-label">Recipient Student</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNumber} - {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Character Dimension / Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {categories.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: isSelected ? '#ede9fe' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isSelected ? '#8b5cf6' : 'var(--border-subtle)',
                        color: isSelected ? '#6d28d9' : 'var(--text-main)',
                        justifyContent: 'flex-start',
                        padding: '0.6rem',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {cat.icon}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Points Awarded</label>
              <select
                className="form-select"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              >
                <option value="1">+1 Point (Good Effort)</option>
                <option value="2">+2 Points (Remarkable Contribution)</option>
                <option value="3">+3 Points (Exemplary Leadership)</option>
                <option value="5">+5 Points (Exceptional Milestone)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Praise Note (Shared with Student & Parents)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Explain the specific moment of excellence observed in class..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={awarding}
            >
              <Award size={18} />
              {awarding ? 'Recording Award...' : 'Award Merit to Student'}
            </button>
          </form>
        </div>

        {/* Recent Merits Stream */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            Recent Praise Stream
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
            {recentBehaviors.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={b.student?.avatarUrl}
                      alt={b.student?.firstName}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {b.student?.firstName} {b.student?.lastName}
                    </span>
                  </div>

                  <span className="badge" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                    +{b.points} pts
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                  ⭐ {b.category}
                </div>

                {b.note && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    "{b.note}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
