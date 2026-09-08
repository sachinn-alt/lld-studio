import React from 'react';

interface AttemptHistoryItem {
  attemptNumber: number;
  status: string;
  submittedAt?: string;
  overallScore?: number;
  evaluations?: any[];
}

interface AttemptHistoryViewProps {
  problemTitle: string;
  attempts: AttemptHistoryItem[];
  scoreDelta: number;
  improvedCriteria: string[];
  onSelectAttempt: (attemptNumber: number) => void;
  onStartNewAttempt: () => void;
}

export const AttemptHistoryView: React.FC<AttemptHistoryViewProps> = ({
  problemTitle,
  attempts,
  scoreDelta,
  improvedCriteria,
  onSelectAttempt,
  onStartNewAttempt
}) => {
  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', marginBottom: '8px' }}>
            ITERATION AUDIT LOG
          </span>
          <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>
            Attempt History & Design Delta
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Problem: <strong style={{ color: '#fff' }}>{problemTitle}</strong>
          </p>
        </div>

        <button
          id="btn-new-attempt-history"
          onClick={onStartNewAttempt}
          className="btn btn-primary"
        >
          + Start Next Attempt
        </button>
      </div>

      {/* Progression Banner if 2 or more attempts */}
      {attempts.length >= 2 && (
        <div className="glass-panel" style={{
          padding: '24px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase' }}>
                Progression Delta: Attempt #{attempts.length - 1} → Attempt #{attempts.length}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {scoreDelta > 0 ? `+${scoreDelta} Points Score Improvement! 🎉` : scoreDelta === 0 ? 'Score Maintained' : `${scoreDelta} Points`}
              </div>
              {improvedCriteria.length > 0 && (
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '6px' }}>
                  Strengthened: <strong>{improvedCriteria.join(', ')}</strong>
                </div>
              )}
            </div>

            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: scoreDelta >= 0 ? '#34d399' : '#f87171',
              padding: '6px 16px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)'
            }}>
              {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta}
            </div>
          </div>
        </div>
      )}

      {/* Attempts Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {attempts.map((attempt) => {
          const isCompleted = attempt.status === 'COMPLETED';
          const score = attempt.overallScore ?? 0;
          const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

          return (
            <div
              key={attempt.attemptNumber}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => onSelectAttempt(attempt.attemptNumber)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '1rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  #{attempt.attemptNumber}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      Attempt #{attempt.attemptNumber}
                    </span>
                    <span className={`status-pill status-${attempt.status.toLowerCase()}`}>
                      {attempt.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString() : 'In Progress'}
                  </div>
                </div>
              </div>

              {isCompleted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: scoreColor }}>
                      {score} / 100
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Rubric Score
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Inspect Feedback →
                  </button>
                </div>
              ) : (
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Resume Attempt →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
