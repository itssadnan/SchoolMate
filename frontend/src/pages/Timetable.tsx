import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { ApiClient } from '../services/api';

export const Timetable: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const dayLabels: Record<string, string> = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await ApiClient.get('/timetable');
        setSlots(res);
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Weekly Instructional Timetable
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Room allocations, period schedules, and teaching commitments
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          minHeight: '600px',
        }}
      >
        {days.map((day) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === day);

          return (
            <div
              key={day}
              className="card"
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{dayLabels[day]}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {daySlots.length} Periods
                </span>
              </div>

              {daySlots.map((slot) => {
                return (
                  <div
                    key={slot.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        marginBottom: '0.25rem',
                      }}
                    >
                      <Clock size={12} />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      {slot.classGroup.name}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {slot.subject.name}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: '#64748b',
                        paddingTop: '0.4rem',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <MapPin size={12} /> {slot.room || 'Room 302'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {daySlots.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '2rem 0' }}>
                  No scheduled classes
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
